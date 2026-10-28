   require("dotenv").config();
   const bcrypt = require("bcryptjs");
   const mongoose = require("mongoose");
   const connectDB = require("../db");
   const User = require("../models/User");

   const run = async () => {
     const [action, email, newPassword] = process.argv.slice(2);

     if (!["check", "reset"].includes(action) || !email) {
       console.log("Usage:");
       console.log("  node scripts/accountTool.js check your@email.com");
       console.log("  node scripts/accountTool.js reset your@email.com NewPassword123");
       return;
     }

     await connectDB();
     console.log(`Database: ${mongoose.connection.name}`);
     console.log(`Accounts in this database: ${await User.countDocuments()}`);

     const user = await User.findOne({ email: email.trim().toLowerCase() });
     console.log(user ? `Account found: ${user.email}` : "No account with that email");

     if (action === "reset" && user) {
       if (!newPassword || newPassword.length < 8) {
         console.log("The new password must be at least 8 characters.");
       } else {
         user.passwordHash = await bcrypt.hash(newPassword, 10);
         await user.save();
         console.log("Password updated. You can log in with the new password.");
       }
     }

     await mongoose.connection.close();
   };

   run();