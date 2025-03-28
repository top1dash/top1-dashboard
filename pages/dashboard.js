// pages/dashboard.js
import React from 'react';

export default function Dashboard() {
  // Sample mock data; will be dynamic later
  const user = {
    name: "Austin",
    email: "cherry@hotmail.com",
    divorceChance: "5.1%",
    percentile: "38.5%",
    rank: "Top 38.5% of users",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}!</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Your Chance of Divorce</h2>
            <p className="text-4xl font-bold text-blue-500">{user.divorceChance}</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Your Percentile Rank</h2>
            <p className="text-4xl font-bold text-green-500">{user.percentile}</p>
            <p className="text-sm text-gray-500 mt-1">You're in the {user.rank}</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Email Linked</h2>
            <p className="text-md text-gray-700">{user.email}</p>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-10">More personalized metrics coming soon...</p>
      </div>
    </div>
  );
}
