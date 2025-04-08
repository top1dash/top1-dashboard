import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import FilterChips from './FilterChips';

const FILTER_OPTIONS = ['all', 'age', 'zip code', 'city', 'state', 'country', 'school'];

export default function FilteredRankCard({ user, surveyName, updatedAt, onUpdate }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

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
        zip: activeFilter === 'zip code' ? user.zip : null,
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
        const fullPayload = {
          ...data,
          ...filters, // includes zip, city, state, etc.
        };

      onUpdate?.(activeFilter === 'all' ? null : fullPayload);

      } else {
        console.error('❌ Supabase function error:', data?.error || 'Unknown');
        onUpdate?.(null);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      onUpdate?.(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRank();
  }, [activeFilter, surveyName]);

  return (
    <div className="mt-2 flex flex-col items-center">
      <FilterChips
        options={FILTER_OPTIONS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
    </div>
  );
}
