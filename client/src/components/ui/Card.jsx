function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;