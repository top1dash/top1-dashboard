// pages/survey.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function SurveyPage() {
  const router = useRouter();
  const [responses, setResponses] = useState({});

  const handleChange = (questionId, value) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User responses:', responses);
    // TODO: Submit to Supabase
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-2xl rounded-xl shadow-md p-8 space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">Stage 1 Survey</h1>

        {/* Question 1: Multiple choice */}
        <div>
          <label className="block text-lg font-medium mb-2">
            Which vacation sounds more fun?
          </label>
          <select
            value={responses.vacation || ''}
            onChange={(e) => handleChange('vacation', e.target.value)}
            className="w-full border rounded px-4 py-2"
            required
          >
            <option value="" disabled>Select one</option>
            <option value="mountains">Hiking in the mountains</option>
            <option value="beach">Relaxing on the beach</option>
            <option value="city">Exploring a new city</option>
          </select>
        </div>

        {/* Question 2: Short answer */}
        <div>
          <label className="block text-lg font-medium mb-2">
            What is your ideal number of kids?
          </label>
          <input
            type="number"
            min="0"
            className="w-full border rounded px-4 py-2"
            value={responses.kids || ''}
            onChange={(e) => handleChange('kids', e.target.value)}
            required
          />
        </div>

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
