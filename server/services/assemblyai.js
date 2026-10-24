   const axios = require("axios");
   const fs = require("fs");

   const BASE_URL = "https://api.assemblyai.com";

   const getHeaders = () => ({
     authorization: process.env.ASSEMBLYAI_API_KEY,
   });

   const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

   // Call 1: send the audio file to AssemblyAI and get back a temporary URL
   const uploadAudio = async (filePath) => {
     const audioData = await fs.promises.readFile(filePath);
     const response = await axios.post(`${BASE_URL}/v2/upload`, audioData, {
       headers: { ...getHeaders(), "content-type": "application/octet-stream" },
       maxBodyLength: Infinity,
       maxContentLength: Infinity,
     });
     return response.data.upload_url;
   };

   // Call 2: ask AssemblyAI to transcribe that URL
   const requestTranscript = async (audioUrl) => {
     const response = await axios.post(
       `${BASE_URL}/v2/transcript`,
       {
         audio_url: audioUrl,
         speaker_labels: true,
         language_detection: true,
       },
       { headers: getHeaders() }
     );
     return response.data.id;
   };

   // Call 3: keep checking every 3 seconds until the transcript is ready
   const waitForTranscript = async (transcriptId) => {
     for (let attempt = 0; attempt < 200; attempt++) {
       const response = await axios.get(
         `${BASE_URL}/v2/transcript/${transcriptId}`,
         { headers: getHeaders() }
       );
       const transcript = response.data;

       if (transcript.status === "completed") return transcript;
       if (transcript.status === "error") {
         throw new Error(transcript.error || "Transcription failed");
       }

       await sleep(3000);
     }
     throw new Error("Transcription timed out");
   };

   // Runs all three steps and returns the finished transcript
   const transcribeAudio = async (filePath) => {
     const audioUrl = await uploadAudio(filePath);
     const transcriptId = await requestTranscript(audioUrl);
     return waitForTranscript(transcriptId);
   };

   module.exports = { transcribeAudio };