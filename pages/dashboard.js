import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import Modal from '../components/Modal';
import FilteredRankCard from '../components/FilteredRankCard';
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
        setTimeout(() => {
          router.push('/login');
        }, 0);
        return;
      }

      const userEmail = session.user.email;
      setSessionEmail(userEmail);

      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('email', userEmail)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setUserRankings(data);
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

  const latestUserRanking = userRankings?.[0] || {};
  const divorceData = getRankingBySurvey('divorce_risk');
  const appearanceData = getRankingBySurvey('physical_appearance_survey');

  const formatFilterLabel = (data) => {
    if (!data) return `Among ${latestUserRanking.gender?.toLowerCase() || 'all'} users`;

    const gender = data.gender?.toLowerCase() || 'all';
    const fields = ['zip', 'city', 'state', 'country', 'school', 'age'];
    const found = fields.find((field) => data?.[field]);

    if (!found) return `Among ${gender} users`;

    const raw = data[found];
    const value = typeof raw === 'object' && raw !== null ? Object.keys(raw)[0] : raw;

    let detail = '';
    switch (found) {
      case 'zip':
      case 'city':
      case 'state':
      case 'country':
        detail = `in ${value}`;
        break;
      case 'age':
        detail = `between age ${value}`;
        break;
      case 'school':
        detail = `at ${value}`;
        break;
    }

    return `Among ${gender} users ${detail}`;
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Vertical Filter Panel */}
            <div className="col-span-1">
              <FilteredRankCard
                user={{
                  email: sessionEmail,
                  gender: latestUserRanking.gender || 'default',
                  age: latestUserRanking.age || 'default',
                  zip: latestUserRanking.zip || null,
                  city: latestUserRanking.city || null,
                  state: latestUserRanking.state || null,
                  country: latestUserRanking.country || null,
                  school: latestUserRanking.school || null,
                }}
                surveyName="divorce_risk"
                updatedAt={divorceData?.updated_at}
                onUpdate={setFilteredDivorce}
              />
            </div>

            {/* Tiles */}
            <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Divorce Percentile */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-700">
                    You’re in the {(filteredDivorce?.percentile ?? divorceData?.percentile_rank) * 100 >= 50 ? 'top' : 'bottom'}:
                  </h2>
                  <BarChart2 className="w-5 h-5 text-emerald-500" />
                </div>
                {divorceData && (
                  <>
                    <p className="text-4xl font-bold text-emerald-600">
                      {Math.round((filteredDivorce?.percentile ?? divorceData?.percentile_rank) * 100)}%
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatFilterLabel(filteredDivorce)}
                    </p>
                  </>
                )}
              </div>

              {/* Percentile Change */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                {divorceData && userRankings.length > 1 && (() => {
                  const latest = filteredDivorce?.percentile ?? divorceData?.percentile_rank;
                  const previous = userRankings.find(
                    r => r.survey_name === 'divorce_risk' && r.id !== divorceData.id
                  )?.percentile_rank;
                  const change = latest && previous ? (latest - previous) * 100 : 0;
                  const sign = change >= 0 ? '+' : '';
              
                  const iconColor =
                    change > 0
                      ? 'text-green-600'
                      : change < 0
                      ? 'text-red-500'
                      : 'text-gray-500';
              
                  return (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-700">Change Since Last Login</h2>
                        <BarChart2 className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <p className={`text-3xl font-bold ${iconColor}`}>
                        {sign}{change.toFixed(1)}%
                      </p>
                    </>
                  );
                })()}
              </div>


              {/* Chance of Divorce */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-700">Chance of Divorce</h2>
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                </div>
                {divorceData && (
                  <>
                    <p className="text-4xl font-bold text-blue-600">
                      {(divorceData?.total_score * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      Top {((filteredDivorce?.percentile ?? divorceData?.percentile_rank) * 100).toFixed(0)}% of users
                    </p>
                  </>
                )}
              </div>

              {/* Physical Appearance Score */}
              <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-700">Physical Appearance Score</h2>
                    <BarChart2 className="w-5 h-5 text-indigo-500" />
                  </div>
                  {appearanceData && (
                    <>
                      <p className="text-4xl font-bold text-blue-600">
                        {appearanceData.total_score}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Top {(filteredAppearance?.percentile ?? appearanceData?.percentile_rank * 100).toFixed(0)}% of users
                      </p>
                    </>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-700">Physical Percentile</h2>
                    <BarChart2 className="w-5 h-5 text-indigo-500" />
                  </div>
                  {appearanceData && (
                    <>
                      <p className="text-4xl font-bold text-green-600">
                        {(filteredAppearance?.percentile ?? appearanceData?.percentile_rank * 100).toFixed(0)}%
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Top {filteredAppearance?.rank || appearanceData?.rank} among users
                      </p>
                      <FilteredRankCard
                        user={{
                          email: sessionEmail,
                          gender: latestUserRanking.gender || 'default',
                          age: latestUserRanking.age || 'default',
                        }}
                        surveyName="physical_appearance_survey"
                        updatedAt={appearanceData?.updated_at}
                        onUpdate={setFilteredAppearance}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
