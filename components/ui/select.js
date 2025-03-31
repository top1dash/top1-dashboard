export function Select({ value, onChange, children, className = '' }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm ${className}`}
    >
      {children}
    </select>
  );
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
