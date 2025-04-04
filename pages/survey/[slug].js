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
        .from('survey_config')
        .select('config')
        .eq('survey_name', slug)
        .single();

      if (error) {
        console.error('Error fetching survey config:', error);
      } else {
        try {
          if (!data.config) {
            console.error('No config found in data:', data);
            return;
          }

          setQuestions(data.config.questions || []);
          setSurveyTitle(data.config.survey_name || slug);
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

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.email) {
        alert('You must be logged in to submit.');
        return;
      }

      // ✅ Pull name fields from user metadata
      const firstName = user.user_metadata?.first_name || null;
      const lastName = user.user_metadata?.last_name || null;

      const { error } = await supabase.from('responses').insert([
        {
          email: user.email,
          name_first: firstName,
          name_last: lastName,
          answer_map: responses,
          survey_name: slug,
        },
      ]);

      if (error) {
        console.error('❌ Error saving response:', error);
        alert('Something went wrong. Please try again.');
      } else {
        console.log('✅ Survey submitted successfully');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      alert('Unexpected error occurred.');
    }
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
            <label className="block text-lg font-medium mb-4">{q.text}</label>

            {q.type === 'multiple_choice' && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`px-4 py-2 rounded-full border text-sm transition 
                      ${responses[q.id] === option
                        ? 'bg-gray-300 border-gray-600 text-black font-medium'
                        : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleChange(q.id, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {q.type === 'image_choice' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {q.options.map((choice, index) => (
                  <div
                    key={index}
                    onClick={() => handleChange(q.id, choice.label)}
                    className={`cursor-pointer border rounded-lg p-2 hover:shadow ${
                      responses[q.id] === choice.label ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={choice.image_url}
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
