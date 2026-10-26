   const mongoose = require("mongoose");

   const meetingSchema = new mongoose.Schema(
     {
       // The user who uploaded this meeting
       owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
       title: { type: String, required: true, trim: true },
       originalFileName: { type: String },
       audioFilePath: { type: String },
       status: {
         type: String,
         enum: [
           "uploaded",
           "transcribing",
           "transcribed",
           "summarizing",
           "done",
           "failed",
         ],
         default: "uploaded",
       },
       createdBy: { type: String, default: "Guest" },
       errorMessage: { type: String },
     },
     { timestamps: true }
   );

   module.exports = mongoose.model("Meeting", meetingSchema);