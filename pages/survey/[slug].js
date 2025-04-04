// pages/survey/[slug].js
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';
import CollegeAutocompleteInput from "../components/ui/CollegeAutocompleteInput";


function AddressAutocompleteInput({ questionId, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (window.google && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const components = {};

        place.address_components.forEach(comp => {
          comp.types.forEach(type => {
            components[type] = comp.long_name;
          });
        });

        const value = {
          formatted_address: place.formatted_address,
          city: components.locality || '',
          state: components.administrative_area_level_1 || '',
          zip: components.postal_code || '',
        };

        onChange(questionId, value);
      });
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Start typing your address..."
      className="border p-2 rounded w-full"
    />
  );
}

function ToggleSwitch({ value, onChange }) {
  const isOn = value === true;

  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
        isOn ? 'bg-gray-300 border border-gray-600' : 'bg-gray-200'
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
          isOn ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

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

            {q.type === 'boolean' && (
              <ToggleSwitch
                value={!!responses[q.id]}
                onChange={(val) => handleChange(q.id, val)}
              />
            )}

            {q.type === 'address_autocomplete' && (
              <AddressAutocompleteInput
                questionId={q.id}
                onChange={handleChange}
              />
            )}
            {/* ✅ Add this new block below for college_autocomplete */}
            {q.type === 'college_autocomplete' && (
            <CollegeAutocompleteInput
            questionId={q.id}
            onChange={handleChange}
      />
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
