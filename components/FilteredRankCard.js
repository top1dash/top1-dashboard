import React, { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import { supabase } from '../supabaseClient';
import FilterChips from './FilterChips';

const FILTER_OPTIONS = ['all', 'gender', 'age'];

export default function FilteredRankCard({ user, surveyName, onUpdate }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [rankData, setRankData] = useState(null);
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

      console.log(`📦 [${surveyName}] Sending filters to Supabase function:`, filters);

      const response = await fetch('https://hwafvupabcnhialqqgxy.supabase.co/functions/v1/get-filtered-rank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(filters),
      });

      const data = await response.json();
      if (response.ok && data) {
        setRankData(data);
        onUpdate?.(data);
      } else {
        console.error(`❌ [${surveyName}] Supabase function error:`, data?.error || 'Unknown');
        setRankData(null);
        onUpdate?.(null);
      }
    } catch (error) {
      console.error(`❌ [${surveyName}] Fetch error:`, error);
      setRankData(null);
      onUpdate?.(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRank();
  }, [activeFilter, surveyName]);

  return (
    <div className="mt-2 text-center">
      {loading ? (
        <Skeleton className="h-10 w-24 mb-2 mx-auto" />
      ) : rankData ? (
        <>
          <p className="text-4xl font-bold text-green-600">
            {(rankData.percentile_rank * 100).toFixed(0)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Top {rankData.rank} among users
          </p>
        </>
      ) : (
        <p className="text-red-500">Unable to load rank data.</p>
      )}

      <div className="mt-2 flex justify-center">
        <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>
    </div>
  );
}
