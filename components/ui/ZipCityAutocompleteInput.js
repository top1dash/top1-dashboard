import { useEffect, useState, useRef } from "react";
import Fuse from "fuse.js";
import { inflate } from "pako";

export default function ZipCityAutocompleteInput({ questionId, onChange }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [countryOptions, setCountryOptions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timeoutRef = useRef(null);

  // Load global ZIP data (already contains full country names)
  useEffect(() => {
    const fetchZipCityData = async () => {
      const url = `https://hwafvupabcnhialqqgxy.supabase.co/storage/v1/object/public/public-data/zip_city_global_FIXED.json.gz`;

      try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const decompressed = inflate(new Uint8Array(buffer), { to: "string" });
        const json = JSON.parse(decompressed);
        setAllLocations(json);

        // Extract unique country list
        const uniqueCountries = [...new Set(json.map((item) => item.country))].sort();
        setCountryOptions(uniqueCountries);
        console.log("✅ Loaded ZIP dataset:", json.length, "entries");
      } catch (error) {
        console.error("❌ Error loading ZIP/city data:", error);
      }
    };

    fetchZipCityData();
  }, []);

  // Detect user’s country from IP (optional override available)
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json");
        const data = await res.json();
        setSelectedCountry(data.country_name || "United States");
      } catch (err) {
        console.warn("⚠️ Failed to detect country from IP, defaulting to US");
        setSelectedCountry("United States");
      }
    };

    detectCountry();
  }, []);

  // Debounced fuzzy search within selected country
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsDropdownOpen(true);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!value) return setSuggestions([]);

      const filtered = allLocations.filter(
        (item) => item.country === selectedCountry
      );

      const fuse = new Fuse(filtered, {
        keys: ["zip", "city"],
        threshold: 0.3,
      });

      const results = fuse.search(value).map((r) => r.item);
      setSuggestions(results.slice(0, 8));
    }, 250);
  };

  // Handle suggestion selection
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
    <div className="relative space-y-2">
      <select
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 w-full bg-white"
      >
        {countryOptions.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Start typing your ZIP code or city..."
        value={query}
        onChange={handleInputChange}
        className="border border-gray-300 rounded px-4 py-2 w-full"
      />

      {isDropdownOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow max-h-60 overflow-auto">
          {suggestions.map((loc, idx) => (
            <li
              key={idx}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(loc)}
            >
              {loc.zip || "no-zip"} – {loc.city || "no-city"},{" "}
              {loc.state || "no-state"}, {loc.country || "no-country"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
