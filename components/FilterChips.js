export default function FilterChips({ options, activeFilter, onFilterChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 justify-center">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onFilterChange(option)}
          className={`px-3 py-1 rounded-full text-sm border transition ${
            activeFilter === option
              ? 'bg-gray-600 text-white border-gray-800'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          {option === 'all'
            ? 'All Users'
            : option.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </button>
      ))}
    </div>
  );
}
