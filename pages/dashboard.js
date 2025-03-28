import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionEmail, setSessionEmail] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUserSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        router.push('/login'); // 🚪 Send to login if not logged in
        return;
      }

      const userEmail = session.user.email;
      setSessionEmail(userEmail);

      const { data, error } = await supabase
        .from('rankings')
        .select('total_score, rank, percentile_rank')
        .eq('email', userEmail)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (!error) {
        setUserData(data[0]);
      }

      setLoading(false);
    };

    getUserSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome, Austin!</h1>

        {loading ? (
          <p>Loading your data...</p>
        ) : userData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-2">Your Chance of Divorce</h2>
              <p className="text-4xl font-bold text-blue-500">{userData ? `${(userData.total_score * 100).toFixed(0)}%` : '...'}</p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-2">Your Percentile Rank</h2>
              <p className="text-4xl font-bold text-green-500">
                {(userData.percentile_rank * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">You’re in the top {userData.rank}</p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-2">Email Linked</h2>
              <p className="text-md text-gray-700">{sessionEmail}</p>
            </div>
          </div>
        ) : (
          <p>No ranking data found for your email.</p>
        )}

        <p className="text-sm text-gray-400 mt-10">More personalized metrics coming soon...</p>
      </div>
    </div>
  );
}
