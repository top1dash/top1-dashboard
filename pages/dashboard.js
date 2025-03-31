import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import Modal from '../components/Modal';
import FilteredRankCard from '@/components/FilteredRankCard';
import { ShieldCheck, BarChart2, Mail } from 'lucide-react';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionEmail, setSessionEmail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUserSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        router.push('/login');
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

      const hasSeenModal = localStorage.getItem('hasSeenWelcomeModal');
      if (!hasSeenModal) {
        setShowModal(true);
        localStorage.setItem('hasSeenWelcomeModal', 'true');
      }
    };

    getUserSession();
  }, []);

  const handleStartSurvey = () => {
    setShowModal(false);
    router.push('/survey');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <Modal show={showModal} onClose={handleCloseModal} onStartSurvey={handleStartSurvey} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Welcome{sessionEmail ? `, ${sessionEmail}` : ''} 👋
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading your data...</p>
        ) : userData ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-700">Chance of Divorce</h2>
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-4xl font-bold text-blue-600">
                  {(userData.total_score * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">Based on your most recent survey</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-700">Percentile Rank</h2>
                  <BarChart2 className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-4xl font-bold text-green-600">
                  {(userData.percentile_rank * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">Top {userData.rank} among users</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-700">Email Linked</h2>
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-md font-medium text-gray-800 break-words">{sessionEmail}</p>
              </div>
            </div>

            {/* 🔥 New Filtered Rank Card (by age + gender) */}
            <div className="mt-8">
              <FilteredRankCard email={sessionEmail} />
            </div>
          </>
        ) : (
          <p className="text-red-500 mt-4">No ranking data found for your email.</p>
        )}

        <p className="text-sm text-gray-400 mt-10 text-center">
          More personalized metrics coming soon...
        </p>
      </div>
    </div>
  );
}
