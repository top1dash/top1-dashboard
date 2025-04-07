import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import FilterChips from './FilterChips';

const FILTER_OPTIONS = ['all', 'age', 'zip/postal_code', 'city', 'state', 'country', 'school'];

export default function FilteredRankCard({ user, surveyName, updatedAt, onUpdate }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [percentile, setPercentile] = useState(null);

  const fetchRank = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const filters = {
        email: user.email,
        survey_name: surveyName,
        gender: user.gender, // always included
        age: activeFilter === 'age' ? user.age : null,
        zip: activeFilter === 'zip/postal_code' ? user.zip : null,
        city: activeFilter === 'city' ? user.city : null,
        state: activeFilter === 'state' ? user.state : null,
        country: activeFilter === 'country' ? user.country : null,
        school: activeFilter === 'school' ? user.school : null,
      };

      console.log(`📡 Fetching filtered rank for:`, filters);

      const response = await fetch(
        'https://hwafvupabcnhialqqgxy.supabase.co/functions/v1/get-filtered-rank',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(filters),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Filtered result from Supabase:`, data);
        onUpdate?.(activeFilter === 'all' ? null : data);
        setPercentile(data?.percentile_rank ?? null);
      } else {
        console.error('❌ Supabase function error:', data?.error || 'Unknown');
        onUpdate?.(null);
        setPercentile(null);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      onUpdate?.(null);
      setPercentile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRank();
  }, [activeFilter, surveyName]);

  const displayPercentile = Math.round((percentile ?? 0) * 100);
  const positionLabel = displayPercentile >= 50 ? 'top' : 'bottom';
  const groupLabel = activeFilter === 'all' ? 'all users' : user[activeFilter] ?? activeFilter;
  const genderLabel = user.gender?.toLowerCase() ?? 'all';
  console.log("🔥 FilteredRankCard loaded with percentile:", percentile);


  return (
    <div className="mt-2 flex flex-col items-center">
      <FilterChips
        options={FILTER_OPTIONS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {!loading && percentile !== null && (
        <div className="mt-4 text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            You’re in the {positionLabel}:
          </h2>
          <div className="text-4xl font-bold">{displayPercentile}%</div>
          <p className="text-sm text-gray-500 mt-1">
            Among {genderLabel} users in {groupLabel}
          </p>
        </div>
      )}

      {updatedAt && (
        <p className="text-sm text-gray-400 mt-2">
          Last updated: {new Date(updatedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
