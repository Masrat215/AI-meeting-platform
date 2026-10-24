   import { useEffect, useState } from "react";
   import { Link } from "react-router";
   import api from "../api";
   import StatusBadge from "../components/StatusBadge";
   import { formatDate, isFinished } from "../utils";

   function Dashboard() {
     const [meetings, setMeetings] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState("");

     const loadMeetings = async () => {
       try {
         const response = await api.get("/api/meetings");
         setMeetings(response.data);
         setError("");
       } catch (err) {
         setError("Could not load meetings. Is the backend server running?");
       } finally {
         setLoading(false);
       }
     };

     // Load the list once when the page opens
     useEffect(() => {
       loadMeetings();
     }, []);

     // While any meeting is still processing, refresh every 5 seconds
     useEffect(() => {
       const stillWorking = meetings.some((m) => !isFinished(m.status));
       if (!stillWorking) return;

       const timer = setInterval(loadMeetings, 5000);
       return () => clearInterval(timer);
     }, [meetings]);

     return (
       <div>
         <div className="page-header">
           <h1>Your Meetings</h1>
           <Link to="/upload" className="btn">
             + Upload recording
           </Link>
         </div>

         {error && <p className="error-box">{error}</p>}
         {loading && <p className="muted">Loading…</p>}

         {!loading && !error && meetings.length === 0 && (
           <div className="empty">
             <p>No meetings yet.</p>
             <Link to="/upload" className="btn">
               Upload your first recording
             </Link>
           </div>
         )}

         <div className="meeting-list">
           {meetings.map((meeting) => (
             <Link
               key={meeting._id}
               to={`/meetings/${meeting._id}`}
               className="meeting-card"
             >
               <div>
                 <h3>{meeting.title}</h3>
                 <p className="muted">{formatDate(meeting.createdAt)}</p>
               </div>
               <StatusBadge status={meeting.status} />
             </Link>
           ))}
         </div>
       </div>
     );
   }

   export default Dashboard;