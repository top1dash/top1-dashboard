import React from 'react';

const FILTER_OPTIONS = [
  { key: 'all', label: 'All Users' },
  { key: 'gender', label: 'Your Gender' },
  { key: 'age', label: 'Your Age' },
  // Add more here like { key: 'zip', label: 'Your ZIP' }, etc.
];

export default function FilterChips({ activeFilter, onFilterChange }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {FILTER_OPTIONS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`px-3 py-1 rounded-full border text-sm transition ${
            activeFilter === key
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
