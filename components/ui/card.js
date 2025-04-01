export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl shadow-md border p-4 bg-white ${className}`}>
      {children}
    </div>
  );
}
