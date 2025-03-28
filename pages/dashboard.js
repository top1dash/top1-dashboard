// pages/dashboard.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [rankings, setRankings] = useState(null);

  // Replace this with dynamic logic if needed
  const userEmail = "cherry@hotmail.com";

  useEffect(() => {
    const fetchRankings = async () => {
      const { data, error } = await supabase
        .from('rankings')
        .select('total_score, rank, percentile_rank')
        .eq('email', userEmail)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching rankings:', error);
      } else {
        setRankings(data[0]);
      }
    };

    fetchRankings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome!</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Your Total Score</h2>
            <p className="text-4xl font-bold text-blue-500">
              {rankings ? rankings.total_score.toFixed(2) : 'Loading...'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Your Percentile Rank</h2>
            <p className="text-4xl font-bold text-green-500">
              {rankings ? `${Math.round(rankings.percentile_rank * 100)}%` : 'Loading...'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {rankings ? `You're in the top ${Math.round(rankings.percentile_rank * 100)}% of users` : ''}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Email Linked</h2>
            <p className="text-md text-gray-700">{userEmail}</p>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-10">More personalized metrics coming soon...</p>
      </div>
    </div>
  );
}
