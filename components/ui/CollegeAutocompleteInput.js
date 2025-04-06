import { useEffect, useState, useRef } from "react";
import { supabase } from "../../supabaseClient";
import Fuse from "fuse.js";

export default function CollegeAutocompleteInput({ questionId, onChange }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allColleges, setAllColleges] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // NEW: Track which suggestion is currently highlighted for keyboard navigation
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const timeoutRef = useRef(null);

  useEffect(() => {
    const fetchColleges = async () => {
      const { data, error } = await supabase
        .from("survey_config")
        .select("config")
        .eq("survey_name", "colleges_global_cleaned")
        .single();

      if (data?.config) {
        setAllColleges(data.config);
      } else {
        console.error("Error loading colleges:", error);
      }
    };

    fetchColleges();
  }, []);

  // NEW: Reset active suggestion index whenever the suggestions list changes
  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [suggestions]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsDropdownOpen(true);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!value) return setSuggestions([]);

      const fuse = new Fuse(allColleges, {
        keys: ["name"],
        threshold: 0.3,
      });

      const results = fuse.search(value).map((r) => r.item);
      setSuggestions(results.slice(0, 8));
    }, 250);
  };

  // NEW: Handle ArrowUp, ArrowDown, and Enter keys for keyboard navigation
  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      if (activeSuggestionIndex < suggestions.length - 1) {
        setActiveSuggestionIndex(activeSuggestionIndex + 1);
      }
    } else if (e.key === "ArrowUp") {
      if (activeSuggestionIndex > 0) {
        setActiveSuggestionIndex(activeSuggestionIndex - 1);
      }
    } else if (e.key === "Enter") {
      // If there's a valid active suggestion, select it
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        e.preventDefault(); // Prevent form submission if inside a form
        handleSelect(suggestions[activeSuggestionIndex]);
      }
    }
  };

  const handleSelect = (college) => {
    setQuery(college.name);
    setIsDropdownOpen(false);
    setSuggestions([]);
    onChange(questionId, college.name);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Start typing your college or university..."
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown} // NEW: Attach keyboard navigation
        className="border border-gray-300 rounded px-4 py-2 w-full"
      />
      {isDropdownOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow">
          {suggestions.map((college, idx) => (
            <li
              key={idx}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                idx === activeSuggestionIndex ? "bg-gray-200" : ""
              }`}
              onClick={() => handleSelect(college)}
            >
              {college.name} <span className="text-gray-400 text-sm">({college.country})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
