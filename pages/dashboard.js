import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import Modal from '../components/Modal';
import FilteredRankCard from '../components/FilteredRankCard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ShieldCheck, BarChart2, Mail } from 'lucide-react';
import Link from 'next/link';

const SURVEYS = [
  { slug: 'divorce_risk', title: 'Chance of Divorce' },
  { slug: 'physical_appearance_survey', title: 'Physical Appearance Score' },
];

export default function Dashboard() {
  const [userRankings, setUserRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionEmail, setSessionEmail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filteredDivorce, setFilteredDivorce] = useState(null);
  const [filteredAppearance, setFilteredAppearance] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUserSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        console.warn('No valid user session found. Redirecting to login...');
        router.push('/login');
        return;
      }

      const userEmail = session.user.email;
      setSessionEmail(userEmail);

      // Updated query: Order by updated_at descending so that the newest submission comes first
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('email', userEmail)
        .order('updated_at', { ascending: false });

      console.log('🔍 Supabase returned user rankings:', data);
      console.log('❗ Any Supabase error?', error);

      if (!error && data) {
        setUserRankings(data);
      } else {
        console.warn('No user ranking data found or error occurred.');
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

  const getRankingBySurvey = (slug) =>
    userRankings.find((r) => r.survey_name === slug);

  const sortedSurveys = [...SURVEYS].sort((a, b) => {
    const aTaken = getRankingBySurvey(a.slug) ? 0 : 1;
    const bTaken = getRankingBySurvey(b.slug) ? 0 : 1;
    return aTaken - bTaken;
  });

  const divorceData = getRankingBySurvey('divorce_risk');
  const appearanceData = getRankingBySurvey('physical_appearance_survey');

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <Modal show={showModal} onClose={handleCloseModal} onStartSurvey={handleStartSurvey} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Welcome{sessionEmail ? `, ${sessionEmail}` : ''} 👋
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading your data...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-700">Chance of Divorce</h2>
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                </div>
                {divorceData ? (
                  <>
                    <p className="text-4xl font-bold text-blue-600">
                      {(divorceData?.total_score * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Top {(filteredDivorce?.percentile_rank * 100 || divorceData?.percentile_rank * 100).toFixed(0)}% of users
                    </p>
                  </>
                ) : (
                  <Link href="/survey/divorce_risk">
                    <a className="text-blue-600 font-medium hover:underline">Take now!</a>
                  </Link>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-700">Percentile Rank</h2>
                  <BarChart2 className="w-5 h-5 text-green-500" />
                </div>
                {divorceData ? (
                  <>
                    <p className="text-4xl font-bold text-green-600">
                      {(filteredDivorce?.percentile_rank * 100 || divorceData?.percentile_rank * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Top {filteredDivorce?.rank || divorceData?.rank} among users
                    </p>

                    <FilteredRankCard
                      user={{
                        email: sessionEmail,
                        gender: userRankings[0]?.gender || 'default',
                        age: userRankings[0]?.age || 'default',
                      }}
                      surveyName="divorce_risk"
                      updatedAt={divorceData?.updated_at}
                      onUpdate={setFilteredDivorce}
                    />
                  </>
                ) : (
                  <Link href="/survey/divorce_risk">
                    <a className="text-blue-600 font-medium hover:underline">Take now!</a>
                  </Link>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-700">Email Linked</h2>
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-md font-medium text-gray-800 break-words">{sessionEmail}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div className="rounded-2xl shadow-sm p-6 border border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-700">Physical Appearance Score</h2>
                  <BarChart2 className="w-5 h-5 text-indigo-500" />
                </div>
                {appearanceData ? (
                  <>
                    <p className="text-4xl font-bold text-blue-600">
                      {appearanceData.total_score}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Top {(filteredAppearance?.percentile_rank * 100 || appearanceData?.percentile_rank * 100).toFixed(0)}% of users
                    </p>
                  </>
                ) : (
                  <Link href="/survey/physical_appearance_survey">
                    <a className="text-blue-600 font-medium hover:underline">Take now!</a>
                  </Link>
                )}
              </div>

              <div className="rounded-2xl shadow-sm p-6 border border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-700">Physical Percentile</h2>
                  <BarChart2 className="w-5 h-5 text-indigo-500" />
                </div>
                {appearanceData ? (
                  <>
                    <p className="text-4xl font-bold text-green-600">
                      {(filteredAppearance?.percentile_rank * 100 || appearanceData?.percentile_rank * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Top {filteredAppearance?.rank || appearanceData?.rank} among users
                    </p>

                    <FilteredRankCard
                      user={{
                        email: sessionEmail,
                        gender: userRankings[0]?.gender || 'default',
                        age: userRankings[0]?.age || 'default',
                      }}
                      surveyName="physical_appearance_survey"
                      updatedAt={appearanceData?.updated_at}
                      onUpdate={setFilteredAppearance}
                    />
                  </>
                ) : (
                  <Link href="/survey/physical_appearance_survey">
                    <a className="text-blue-600 font-medium hover:underline">Take now!</a>
                  </Link>
                )}
              </div>
            </div>
          </>
        )}

        <p className="text-sm text-gray-400 mt-10 text-center">
          More personalized metrics coming soon...
        </p>
      </div>
    </div>
  );
}
