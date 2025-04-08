import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { inflate } from 'pako';

export default function CollegeAutocompleteInput({ questionId, onChange }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allColleges, setAllColleges] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
  const fetchColleges = async () => {
      const url = `https://hwafvupabcnhialqqgxy.supabase.co/storage/v1/object/public/public-data//colleges_global_clean.json`;
      try {
      const response = await fetch(url);
      const json = await response.json();
      console.log(`✅ Loaded ${json.length} colleges`);
      setAllColleges(json);
    } catch (error) {
      console.error("❌ Failed to load colleges:", error);
    }
  };

  fetchColleges();
}, []);
  
  useEffect(() => {
    const fuse = new Fuse(allColleges, {
  keys: ['name'],
  threshold: 0.1,
  ignoreLocation: true,
  minMatchCharLength: 2,
  shouldSort: true,
  includeScore: true,
});

    if (!query) {
  setSuggestions([]);
  return;
}

const fuseResults = fuse.search(query).map((r) => r.item);

const startsWithMatches = fuseResults.filter((item) =>
  item.name.toLowerCase().startsWith(query.toLowerCase())
);
const otherMatches = fuseResults.filter(
  (item) => !item.name.toLowerCase().startsWith(query.toLowerCase())
);

setSuggestions([...startsWithMatches, ...otherMatches].slice(0, 8));

}, [query, allColleges]);
  
  const handleSelect = (college) => {
    setQuery(college.name);
    setIsDropdownOpen(false);
    setActiveSuggestionIndex(-1);
    onChange({ questionId, college.name });
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        Math.min(prev + 1, suggestions.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
        handleSelect(suggestions[activeSuggestionIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
      setActiveSuggestionIndex(-1);
    }

  };

  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 100);
  };

  const handleFocus = () => {
    clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        ref={inputRef}
        className="border p-2 rounded w-full"
        placeholder="Search your college"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {isDropdownOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-48 overflow-y-auto">
          {suggestions.map((college, index) => (
            <li
              key={college.name}
              className={`px-4 py-2 cursor-pointer ${
                index === activeSuggestionIndex ? 'bg-gray-100' : ''
              }`}
              onMouseDown={() => handleSelect(college)}
            >
              {college.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
