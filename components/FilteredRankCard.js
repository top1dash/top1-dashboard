import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { CardContent } from '../components/ui/cardContent';
import { Skeleton } from '../components/ui/skeleton';
import { supabase } from '../supabaseClient';

const FILTER_OPTIONS = ['all', 'gender', 'age']; // You can expand this later with 'zip', 'city', 'school'

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
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">Your Divorce Risk Rank</h2>

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

        {/* Filter Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map(option => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-3 py-1 rounded-full border text-sm transition ${
                activeFilter === option
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {option === 'all' ? 'All Users' : `Your ${option.charAt(0).toUpperCase() + option.slice(1)}`}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
