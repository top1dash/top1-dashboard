export function Label({ children, className = '', ...props }) {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 ${className}`}
      {...props} // ✅ forwards htmlFor or anything else
    >
      {children}
    </label>
  );
}
