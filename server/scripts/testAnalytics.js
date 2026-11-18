require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../db");
const User = require("../models/User");
const Meeting = require("../models/Meeting");
const Transcript = require("../models/Transcript");
const Summary = require("../models/Summary");

// The backend must be running (npm run dev) in another terminal
const BASE = `http://localhost:${process.env.PORT || 5000}`;
const stamp = Date.now();
const emailA = `ya${stamp}@scribwave-test.example`;
const emailB = `yb${stamp}@scribwave-test.example`;
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

// Removes every account, meeting, transcript and summary created by this test
const cleanup = async () => {
  const testUsers = await User.find({
    email: /@scribwave-test\.example$/,
  }).select("_id");
  const userIds = testUsers.map((user) => user._id);

  const meetings = await Meeting.find({ owner: { $in: userIds } }).select("_id");
  const meetingIds = meetings.map((meeting) => meeting._id);

  await Transcript.deleteMany({ meetingId: { $in: meetingIds } });
  await Summary.deleteMany({ meetingId: { $in: meetingIds } });
  await Meeting.deleteMany({ _id: { $in: meetingIds } });
  await User.deleteMany({ _id: { $in: userIds } });
};

// Creates a meeting and sets its date directly, so that the test controls it exactly
const makeMeeting = async (owner, fields, daysAgo) => {
  const meeting = await Meeting.create({ owner, ...fields });
  await Meeting.collection.updateOne(
    { _id: meeting._id },
    { $set: { createdAt: new Date(Date.now() - daysAgo * DAY) } }
  );
  return meeting;
};

const run = async () => {
  await connectDB();
  console.log(`Testing ${BASE}\n`);

  // ---------- Two accounts ----------
  const registerA = await call("POST", "/api/auth/register", {
    body: { name: "Analytics Tester A", email: emailA, password: PASSWORD },
  });
  const tokenA = registerA.data?.token;
  check(
    "Register account A",
    registerA.status === 201 && !!tokenA,
    `(status ${registerA.status})`
  );

  const registerB = await call("POST", "/api/auth/register", {
    body: { name: "Analytics Tester B", email: emailB, password: PASSWORD },
  });
  const tokenB = registerB.data?.token;
  check(
    "Register account B",
    registerB.status === 201 && !!tokenB,
    `(status ${registerB.status})`
  );

  // ---------- Meetings for account A ----------
  const userA = await User.findOne({ email: emailA });

  const m1 = await makeMeeting(
    userA._id,
    { title: "Analytics one", status: "done", durationMs: 600000 },
    0
  );
  const m2 = await makeMeeting(
    userA._id,
    { title: "Analytics two", status: "done", durationMs: 900000 },
    0
  );
  // An older meeting with no saved length: it is worked out from the transcript
  const m3 = await makeMeeting(
    userA._id,
    { title: "Analytics three", status: "done" },
    14
  );
  await makeMeeting(userA._id, { title: "Analytics four", status: "failed" }, 20);
  await makeMeeting(
    userA._id,
    { title: "Analytics five", status: "summarizing" },
    30
  );

  await Transcript.create({
    meetingId: m3._id,
    fullText: "hello",
    speakerSegments: [{ speaker: "A", text: "hello", start: 0, end: 300000 }],
  });

  await Summary.create({
    meetingId: m1._id,
    summaryText: "One",
    actionItems: [
      { task: "Task 1", assignee: "Priya", completed: true },
      { task: "Task 2", assignee: "priya", completed: false },
      { task: "Task 3", assignee: "Amit", completed: false },
    ],
  });
  await Summary.create({
    meetingId: m2._id,
    summaryText: "Two",
    actionItems: [
      { task: "Task 4", assignee: "Unassigned", completed: false },
      { task: "Task 5", assignee: "Amit", completed: true },
    ],
  });

  // ---------- Reading the analytics ----------
  const noToken = await call("GET", "/api/analytics");
  check("Analytics without a token is refused", noToken.status === 401);

  const result = await call("GET", "/api/analytics?offset=0", { token: tokenA });
  const data = result.data;
  check("Analytics answers 200", result.status === 200, `(status ${result.status})`);

  check(
    "Meeting counts: 5 in total, 3 done, 1 failed, 1 in progress",
    data?.totals?.meetings === 5 &&
      data?.totals?.done === 3 &&
      data?.totals?.failed === 1 &&
      data?.totals?.processing === 1,
    JSON.stringify(data?.totals)
  );
  check(
    "Recorded time is 10 + 15 + 5 minutes (the old meeting uses its transcript)",
    data?.totals?.recordedMs === 1800000,
    `(${data?.totals?.recordedMs})`
  );
  check(
    "The average length is 10 minutes",
    data?.totals?.averageMs === 600000,
    `(${data?.totals?.averageMs})`
  );
  check(
    "Tasks: 5 in total, 2 done, 3 open, 40 percent",
    data?.tasks?.total === 5 &&
      data?.tasks?.done === 2 &&
      data?.tasks?.open === 3 &&
      data?.tasks?.rate === 40,
    JSON.stringify(data?.tasks)
  );
  check(
    "There are 8 weeks, and today's meetings are in the last one",
    data?.weeks?.length === 8 && data?.weeks?.[7]?.count === 2,
    JSON.stringify(data?.weeks?.map((w) => w.count))
  );
  check(
    "All 5 meetings are inside the 8 weeks",
    data?.weeks?.reduce((sum, week) => sum + week.count, 0) === 5
  );

  const priya = data?.people?.find((p) => p.name.toLowerCase() === "priya");
  check(
    "Priya and priya are counted as one person (1 done, 1 open)",
    data?.people?.length === 3 && priya?.done === 1 && priya?.open === 1,
    JSON.stringify(data?.people)
  );

  const withZone = await call("GET", "/api/analytics?offset=330", { token: tokenA });
  check(
    "A time zone (India, 330) is accepted",
    withZone.status === 200 && withZone.data?.weeks?.length === 8
  );

  const badZone = await call("GET", "/api/analytics?offset=banana", { token: tokenA });
  check(
    "A time zone that is not a number is ignored",
    badZone.status === 200 && badZone.data?.totals?.meetings === 5
  );

  // ---------- The length is saved with a new meeting ----------
  const saved = await Meeting.findById(m1._id);
  check("durationMs is stored on the meeting", saved?.durationMs === 600000);

  // ---------- Privacy ----------
  const other = await call("GET", "/api/analytics", { token: tokenB });
  check(
    "Another account sees zeros",
    other.status === 200 &&
      other.data?.totals?.meetings === 0 &&
      other.data?.tasks?.total === 0 &&
      other.data?.people?.length === 0,
    JSON.stringify(other.data?.totals)
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
