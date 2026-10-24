   const Meeting = require("../models/Meeting");
   const Transcript = require("../models/Transcript");
   const Summary = require("../models/Summary");
   const { transcribeAudio } = require("./assemblyai");
   const { generateSummary } = require("./gemini");

   const processMeeting = async (meetingId) => {
     let stage = "transcription";

     try {
       // ---- Part 1: transcription ----
             const meeting = await Meeting.findByIdAndUpdate(
        meetingId,
        { status: "transcribing" },
        { returnDocument: "after" }
      );

       const result = await transcribeAudio(meeting.audioFilePath);

       const speakerSegments = (result.utterances || []).map((u) => ({
         speaker: u.speaker,
         text: u.text,
         start: u.start,
         end: u.end,
       }));
       const fullText = result.text || "";

       await Transcript.create({ meetingId, fullText, speakerSegments });
       await Meeting.findByIdAndUpdate(meetingId, { status: "transcribed" });
       console.log(`Meeting ${meetingId} transcribed`);

       // ---- Part 2: summary and action items ----
       stage = "summary";
       await Meeting.findByIdAndUpdate(meetingId, { status: "summarizing" });

       if (!fullText.trim()) {
         await Summary.create({
           meetingId,
           summaryText: "No speech was detected in this recording.",
           actionItems: [],
         });
       } else {
         // Give the AI the speaker-labelled version when we have it
         const transcriptText =
           speakerSegments.length > 0
             ? speakerSegments.map((s) => `Speaker ${s.speaker}: ${s.text}`).join("\n")
             : fullText;

         const { summary, actionItems } = await generateSummary(transcriptText);
         await Summary.create({ meetingId, summaryText: summary, actionItems });
       }

       await Meeting.findByIdAndUpdate(meetingId, { status: "done" });
       console.log(`Meeting ${meetingId} summarized`);
     } catch (error) {
       const message = error.response?.data?.error || error.message;
       console.error(`Processing failed for meeting ${meetingId} (${stage}):`, message);
       await Meeting.findByIdAndUpdate(meetingId, {
         status: "failed",
         errorMessage: `Failed during ${stage}: ${message}`,
       });
     }
   };

   module.exports = { processMeeting };