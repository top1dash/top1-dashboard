import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { CardContent } from './ui/cardContent';
import { Skeleton } from './ui/skeleton';
import { supabase } from '../supabaseClient';
import FilterChips from './FilterChips';

const FILTER_OPTIONS = ['all', 'gender', 'age'];

export default function FilteredRankCard({ user }) {
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
        survey_name: 'divorce_risk',
        gender: activeFilter === 'gender' ? user.gender : null,
        age: activeFilter === 'age' ? user.age : null,
      };

      console.log('📦 Sending filters to Supabase function:', filters);

      const response = await fetch('https://hwafvupabcnhialqqgxy.supabase.co/functions/v1/get-filtered-rank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(filters),
      });

      const data = await response.json();
      if (response.ok) {
        setRankData(data);
      } else {
        console.error('❌ Supabase function error:', data?.error || 'Unknown');
        setRankData(null);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setRankData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRank();
  }, [activeFilter]);

  return (
    <div className="mt-4">
      {/* Score Display */}
      {loading ? (
        <Skeleton className="h-10 w-24 mb-2" />
      ) : rankData ? (
        <>
          <p className="text-3xl font-bold">{rankData.total_score.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            Rank #{rankData.rank} &bull; Top {(rankData.percentile_rank * 100).toFixed(1)}%
          </p>
        </>
      ) : (
        <p className="text-red-500">Unable to load rank data.</p>
      )}

      {/* Filter Chips Inline */}
      <div className="mt-2">
        <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>
    </div>
  );
}
