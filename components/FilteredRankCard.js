import React, { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import { supabase } from '../supabaseClient';
import FilterChips from './FilterChips';

const FILTER_OPTIONS = ['all', 'gender', 'age'];

export default function FilteredRankCard({ user, surveyName, onUpdate }) {
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
        gender: activeFilter === 'gender' ? user.gender : null,
        age: activeFilter === 'age' ? user.age : null,
      };

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
        onUpdate?.(data); // 🔥 Push result to parent (Dashboard)
      } else {
        console.error('❌ Supabase function error:', data?.error || 'Unknown');
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRank();
  }, [activeFilter, surveyName]);

  return (
    <div className="mt-2 flex justify-center">
      <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
    </div>
  );
}
