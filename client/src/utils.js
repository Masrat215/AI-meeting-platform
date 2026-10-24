   // "2026-10-22T10:30:00Z"  ->  "22 Oct 2026, 4:00 pm"
   export const formatDate = (isoString) =>
     new Date(isoString).toLocaleString("en-IN", {
       dateStyle: "medium",
       timeStyle: "short",
     });

   // 125000 (milliseconds)  ->  "2:05"
   export const formatTime = (ms) => {
     const totalSeconds = Math.floor(ms / 1000);
     const minutes = Math.floor(totalSeconds / 60);
     const seconds = totalSeconds % 60;
     return `${minutes}:${String(seconds).padStart(2, "0")}`;
   };

   // A meeting is finished when it is done or failed
   export const isFinished = (status) => status === "done" || status === "failed";