   require("dotenv").config();
   const mongoose = require("mongoose");
   const connectDB = require("../db");
   const Meeting = require("../models/Meeting");
   const Transcript = require("../models/Transcript");
   const Summary = require("../models/Summary");
   const User = require("../models/User");

   const run = async () => {
     const [action, email] = process.argv.slice(2);
     await connectDB();

     // owner: null matches meetings that have no owner at all
     const orphans = await Meeting.find({ owner: null });
     console.log(`Meetings without an owner: ${orphans.length}`);

     if (action === "assign") {
       const user = await User.findOne({
         email: String(email || "").toLowerCase(),
       });
       if (!user) {
         console.log("No account with that email. Register first.");
       } else {
         const result = await Meeting.updateMany(
           { owner: null },
           { owner: user._id }
         );
         console.log(`Assigned ${result.modifiedCount} meetings to ${user.email}`);
       }
     } else if (action === "delete") {
       const ids = orphans.map((m) => m._id);
       await Transcript.deleteMany({ meetingId: { $in: ids } });
       await Summary.deleteMany({ meetingId: { $in: ids } });
       await Meeting.deleteMany({ _id: { $in: ids } });
       console.log(`Deleted ${ids.length} meetings and their results`);
     } else {
       console.log("Usage:");
       console.log("  node scripts/assignOwner.js assign your@email.com");
       console.log("  node scripts/assignOwner.js delete");
     }

     await mongoose.connection.close();
   };

   run();