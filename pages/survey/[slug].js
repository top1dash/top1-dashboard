// pages/survey/[slug].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';

export default function SurveySlugPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [surveyTitle, setSurveyTitle] = useState('');

  useEffect(() => {
    if (!slug) return;

    const fetchSurvey = async () => {
      const { data, error } = await supabase
        .from('survey.config')
        .select('config')
        .eq('survey_name', slug)
        .single();

      if (error) {
        console.error('Error fetching survey config:', error);
      } else {
        try {
          console.log('Survey config pulled:', data.config); // ✅ Console log here

          if (!data.config) {
            console.error('No config found in data:', data);
            return;
          }

          const parsed = JSON.parse(data.config);
          setQuestions(parsed.questions || []);
          setSurveyTitle(parsed.title || slug);
        } catch (err) {
          console.error('Invalid JSON config:', err);
        }
      }
      setLoading(false);
    };

    fetchSurvey();
  }, [slug]);

  const handleChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('User responses:', responses);
    // TODO: Save to Supabase if desired
    router.push('/dashboard');
  };

  if (loading) {
    return <p className="p-6 text-center">Loading survey...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-2xl rounded-xl shadow-md p-8 space-y-6"
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          {surveyTitle.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} Survey
        </h1>

        {questions.map((q) => (
          <div key={q.id}>
            <label className="block text-lg font-medium mb-2">{q.text}</label>

            {q.type === 'multiple_choice' && (
              <select
                value={responses[q.id] || ''}
                onChange={(e) => handleChange(q.id, e.target.value)}
                className="w-full border rounded px-4 py-2"
                required
              >
                <option value="" disabled>Select one</option>
                {q.choices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            )}

            {q.type === 'image_choice' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {q.choices.map((choice) => (
                  <div
                    key={choice.value}
                    onClick={() => handleChange(q.id, choice.value)}
                    className={`cursor-pointer border rounded-lg p-2 hover:shadow ${
                      responses[q.id] === choice.value ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={choice.image}
                      alt={choice.label}
                      className="w-full h-32 object-cover rounded"
                    />
                    <p className="text-sm text-center mt-2">{choice.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Submit Survey
          </button>
        </div>
      </form>
    </div>
  );
}
