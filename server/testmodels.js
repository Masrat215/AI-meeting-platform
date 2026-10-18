require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db");
const Meeting = require("./models/Meeting");
const Transcript = require("./models/Transcript");
const Summary = require("./models/Summary");

const runTest = async () => {
  await connectDB();

  const meeting = await Meeting.create({ title: "Test Meeting" });

  await Transcript.create({
    meetingId: meeting._id,
    fullText: "Hello everyone. Let's start the project review.",
    speakerSegments: [
      { speaker: "A", text: "Hello everyone.", start: 0, end: 1500 },
      { speaker: "B", text: "Let's start the project review.", start: 1600, end: 3500 },
    ],
  });

  await Summary.create({
    meetingId: meeting._id,
    summaryText: "The team started the project review.",
    actionItems: [
      { task: "Prepare review slides", assignee: "Sample User", deadline: "Friday" },
    ],
  });

  console.log("Test data saved. Meeting ID:", meeting._id.toString());
  await mongoose.connection.close();
};

runTest();