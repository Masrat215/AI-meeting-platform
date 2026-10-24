   require("dotenv").config();
   const express = require("express");
   const cors = require("cors");
   const connectDB = require("./db");
   const meetingRoutes = require("./routes/meetingRoutes");

   const app = express();

   app.use(cors());
   app.use(express.json());

   app.get("/", (req, res) => {
     res.json({ message: "AI Meeting Platform API is running" });
   });

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