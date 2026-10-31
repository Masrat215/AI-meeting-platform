   require("dotenv").config();
   const bcrypt = require("bcryptjs");
   const mongoose = require("mongoose");
   const connectDB = require("../db");
   const User = require("../models/User");

   const run = async () => {
     const [action, email, password] = process.argv.slice(2);

     if (!["check", "verify", "reset"].includes(action) || !email) {
       console.log("Usage:");
       console.log("  node scripts/accountTool.js check your@email.com");
       console.log("  node scripts/accountTool.js verify your@email.com 'YourPassword'");
       console.log("  node scripts/accountTool.js reset your@email.com 'NewPassword123'");
       return;
     }

     await connectDB();

     try {
       console.log(`Database host: ${mongoose.connection.host}`);
       console.log(`Database name: ${mongoose.connection.name}`);
       console.log(`Accounts in this database: ${await User.countDocuments()}`);

       const latest = await User.find()
         .sort({ createdAt: -1 })
         .limit(5)
         .select("email createdAt");
       console.log("Latest accounts:");
       latest.forEach((u) => console.log(`  ${u.email}  (${u.createdAt.toISOString()})`));

       const user = await User.findOne({ email: email.trim().toLowerCase() });
       if (!user) {
         console.log("\nRESULT: no account with that email in THIS database");
         return;
       }
       console.log(`\nRESULT: account found (${user.email})`);

       if (action === "verify") {
         const ok = await bcrypt.compare(password || "", user.passwordHash);
         console.log(
           ok
             ? "RESULT: the password MATCHES"
             : "RESULT: the password does NOT match"
         );
       }

       if (action === "reset") {
         if (!password || password.length < 8) {
           console.log("The new password must be at least 8 characters.");
         } else {
           user.passwordHash = await bcrypt.hash(password, 10);
           await user.save();
           console.log("Password updated.");
         }
       }
     } finally {
       await mongoose.connection.close();
     }
   };

   run();