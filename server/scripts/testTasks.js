require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../db");
const User = require("../models/User");
const Meeting = require("../models/Meeting");
const Summary = require("../models/Summary");

// The backend must be running (npm run dev) in another terminal
const BASE = `http://localhost:${process.env.PORT || 5000}`;
const stamp = Date.now();
const emailA = `ta${stamp}@scribwave-test.example`;
const emailB = `tb${stamp}@scribwave-test.example`;
const PASSWORD = "TestPassword123";

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

// Removes every account, meeting and summary created by this test
const cleanup = async () => {
  const testUsers = await User.find({
    email: /@scribwave-test\.example$/,
  }).select("_id");
  const userIds = testUsers.map((user) => user._id);

  const meetings = await Meeting.find({ owner: { $in: userIds } }).select("_id");
  const meetingIds = meetings.map((meeting) => meeting._id);

  await Summary.deleteMany({ meetingId: { $in: meetingIds } });
  await Meeting.deleteMany({ _id: { $in: meetingIds } });
  await User.deleteMany({ _id: { $in: userIds } });
};

// Reads one action item straight from the database
const readItem = async (meetingId, itemId) => {
  const summary = await Summary.findOne({ meetingId });
  return summary ? summary.actionItems.id(itemId) : null;
};

const run = async () => {
  await connectDB();
  console.log(`Testing ${BASE}\n`);

  // ---------- Set up two accounts and one meeting ----------
  const registerA = await call("POST", "/api/auth/register", {
    body: { name: "Task Tester A", email: emailA, password: PASSWORD },
  });
  const tokenA = registerA.data?.token;
  check(
    "Register account A",
    registerA.status === 201 && !!tokenA,
    `(status ${registerA.status})`
  );

  const registerB = await call("POST", "/api/auth/register", {
    body: { name: "Task Tester B", email: emailB, password: PASSWORD },
  });
  const tokenB = registerB.data?.token;
  check(
    "Register account B",
    registerB.status === 201 && !!tokenB,
    `(status ${registerB.status})`
  );

  const userA = await User.findOne({ email: emailA });
  const meeting = await Meeting.create({
    owner: userA._id,
    title: "Task test meeting",
    status: "done",
  });
  const summary = await Summary.create({
    meetingId: meeting._id,
    summaryText: "Test summary",
    actionItems: [
      { task: "Prepare the slides", assignee: "Priya", deadline: "Friday" },
      { task: "Test the application", assignee: "Amit", deadline: "Monday" },
      { task: "Send the report" },
    ],
  });
  const meetingId = meeting._id.toString();
  const itemId = summary.actionItems[0]._id.toString();
  const itemPath = `/api/meetings/${meetingId}/actions/${itemId}`;

  // ---------- Listing tasks ----------
  const noToken = await call("GET", "/api/tasks");
  check("Task list without a token is refused", noToken.status === 401);

  const all = await call("GET", "/api/tasks", { token: tokenA });
  check(
    "The task list shows all 3 action items",
    all.status === 200 &&
      all.data?.tasks?.length === 3 &&
      all.data?.counts?.all === 3,
    `(status ${all.status})`
  );
  check(
    "All 3 start as open",
    all.data?.counts?.open === 3 && all.data?.counts?.done === 0
  );
  check(
    "Each task knows which meeting it came from",
    all.data?.tasks?.[0]?.meetingTitle === "Task test meeting" &&
      all.data?.tasks?.[0]?.meetingId === meetingId
  );

  // ---------- Ticking a task ----------
  const tick = await call("PATCH", itemPath, {
    token: tokenA,
    body: { completed: true },
  });
  check(
    "Ticking a task works",
    tick.status === 200 && tick.data?.item?.completed === true,
    `(status ${tick.status})`
  );

  const ticked = await readItem(meeting._id, itemId);
  check(
    "The tick is saved in the database with a time",
    ticked?.completed === true && !!ticked?.completedAt
  );

  const doneList = await call("GET", "/api/tasks?status=done", { token: tokenA });
  check(
    "The Done filter shows 1 task",
    doneList.data?.tasks?.length === 1 && doneList.data?.counts?.done === 1
  );

  const openList = await call("GET", "/api/tasks?status=open", { token: tokenA });
  check(
    "The Open filter shows 2 tasks",
    openList.data?.tasks?.length === 2 && openList.data?.counts?.open === 2
  );

  const detail = await call("GET", `/api/meetings/${meetingId}`, {
    token: tokenA,
  });
  const detailItem = detail.data?.summary?.actionItems?.find(
    (item) => item._id === itemId
  );
  check(
    "The meeting page data shows the tick",
    detail.status === 200 && detailItem?.completed === true
  );

  // ---------- Unticking a task ----------
  const untick = await call("PATCH", itemPath, {
    token: tokenA,
    body: { completed: false },
  });
  check(
    "Unticking a task works",
    untick.status === 200 && untick.data?.item?.completed === false,
    `(status ${untick.status})`
  );

  const unticked = await readItem(meeting._id, itemId);
  check(
    "Unticking clears the time",
    unticked?.completed === false && !unticked?.completedAt
  );

  // ---------- Bad requests ----------
  const badValue = await call("PATCH", itemPath, {
    token: tokenA,
    body: { completed: "yes" },
  });
  check(
    "A value that is not true or false is refused (400)",
    badValue.status === 400,
    `(status ${badValue.status})`
  );

  const unknownItem = await call(
    "PATCH",
    `/api/meetings/${meetingId}/actions/000000000000000000000000`,
    { token: tokenA, body: { completed: true } }
  );
  check(
    "An unknown action item gives 404",
    unknownItem.status === 404,
    `(status ${unknownItem.status})`
  );

  const madeUpItem = await call(
    "PATCH",
    `/api/meetings/${meetingId}/actions/not-a-real-id`,
    { token: tokenA, body: { completed: true } }
  );
  check(
    "A made-up item address gives 404",
    madeUpItem.status === 404,
    `(status ${madeUpItem.status})`
  );

  const noTokenPatch = await call("PATCH", itemPath, {
    body: { completed: true },
  });
  check("Ticking without a token is refused", noTokenPatch.status === 401);

  // ---------- Privacy ----------
  const otherTick = await call("PATCH", itemPath, {
    token: tokenB,
    body: { completed: true },
  });
  check(
    "Another account cannot tick this task (404)",
    otherTick.status === 404,
    `(status ${otherTick.status})`
  );

  const untouched = await readItem(meeting._id, itemId);
  check(
    "The other account's attempt changed nothing",
    untouched?.completed === false
  );

  const otherList = await call("GET", "/api/tasks", { token: tokenB });
  check(
    "Another account's task list is empty",
    otherList.status === 200 &&
      otherList.data?.tasks?.length === 0 &&
      otherList.data?.counts?.all === 0,
    `(status ${otherList.status})`
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
