   const LABELS = {
     uploaded: "Uploaded",
     transcribing: "Transcribing…",
     transcribed: "Transcribed",
     summarizing: "Summarizing…",
     done: "Done",
     failed: "Failed",
   };

   function StatusBadge({ status }) {
     return (
       <span className={`badge badge-${status}`}>{LABELS[status] || status}</span>
     );
   }

   export default StatusBadge;