import { useEffect, useState, useRef } from "react";
import Fuse from "fuse.js";
import { inflate } from "pako";
import countryToRegionMap from "./countryToRegionMap";
import isoCountryMap from "./isoCountryMap";

export default function ZipCityAutocompleteInput({ questionId, onChange }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [region, setRegion] = useState("us");
  const timeoutRef = useRef(null);

  // Step 1: Detect user region from IP
  useEffect(() => {
    const detectRegion = async () => {
      try {
        const res = await fetch("https://ipapi.co/json");
        const data = await res.json();
        const userCountryCode = data.country; // e.g., "US", "FR"
        const mappedRegion = countryToRegionMap[userCountryCode] || "us";
        setRegion(mappedRegion);
      } catch (err) {
        console.error("IP lookup failed, defaulting to US:", err);
        setRegion("us");
      }
    };

    detectRegion();
  }, []);

  // Step 2: Load and decompress regional ZIP data
  useEffect(() => {
    const fetchZipCityData = async () => {
      const url = `https://hwafvupabcnhialqqgxy.supabase.co/storage/v1/object/public/public-data/zip_city_${region}.json.gz`;

      try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const decompressed = inflate(new Uint8Array(buffer), { to: "string" });
        const json = JSON.parse(decompressed);
        console.log("✅ Loaded zip data sample:", json[0]);
        setAllLocations(json);
      } catch (error) {
        console.error("❌ Error loading ZIP/city data:", error);
      }
    };

    if (region) {
      fetchZipCityData();
    }
  }, [region]);

  // Step 3: Fuzzy search handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsDropdownOpen(true);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!value) return setSuggestions([]);

      const fuse = new Fuse(allLocations, {
        keys: ["zip", "city"],
        threshold: 0.3,
      });

      const results = fuse.search(value).map((r) => r.item);
      console.log("🔍 Suggestions sample:", results[0]);
      setSuggestions(results.slice(0, 8));
    }, 250);
  };

  // Step 4: Handle user selecting a suggestion
  const handleSelect = (location) => {
    const fullCountryName = isoCountryMap[location.country] || location.country;
    console.log("🎯 Selected location:", location);

    setQuery(`${location.zip} – ${location.city}`);
    setIsDropdownOpen(false);
    setSuggestions([]);

    onChange(questionId, {
      zip: location.zip,
      city: location.city,
      state: location.state,
      country: fullCountryName,
    });
  };

  // Render
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
              {isoCountryMap[loc.country] || loc.country || "no-country"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
