import { useEffect, useState, useRef } from "react";
import Fuse from "fuse.js";
import { inflate } from "pako";

export default function ZipCityAutocompleteInput({ questionId, onChange }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countryName, setCountryName] = useState(""); // ✅ NEW state
  const timeoutRef = useRef(null);

  // Step 1: IP-based country detection
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json");
        const data = await res.json();
        console.log("🌍 IP-based country:", data.country_name);
        setCountryName(data.country_name); // ✅ Set full name like "United States"
      } catch (err) {
        console.error("🌐 IP detection failed:", err);
        setCountryName("United States"); // Fallback
      }
    };

    detectCountry();
  }, []);

  // Step 2: Load ZIP dataset
  useEffect(() => {
    const fetchZipCityData = async () => {
      const url = `https://hwafvupabcnhialqqgxy.supabase.co/storage/v1/object/public/public-data/zip_city_global_FIXED.json.gz`;

      try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const decompressed = inflate(new Uint8Array(buffer), { to: "string" });
        const json = JSON.parse(decompressed);
        console.log(`✅ Loaded ${json.length} entries from ZIP DB`);
        setAllLocations(json);
      } catch (error) {
        console.error("❌ Error loading ZIP/city data:", error);
      }
    };

    fetchZipCityData();
  }, []);

  // Step 3: Debounced input + fuzzy search
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsDropdownOpen(true);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!value) return setSuggestions([]);

      // ✅ Filter locations by country before fuzzy searching
      const filteredByCountry = allLocations.filter(
        (loc) => loc.country === countryName
      );

      const fuse = new Fuse(filteredByCountry, {
        keys: ["zip", "city"],
        threshold: 0.3,
      });

      const results = fuse.search(value).map((r) => r.item);

      // ✅ Only show results that *start with* the typed query
      const filteredResults = results.filter(
        (r) =>
          r.zip.toString().startsWith(value.toString()) ||
          r.city.toLowerCase().startsWith(value.toLowerCase())
      );

      setSuggestions(filteredResults.slice(0, 10));
    }, 250);
  };

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
