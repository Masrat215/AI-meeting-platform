   import { useEffect, useState } from "react";
   import { Link, useNavigate, useParams } from "react-router";
   import api from "../api";
   import StatusBadge from "../components/StatusBadge";
   import { formatDate, formatTime, isFinished } from "../utils";

   const STEPS = ["Uploaded", "Transcribing", "Summarizing", "Done"];
   const STEP_INDEX = {
     uploaded: 0,
     transcribing: 1,
     transcribed: 2,
     summarizing: 2,
     done: 3,
   };

   function MeetingDetail() {
     const { id } = useParams(); // the meeting ID from the web address
     const navigate = useNavigate();
     const [data, setData] = useState(null);
     const [error, setError] = useState("");
     const [actionError, setActionError] = useState("");
     const [busy, setBusy] = useState(false);

     const loadMeeting = async () => {
       try {
         const response = await api.get(`/api/meetings/${id}`);
         setData(response.data);
         setError("");
       } catch (err) {
         setError(err.response?.data?.error || "Could not load this meeting.");
       }
     };

     // Load the meeting when the page opens
     useEffect(() => {
       loadMeeting();
     }, [id]);

     // While it is still processing, check again every 3 seconds
     useEffect(() => {
       if (!data || isFinished(data.meeting.status)) return;

       const timer = setInterval(loadMeeting, 3000);
       return () => clearInterval(timer);
     }, [data]);

     const handleRetry = async () => {
       try {
         setBusy(true);
         setActionError("");
         await api.post(`/api/meetings/${id}/retry`);
         await loadMeeting();
       } catch (err) {
         setActionError(err.response?.data?.error || "Could not retry this meeting.");
       } finally {
         setBusy(false);
       }
     };

     const handleDelete = async () => {
       const sure = window.confirm(
         "Delete this meeting and all its results? This cannot be undone."
       );
       if (!sure) return;

       try {
         setBusy(true);
         setActionError("");
         await api.delete(`/api/meetings/${id}`);
         navigate("/");
       } catch (err) {
         setActionError(err.response?.data?.error || "Could not delete this meeting.");
         setBusy(false);
       }
     };

     if (!data) {
       return error ? (
         <div>
           <p className="error-box">{error}</p>
           <p>
             <Link to="/" className="back">
               ← Back to dashboard
             </Link>
           </p>
         </div>
       ) : (
         <p className="muted">Loading…</p>
       );
     }

     const { meeting, transcript, summary } = data;
     const working = !isFinished(meeting.status);
     const currentStep = STEP_INDEX[meeting.status] ?? 0;

     return (
       <div>
         <Link to="/" className="back">
           ← Back to dashboard
         </Link>

         <div className="page-header">
           <div>
             <h1>{meeting.title}</h1>
             <p className="muted">
               {formatDate(meeting.createdAt)} · {meeting.originalFileName}
             </p>
           </div>
           <StatusBadge status={meeting.status} />
         </div>

         <div className="actions">
           {meeting.status === "failed" && (
             <button className="btn" onClick={handleRetry} disabled={busy}>
               Retry processing
             </button>
           )}
           <button className="btn btn-danger" onClick={handleDelete} disabled={busy}>
             Delete meeting
           </button>
         </div>

         {actionError && <p className="error-box">{actionError}</p>}

         {meeting.status === "failed" && (
           <p className="error-box">Something went wrong. {meeting.errorMessage}</p>
         )}

         {working && (
           <div className="card">
             <h2>Processing your recording…</h2>
             <ol className="steps">
               {STEPS.map((label, index) => (
                 <li
                   key={label}
                   className={
                     index < currentStep
                       ? "step done"
                       : index === currentStep
                       ? "step active"
                       : "step"
                   }
                 >
                   {label}
                 </li>
               ))}
             </ol>
             <p className="muted">
               This page updates by itself. It usually takes a minute or two.
             </p>
           </div>
         )}

         {summary && (
           <div className="card">
             <h2>Summary</h2>
             <p>{summary.summaryText}</p>

             <h2>Action items</h2>
             {summary.actionItems.length === 0 ? (
               <p className="muted">No action items were found in this meeting.</p>
             ) : (
               <table>
                 <thead>
                   <tr>
                     <th>Task</th>
                     <th>Assignee</th>
                     <th>Deadline</th>
                   </tr>
                 </thead>
                 <tbody>
                   {summary.actionItems.map((item) => (
                     <tr key={item._id}>
                       <td>{item.task}</td>
                       <td>{item.assignee}</td>
                       <td>{item.deadline}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
           </div>
         )}

         {transcript && (
           <div className="card">
             <h2>Transcript</h2>
             {transcript.speakerSegments.length > 0 ? (
               transcript.speakerSegments.map((segment) => (
                 <div key={segment._id} className="segment">
                   <span className="speaker">Speaker {segment.speaker}</span>
                   <span className="time">{formatTime(segment.start)}</span>
                   <p>{segment.text}</p>
                 </div>
               ))
             ) : (
               <p>{transcript.fullText || "No speech was detected."}</p>
             )}
           </div>
         )}
       </div>
     );
   }

   export default MeetingDetail;