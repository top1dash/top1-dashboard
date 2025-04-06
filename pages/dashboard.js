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
  const [filteredStates, setFilteredStates] = useState({});
  const [surveyConfigs, setSurveyConfigs] = useState({});

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

      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('email', userEmail)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setUserRankings(data);
      }

      const { data: configData, error: configError } = await supabase
        .from('survey_config')
        .select('survey_name, higher_is_better');

      if (configData) {
        const configMap = {};
        configData.forEach((item) => {
          configMap[item.survey_name] = item.higher_is_better;
        });
        setSurveyConfigs(configMap);
      } else {
        console.warn('Could not fetch survey configs:', configError);
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

  const getAdjustedPercentile = (filtered, unfiltered, slug) => {
    const raw = filtered ?? unfiltered;
    if (raw == null) return null;
    const invert = surveyConfigs[slug] === false;
    return invert ? 1 - raw : raw;
  };

  const setFilteredForSlug = (slug, data) => {
    setFilteredStates((prev) => ({ ...prev, [slug]: data }));
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SURVEYS.map(({ slug, title }) => {
                const ranking = getRankingBySurvey(slug);
                const filtered = filteredStates[slug];
                const adjustedPercentile = getAdjustedPercentile(filtered?.percentile, ranking?.percentile_rank, slug);

                return (
                  <div key={slug} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
                      <ShieldCheck className="w-5 h-5 text-blue-500" />
                    </div>
                    {ranking ? (
                      <>
                        <p className="text-4xl font-bold text-blue-600">
                          {(ranking.total_score * 100).toFixed(0)}%
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Top {(adjustedPercentile * 100).toFixed(0)}% of users
                        </p>
                      </>
                    ) : (
                      <Link href={`/survey/${slug}`}>
                        <a className="text-blue-600 font-medium hover:underline">Take now!</a>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {SURVEYS.map(({ slug, title }) => {
                const ranking = getRankingBySurvey(slug);
                const filtered = filteredStates[slug];

                return ranking ? (
                  <div key={slug} className="rounded-2xl shadow-sm p-6 border border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold text-gray-700">{title} Percentile</h2>
                      <BarChart2 className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-4xl font-bold text-green-600">
                      {(
                        getAdjustedPercentile(filtered?.percentile, ranking?.percentile_rank, slug) * 100
                      ).toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Top {filtered?.rank ?? ranking?.rank} among users
                    </p>

                    <FilteredRankCard
                      user={{
                        email: sessionEmail,
                        gender: ranking.gender || 'default',
                        age: ranking.age || 'default',
                        zip: ranking.zip || null,
                        city: ranking.city || null,
                        state: ranking.state || null,
                        country: ranking.country || null,
                        school: ranking.school || null,
                      }}
                      surveyName={slug}
                      updatedAt={ranking.updated_at}
                      onUpdate={(data) => setFilteredForSlug(slug, data)}
                    />
                  </div>
                ) : null;
              })}
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
