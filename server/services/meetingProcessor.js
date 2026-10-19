const Meeting = require("../models/Meeting");
const Transcript = require("../models/Transcript");
const { transcribeAudio } = require("./assemblyai");

const processMeeting = async (meetingId) => {
  try {
    // 1. Mark the meeting as being transcribed
    const meeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { status: "transcribing" },
      { new: true }
    );

    // 2. Get the transcript from AssemblyAI
    const result = await transcribeAudio(meeting.audioFilePath);

    // 3. Keep only the speaker information we need
    const speakerSegments = (result.utterances || []).map((u) => ({
      speaker: u.speaker,
      text: u.text,
      start: u.start,
      end: u.end,
    }));

    // 4. Save the transcript in the database
    await Transcript.create({
      meetingId,
      fullText: result.text || "",
      speakerSegments,
    });

    // 5. Mark the meeting as transcribed
    await Meeting.findByIdAndUpdate(meetingId, { status: "transcribed" });
    console.log(`Meeting ${meetingId} transcribed`);
  } catch (error) {
    const message = error.response?.data?.error || error.message;
    console.error(`Processing failed for meeting ${meetingId}:`, message);
    await Meeting.findByIdAndUpdate(meetingId, {
      status: "failed",
      errorMessage: message,
    });
  }
};

module.exports = { processMeeting };