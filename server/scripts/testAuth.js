   require("dotenv").config();
   const mongoose = require("mongoose");
   const connectDB = require("../db");
   const User = require("../models/User");
   const Meeting = require("../models/Meeting");

   // The backend must be running (npm run dev) in another terminal
   const BASE = `http://localhost:${process.env.PORT || 5000}`;
   const stamp = Date.now();
   const emailA = `a${stamp}@scribwave-test.example`;
   const emailB = `b${stamp}@scribwave-test.example`;
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

   // Removes every account and meeting created by this test
   const cleanup = async () => {
     const testUsers = await User.find({
       email: /@scribwave-test\.example$/,
     }).select("_id");
     const ids = testUsers.map((user) => user._id);
     await Meeting.deleteMany({ owner: { $in: ids } });
     await User.deleteMany({ _id: { $in: ids } });
   };

   const run = async () => {
     await connectDB();
     console.log(`Testing ${BASE}\n`);

     // ---------- Registration ----------
     const registerA = await call("POST", "/api/auth/register", {
       body: { name: "Test User A", email: emailA, password: PASSWORD },
     });
     check(
       "Register a new account",
       registerA.status === 201 && !!registerA.data?.token,
       `(status ${registerA.status})`
     );
     const tokenA = registerA.data?.token;

     const duplicate = await call("POST", "/api/auth/register", {
       body: { name: "Test User A", email: emailA, password: PASSWORD },
     });
     check(
       "Registering the same email again is refused",
       duplicate.status === 409,
       `(status ${duplicate.status})`
     );

     const shortPassword = await call("POST", "/api/auth/register", {
       body: { name: "Short", email: `s${stamp}@scribwave-test.example`, password: "abc" },
     });
     check(
       "A too-short password is refused",
       shortPassword.status === 400,
       `(status ${shortPassword.status})`
     );

     const badEmail = await call("POST", "/api/auth/register", {
       body: { name: "Bad Email", email: "not-an-email", password: PASSWORD },
     });
     check(
       "An invalid email is refused",
       badEmail.status === 400,
       `(status ${badEmail.status})`
     );

     // ---------- Login ----------
     const loginOk = await call("POST", "/api/auth/login", {
       body: { email: emailA, password: PASSWORD },
     });
     check(
       "Login with the correct password",
       loginOk.status === 200 && !!loginOk.data?.token,
       `(status ${loginOk.status})`
     );

     const wrongPassword = await call("POST", "/api/auth/login", {
       body: { email: emailA, password: "WrongPassword999" },
     });
     check(
       "Login with a wrong password is refused",
       wrongPassword.status === 401,
       `(status ${wrongPassword.status})`
     );

     const unknownEmail = await call("POST", "/api/auth/login", {
       body: { email: `nobody${stamp}@scribwave-test.example`, password: PASSWORD },
     });
     check(
       "An unknown email is refused with the same message",
       unknownEmail.status === 401 &&
         unknownEmail.data?.error === wrongPassword.data?.error,
       `(status ${unknownEmail.status})`
     );

     // ---------- Who am I ----------
     const me = await call("GET", "/api/auth/me", { token: tokenA });
     check(
       "/me returns the logged-in user",
       me.status === 200 && me.data?.user?.email === emailA,
       `(status ${me.status})`
     );

     const meNoToken = await call("GET", "/api/auth/me");
     check("/me without a token is refused", meNoToken.status === 401);

     const meFake = await call("GET", "/api/auth/me", {
       token: "this.is.not-a-real-token",
     });
     check("/me with a fake token is refused", meFake.status === 401);

     // ---------- Meetings need a login ----------
     const listNoToken = await call("GET", "/api/meetings");
     check("Meetings list without a token is refused", listNoToken.status === 401);

     const listA = await call("GET", "/api/meetings", { token: tokenA });
     check(
       "A new account starts with no meetings",
       listA.status === 200 && Array.isArray(listA.data) && listA.data.length === 0,
       `(status ${listA.status})`
     );

     const uploadNoToken = await call("POST", "/api/meetings/upload");
     check("Upload without a token is refused", uploadNoToken.status === 401);

     const uploadNoFile = await call("POST", "/api/meetings/upload", {
       token: tokenA,
     });
     check(
       "Upload with a token but no file asks for a file",
       uploadNoFile.status === 400,
       `(status ${uploadNoFile.status})`
     );

     // ---------- Accounts are separate ----------
     const registerB = await call("POST", "/api/auth/register", {
       body: { name: "Test User B", email: emailB, password: PASSWORD },
     });
     const tokenB = registerB.data?.token;
     check(
       "Register a second account",
       registerB.status === 201 && !!tokenB,
       `(status ${registerB.status})`
     );

     // Create a meeting owned by account A directly in the database
     const userA = await User.findOne({ email: emailA });
     const meetingA = await Meeting.create({
       owner: userA._id,
       title: "Test meeting (safe to delete)",
       status: "done",
     });
     const id = meetingA._id.toString();

     const ownGet = await call("GET", `/api/meetings/${id}`, { token: tokenA });
     check(
       "The owner can open their own meeting",
       ownGet.status === 200,
       `(status ${ownGet.status})`
     );

     const otherGet = await call("GET", `/api/meetings/${id}`, { token: tokenB });
     check(
       "Another account cannot open it (404)",
       otherGet.status === 404,
       `(status ${otherGet.status})`
     );

     const otherList = await call("GET", "/api/meetings", { token: tokenB });
     check(
       "Another account's list does not show it",
       otherList.status === 200 && otherList.data?.length === 0,
       `(status ${otherList.status})`
     );

     const otherDelete = await call("DELETE", `/api/meetings/${id}`, {
       token: tokenB,
     });
     check(
       "Another account cannot delete it (404)",
       otherDelete.status === 404,
       `(status ${otherDelete.status})`
     );

     const stillThere = await call("GET", "/api/meetings", { token: tokenA });
     check(
       "The owner still has the meeting after that attempt",
       stillThere.data?.length === 1
     );

     const badId = await call("GET", "/api/meetings/not-a-real-id", {
       token: tokenA,
     });
     check(
       "A made-up meeting address gives 404",
       badId.status === 404,
       `(status ${badId.status})`
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