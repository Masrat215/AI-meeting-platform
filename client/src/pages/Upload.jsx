   import { useState } from "react";
   import { useNavigate } from "react-router";
   import api from "../api";

   function Upload() {
     const [title, setTitle] = useState("");
     const [file, setFile] = useState(null);
     const [uploading, setUploading] = useState(false);
     const [error, setError] = useState("");
     const navigate = useNavigate();

     const handleSubmit = async (event) => {
       event.preventDefault();

       if (!file) {
         setError("Please choose an audio file first.");
         return;
       }
       if (file.size > 100 * 1024 * 1024) {
         setError("This file is larger than 100 MB.");
         return;
       }

       // Files are sent as "form data". The name "audio" must match the backend.
       const formData = new FormData();
       formData.append("title", title);
       formData.append("audio", file);

       try {
         setUploading(true);
         setError("");
         const response = await api.post("/api/meetings/upload", formData);
         // Go straight to the new meeting's page to watch the progress
         navigate(`/meetings/${response.data.meeting._id}`);
       } catch (err) {
         setError(
           err.response?.data?.error || "Upload failed. Is the backend server running?"
         );
         setUploading(false);
       }
     };

     return (
       <div>
         <div className="page-header">
           <h1>Upload a recording</h1>
         </div>

         <form onSubmit={handleSubmit} className="card form">
           <label>
             Meeting title
             <input
               type="text"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               placeholder="e.g. Weekly project review"
             />
           </label>

           <label>
             Audio file (mp3, wav, m4a… up to 100 MB)
             <input
               type="file"
               accept="audio/*"
               onChange={(e) => setFile(e.target.files[0])}
             />
           </label>

           {file && (
             <p className="muted">
               Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
             </p>
           )}

           {error && <p className="error-box">{error}</p>}

           <button className="btn" type="submit" disabled={uploading}>
             {uploading ? "Uploading…" : "Upload and analyze"}
           </button>
         </form>
       </div>
     );
   }

   export default Upload;