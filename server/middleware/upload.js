   const multer = require("multer");
   const path = require("path");
   const fs = require("fs");

   // Folder where uploaded audio is stored (created automatically)
   const uploadDir = path.join(__dirname, "..", "uploads");
   fs.mkdirSync(uploadDir, { recursive: true });

   const storage = multer.diskStorage({
     destination: (req, file, cb) => cb(null, uploadDir),
     filename: (req, file, cb) => {
       const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
       cb(null, `${Date.now()}-${safeName}`);
     },
   });

   // Accept audio files only
   const fileFilter = (req, file, cb) => {
     if (file.mimetype.startsWith("audio/")) {
       cb(null, true);
     } else {
       cb(new Error("Only audio files are allowed"));
     }
   };

   const upload = multer({
     storage,
     fileFilter,
     limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB maximum
   });

   module.exports = upload;