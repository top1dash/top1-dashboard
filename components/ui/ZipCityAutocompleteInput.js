import { useEffect, useState, useRef } from "react";
import Fuse from "fuse.js";
import { inflate } from "pako";

export default function ZipCityAutocompleteInput({ questionId, onChange }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [userCountry, setUserCountry] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timeoutRef = useRef(null);

  // Step 1: Detect user's country from IP
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json");
        const data = await res.json();
        setUserCountry(data.country_name); // e.g., "United States"
        console.log("🌎 IP-based country:", data.country_name);
      } catch (err) {
        console.error("❌ IP detection failed:", err);
      }
    };
    detectCountry();
  }, []);

  // Step 2: Load and decompress the global ZIP dataset
  useEffect(() => {
    const fetchZipCityData = async () => {
      const url = `https://hwafvupabcnhialqqgxy.supabase.co/storage/v1/object/public/public-data/zip_city_global_FIXED.json.gz`;

      try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const decompressed = inflate(new Uint8Array(buffer), { to: "string" });
        const json = JSON.parse(decompressed);
        setAllLocations(json);
        console.log("✅ Loaded", json.length, "entries from ZIP DB");
      } catch (error) {
        console.error("❌ Failed to load ZIP data:", error);
      }
    };
    fetchZipCityData();
  }, []);

  // Step 3: Debounced input + fuzzy search (filtered by user country)
  const handleInputChange = (e) => {
  const value = e.target.value;
  setQuery(value);
  setIsDropdownOpen(true);

  clearTimeout(timeoutRef.current);
  timeoutRef.current = setTimeout(() => {
    if (!value) return setSuggestions([]);

    const fuse = new Fuse(allLocations, {
      keys: ["zip", "city"],
      threshold: 0.3, // still useful for cities
    });

    const results = fuse.search(value).map((r) => r.item);

    // Strict prefix match
    const filteredResults = results.filter(
      (r) =>
        r.zip?.toString().startsWith(value.toString()) ||
        r.city?.toLowerCase().startsWith(value.toLowerCase())
    );

    setSuggestions(filteredResults.slice(0, 10)); // can change back to 8 if preferred
  }, 250);
};

  // Step 4: Handle selection
  const handleSelect = (location) => {
    console.log("🎯 Selected location:", location);
    setQuery(`${location.zip} – ${location.city}`);
    setIsDropdownOpen(false);
    setSuggestions([]);

    onChange(questionId, {
      zip: location.zip,
      city: location.city,
      state: location.state,
      country: location.country,
    });
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Start typing your ZIP code or city..."
        value={query}
        onChange={handleInputChange}
        className="border border-gray-300 rounded px-4 py-2 w-full"
      />
      {isDropdownOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow">
          {suggestions.map((loc, idx) => (
            <li
              key={idx}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(loc)}
            >
              {loc.zip || "no-zip"} – {loc.city || "no-city"},{" "}
              {loc.state || "no-state"},{" "}
              {loc.country || "no-country"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
