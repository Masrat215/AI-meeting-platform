   const mongoose = require("mongoose");

   const userSchema = new mongoose.Schema(
     {
       name: { type: String, required: true, trim: true, maxlength: 60 },
       email: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true,
       },
       // We never store the real password, only its scrambled hash
       passwordHash: { type: String, required: true },
     },
     { timestamps: true }
   );

   module.exports = mongoose.model("User", userSchema);