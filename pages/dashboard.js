
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import Modal from '../components/Modal';
import SurveyInsightsRow from '../components/SurveyInsightsRow';

export default function Dashboard() {
  const [sessionEmail, setSessionEmail] = useState(null);
  const [userRankings, setUserRankings] = useState([]);
  const [surveyConfigs, setSurveyConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadDashboardData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        router.push('/login');
        return;
      }

      const userEmail = session.user.email;
      setSessionEmail(userEmail);

      const [{ data: rankings }, { data: configs }] = await Promise.all([
        supabase
          .from('rankings')
          .select('*')
          .eq('email', userEmail)
          .order('updated_at', { ascending: false }),
        supabase
          .from('survey_config')
          .select('survey_name, config')
          .order('survey_name'),
      ]);

      // Map configs to include title from JSON config
      const mappedConfigs = (configs || []).map((s) => ({
        survey_name: s.survey_name,
        title: s.survey_name
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      }));

      setUserRankings(rankings || []);
      setSurveyConfigs(mappedConfigs);
      setLoading(false);

      const hasSeenModal = localStorage.getItem('hasSeenWelcomeModal');
      if (!hasSeenModal) {
        setShowModal(true);
        localStorage.setItem('hasSeenWelcomeModal', 'true');
      }
    };

    loadDashboardData();
  }, []);

  const handleStartSurvey = () => {
    setShowModal(false);
    router.push('/survey');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const latestUser = userRankings?.[0] || {};

  return (
    <>
      <Modal
        show={showModal}
        onClose={handleCloseModal}
        onStartSurvey={handleStartSurvey}
      />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Welcome, {sessionEmail} 👋
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading your data...</p>
        ) : (
          surveyConfigs.map(({ survey_name, title }) => (
            <SurveyInsightsRow
              key={survey_name}
              surveyName={survey_name}
              title={title}
              user={{
                email: sessionEmail,
                gender: latestUser.gender || 'default',
                age: latestUser.age || 'default',
                zip: latestUser.zip || null,
                city: latestUser.city || null,
                state: latestUser.state || null,
                country: latestUser.country || null,
                school: latestUser.school || null,
              }}
              userRankings={userRankings}
            />
          ))
        )}
      </div>
    </div>
  );
}
