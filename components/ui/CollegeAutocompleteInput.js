import { useEffect, useState, useRef } from "react";
import { supabase } from "@/supabaseClient";
import Fuse from "fuse.js";

export default function CollegeAutocompleteInput({ questionId, onChange }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allColleges, setAllColleges] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
        className="border border-gray-300 rounded px-4 py-2 w-full"
      />
      {isDropdownOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow">
          {suggestions.map((college, idx) => (
            <li
              key={idx}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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
