require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../db");
const User = require("../models/User");
const Meeting = require("../models/Meeting");

// The backend must be running (npm run dev) in another terminal
const BASE = `http://localhost:${process.env.PORT || 5000}`;
const stamp = Date.now();
const emailA = `sa${stamp}@scribwave-test.example`;
const emailB = `sb${stamp}@scribwave-test.example`;
const PASSWORD = "TestPassword123";
const DAY = 24 * 60 * 60 * 1000;

let passed = 0;
let failed = 0;

const check = (name, condition, details = "") => {
  if (condition) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL  ${name}  ${details}`);
  }
};

// Sends one request to the backend and returns { status, data }
const call = async (method, path, { token, body } = {}) => {
  const response = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // some responses have no JSON body
  }
  return { status: response.status, data };
};

// Removes every account and meeting created by this test
const cleanup = async () => {
  const testUsers = await User.find({
    email: /@scribwave-test\.example$/,
  }).select("_id");
  const userIds = testUsers.map((user) => user._id);

  await Meeting.deleteMany({ owner: { $in: userIds } });
  await User.deleteMany({ _id: { $in: userIds } });
};

const titlesOf = (result) => (result.data?.meetings || []).map((m) => m.title);
const iso = (daysAgo) => new Date(Date.now() - daysAgo * DAY).toISOString();

const run = async () => {
  await connectDB();
  console.log(`Testing ${BASE}\n`);

  // ---------- Set up two accounts ----------
  const registerA = await call("POST", "/api/auth/register", {
    body: { name: "Search Tester A", email: emailA, password: PASSWORD },
  });
  const tokenA = registerA.data?.token;
  check(
    "Register account A",
    registerA.status === 201 && !!tokenA,
    `(status ${registerA.status})`
  );

  const registerB = await call("POST", "/api/auth/register", {
    body: { name: "Search Tester B", email: emailB, password: PASSWORD },
  });
  const tokenB = registerB.data?.token;
  check(
    "Register account B",
    registerB.status === 201 && !!tokenB,
    `(status ${registerB.status})`
  );

  // ---------- Five meetings for account A, with known dates ----------
  const userA = await User.findOne({ email: emailA });
  const samples = [
    { title: "Weekly project review", file: "weekly.mp3", status: "done", daysAgo: 1 },
    { title: "Budget planning (Q4)", file: "budget.wav", status: "done", daysAgo: 10 },
    { title: "Client call - Acme", file: "acme.m4a", status: "failed", daysAgo: 20 },
    { title: "Design sync", file: "design.mp3", status: "summarizing", daysAgo: 2 },
    { title: "Retro 100% meeting", file: "retro.mp3", status: "done", daysAgo: 40 },
  ];

  for (const sample of samples) {
    const meeting = await Meeting.create({
      owner: userA._id,
      title: sample.title,
      originalFileName: sample.file,
      status: sample.status,
    });
    // Set the date directly, so that the test controls it exactly
    await Meeting.collection.updateOne(
      { _id: meeting._id },
      { $set: { createdAt: new Date(Date.now() - sample.daysAgo * DAY) } }
    );
  }

  // ---------- Basic list ----------
  const noToken = await call("GET", "/api/meetings");
  check("The list without a token is refused", noToken.status === 401);

  const all = await call("GET", "/api/meetings", { token: tokenA });
  check(
    "The list returns all 5 meetings",
    all.status === 200 && all.data?.meetings?.length === 5 && all.data?.total === 5,
    `(status ${all.status})`
  );
  check(
    "The stats count every meeting (3 done, 1 in progress, 1 failed)",
    all.data?.stats?.total === 5 &&
      all.data?.stats?.done === 3 &&
      all.data?.stats?.processing === 1 &&
      all.data?.stats?.failed === 1,
    JSON.stringify(all.data?.stats)
  );
  check(
    "The newest meeting comes first by default",
    titlesOf(all)[0] === "Weekly project review"
  );

  // ---------- Search ----------
  const byPart = await call("GET", "/api/meetings?q=PROJECT", { token: tokenA });
  check(
    "Searching part of a title works, in any letter case",
    titlesOf(byPart).length === 1 && titlesOf(byPart)[0] === "Weekly project review",
    JSON.stringify(titlesOf(byPart))
  );

  const byFile = await call("GET", "/api/meetings?q=weekly.mp3", { token: tokenA });
  check(
    "Searching a file name works",
    titlesOf(byFile).length === 1,
    JSON.stringify(titlesOf(byFile))
  );

  const wildcard = await call("GET", `/api/meetings?q=${encodeURIComponent(".*")}`, {
    token: tokenA,
  });
  check(
    "Typing .* finds nothing, because it is treated as plain text",
    wildcard.status === 200 && titlesOf(wildcard).length === 0,
    `(status ${wildcard.status}, ${titlesOf(wildcard).length} found)`
  );

  const brackets = await call("GET", `/api/meetings?q=${encodeURIComponent("(Q4)")}`, {
    token: tokenA,
  });
  check(
    "Brackets in a search do not crash it",
    brackets.status === 200 && titlesOf(brackets).length === 1,
    `(status ${brackets.status})`
  );

  const longText = await call("GET", `/api/meetings?q=${"a".repeat(300)}`, {
    token: tokenA,
  });
  check("A very long search does not crash it", longText.status === 200);

  // ---------- Status filter ----------
  const done = await call("GET", "/api/meetings?status=done", { token: tokenA });
  check("Status done shows 3", done.data?.total === 3, `(${done.data?.total})`);

  const working = await call("GET", "/api/meetings?status=processing", {
    token: tokenA,
  });
  check(
    "Status processing shows 1",
    working.data?.total === 1 && titlesOf(working)[0] === "Design sync"
  );

  const failedOnes = await call("GET", "/api/meetings?status=failed", {
    token: tokenA,
  });
  check("Status failed shows 1", failedOnes.data?.total === 1);
  check(
    "The stats do not change when a filter is used",
    failedOnes.data?.stats?.total === 5
  );

  const oddStatus = await call("GET", "/api/meetings?status=banana", {
    token: tokenA,
  });
  check("An unknown status is ignored", oddStatus.data?.total === 5);

  // ---------- Sorting ----------
  const oldest = await call("GET", "/api/meetings?sort=oldest", { token: tokenA });
  check(
    "Sort oldest puts the 40 day old meeting first",
    titlesOf(oldest)[0] === "Retro 100% meeting"
  );

  const byTitle = await call("GET", "/api/meetings?sort=title", { token: tokenA });
  check(
    "Sort by title puts Budget first and Weekly last",
    titlesOf(byTitle)[0] === "Budget planning (Q4)" &&
      titlesOf(byTitle)[4] === "Weekly project review",
    JSON.stringify(titlesOf(byTitle))
  );

  // ---------- Date range ----------
  const recent = await call(
    "GET",
    `/api/meetings?from=${encodeURIComponent(iso(12))}&to=${encodeURIComponent(iso(0))}`,
    { token: tokenA }
  );
  check(
    "A date range of the last 12 days shows 3 meetings",
    recent.data?.total === 3,
    `(${recent.data?.total})`
  );

  const middle = await call(
    "GET",
    `/api/meetings?from=${encodeURIComponent(iso(30))}&to=${encodeURIComponent(iso(15))}`,
    { token: tokenA }
  );
  check(
    "A range of 30 to 15 days ago shows only the 20 day old meeting",
    middle.data?.total === 1 && titlesOf(middle)[0] === "Client call - Acme",
    JSON.stringify(titlesOf(middle))
  );

  const badDate = await call("GET", "/api/meetings?from=garbage", { token: tokenA });
  check(
    "A date that is not real is ignored",
    badDate.status === 200 && badDate.data?.total === 5
  );

  // ---------- Load more ----------
  const firstTwo = await call("GET", "/api/meetings?limit=2", { token: tokenA });
  check(
    "limit=2 returns 2 meetings and says there are more",
    firstTwo.data?.meetings?.length === 2 &&
      firstTwo.data?.total === 5 &&
      firstTwo.data?.hasMore === true
  );

  const everything = await call("GET", "/api/meetings?limit=5", { token: tokenA });
  check(
    "limit=5 returns all and says there is no more",
    everything.data?.meetings?.length === 5 && everything.data?.hasMore === false
  );

  // ---------- Privacy ----------
  const other = await call("GET", "/api/meetings", { token: tokenB });
  check(
    "Another account sees no meetings and zero stats",
    other.status === 200 &&
      other.data?.meetings?.length === 0 &&
      other.data?.stats?.total === 0,
    `(status ${other.status})`
  );

  const otherSearch = await call("GET", "/api/meetings?q=project", { token: tokenB });
  check(
    "Another account cannot find these meetings by searching",
    otherSearch.data?.total === 0
  );

  // ---------- Finish ----------
  await cleanup();
  console.log(`\n${passed} passed, ${failed} failed`);
  await mongoose.connection.close();
  process.exit(failed === 0 ? 0 : 1);
};

run().catch(async (error) => {
  console.error("\nThe test run stopped:", error.message);
  console.error("Is the backend running? Start it with: npm run dev");
  try {
    await cleanup();
  } catch {
    // ignore
  }
  await mongoose.connection.close();
  process.exit(1);
});
