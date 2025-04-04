// pages/survey/[slug].js
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';

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
          setSurveyTitle(slug.replace(/_/g, ' '));
          setLoading(false);
        } catch (parseErr) {
          console.error('Error parsing survey config:', parseErr);
        }
      }
    };

    fetchSurvey();
  }, [slug]);

  const handleSubmit = async () => {
    const { error } = await supabase.from('responses').insert([
      {
        survey_name: slug,
        user_email: (await supabase.auth.getUser()).data.user.email,
        response: responses,
      },
    ]);

    if (error) {
      console.error('Error saving responses:', error);
    } else {
      alert('Survey submitted successfully!');
      router.push('/dashboard');
    }
  };

  if (loading) return <p>Loading survey...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{surveyTitle}</h1>

      {questions.map((q) => (
        <div key={q.id} className="mb-4">
          <p className="mb-1 font-medium">{q.text}</p>

          {q.type === 'multiple_choice' && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((option) => (
                <button
                  key={option}
                  className={`border px-4 py-2 rounded ${responses[q.id] === option ? 'bg-blue-500 text-white' : ''}`}
                  onClick={() => setResponses({ ...responses, [q.id]: option })}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {q.type === 'address_autocomplete' && (
            <AddressAutocompleteInput
              questionId={q.id}
              onChange={(id, value) => setResponses({ ...responses, [id]: value })}
            />
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-6 py-2 rounded mt-4 hover:bg-green-700"
      >
        Submit
      </button>
    </div>
  );
}
