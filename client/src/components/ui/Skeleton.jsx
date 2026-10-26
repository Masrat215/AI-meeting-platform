// A grey pulsing block shown while data is loading
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-surface-2 ${className}`} />;
}

export default Skeleton;