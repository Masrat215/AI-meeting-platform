   const express = require("express");
   const bcrypt = require("bcryptjs");
   const jwt = require("jsonwebtoken");
   const User = require("../models/User");
   const requireAuth = require("../middleware/auth");
   const { loginLimiter, registerLimiter } = require("../middleware/rateLimit");

   const router = express.Router();

   const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   // Cost 10 keeps logins quick even on the free hosting plan
   const HASH_COST = 10;

   // Used so that a wrong email takes as long to reject as a wrong password
   const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", HASH_COST);

   const createToken = (user) =>
     jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
       expiresIn: process.env.JWT_EXPIRES_IN || "7d",
     });

   const publicUser = (user) => ({
     id: user._id,
     name: user.name,
     email: user.email,
   });

   // POST /api/auth/register -> create an account
   router.post("/register", registerLimiter, async (req, res) => {
     try {
       const { name, email, password } = req.body || {};
       const cleanName = String(name || "").trim();
       const cleanEmail = String(email || "").trim().toLowerCase();
       const cleanPassword = String(password || "");

       if (cleanName.length < 2 || cleanName.length > 60) {
         return res
           .status(400)
           .json({ error: "Please enter your name (2 to 60 characters)" });
       }
       if (!EMAIL_PATTERN.test(cleanEmail)) {
         return res.status(400).json({ error: "Please enter a valid email address" });
       }
       if (cleanPassword.length < 8 || cleanPassword.length > 72) {
         return res
           .status(400)
           .json({ error: "Password must be 8 to 72 characters long" });
       }

       const existing = await User.findOne({ email: cleanEmail });
       if (existing) {
         return res
           .status(409)
           .json({ error: "An account with this email already exists" });
       }

       const passwordHash = await bcrypt.hash(cleanPassword, HASH_COST);
       const user = await User.create({
         name: cleanName,
         email: cleanEmail,
         passwordHash,
       });

       res.status(201).json({ token: createToken(user), user: publicUser(user) });
     } catch (error) {
       if (error.code === 11000) {
         return res
           .status(409)
           .json({ error: "An account with this email already exists" });
       }
       res.status(500).json({ error: "Could not create the account. Please try again" });
     }
   });

   // POST /api/auth/login -> sign in
   router.post("/login", loginLimiter, async (req, res) => {
     try {
       const { email, password } = req.body || {};
       const cleanEmail = String(email || "").trim().toLowerCase();
       const cleanPassword = String(password || "");

       const user = await User.findOne({ email: cleanEmail });

       // Always run one password check, and give one message for both mistakes
       const passwordOk = await bcrypt.compare(
         cleanPassword,
         user ? user.passwordHash : DUMMY_HASH
       );

       if (!user || !passwordOk) {
         return res.status(401).json({ error: "Invalid email or password" });
       }

       res.json({ token: createToken(user), user: publicUser(user) });
     } catch (error) {
       res.status(500).json({ error: "Could not log in. Please try again" });
     }
   });

   // GET /api/auth/me -> who am I? (needs a valid token)
   router.get("/me", requireAuth, (req, res) => {
     res.json({ user: publicUser(req.user) });
   });

   module.exports = router;