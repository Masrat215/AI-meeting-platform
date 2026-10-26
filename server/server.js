   require("dotenv").config();
   const express = require("express");
   const cors = require("cors");
   const helmet = require("helmet");
   const connectDB = require("./db");
   const authRoutes = require("./routes/authRoutes");
   const meetingRoutes = require("./routes/meetingRoutes");

   // The server cannot sign people in without this secret key
   if (!process.env.JWT_SECRET) {
     console.error("JWT_SECRET is missing. Add it to server/.env and restart.");
     process.exit(1);
   }

   const app = express();

   // Render puts one proxy in front of the server. This lets the rate
   // limiter see the real address of each visitor.
   app.set("trust proxy", 1);

   app.use(helmet());

   // Only allow the website address(es) listed in CLIENT_URL (comma separated).
   // When CLIENT_URL is not set (local development), allow everything.
   const allowedOrigins = process.env.CLIENT_URL
     ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
     : true;

   app.use(cors({ origin: allowedOrigins }));
   app.use(express.json());

   app.get("/", (req, res) => {
     res.json({ message: "ScribWave API is running" });
   });

   app.use("/api/auth", authRoutes);
   app.use("/api/meetings", meetingRoutes);

   // Handles errors such as a wrong file type or a file that is too large
   app.use((err, req, res, next) => {
     res.status(400).json({ error: err.message });
   });

   const PORT = process.env.PORT || 5000;

   connectDB().then(() => {
     app.listen(PORT, () => {
       console.log(`Server running on port ${PORT}`);
     });
   });