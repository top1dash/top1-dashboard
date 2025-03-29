// pages/survey.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';

export default function SurveyPage() {
  const [sessionEmail, setSessionEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user) {
        router.push('/login');
        return;
      }

      setSessionEmail(session.user.email);
      setLoading(false);
    };

    checkSession();
  }, [router]);

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Navbar />
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow mt-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Survey Coming Soon</h1>
        <p className="text-gray-700 text-lg mb-4">
          Welcome, <span className="font-semibold">{sessionEmail}</span>!
        </p>
        <p className="text-gray-600 mb-6">
          This is where you'll be able to take your personalized survey and see how you compare to others.
        </p>

        {/* 🔗 Optional: add Jotform link or button here */}
        {/* <a href="https://form.jotform.com/YOUR_FORM_ID" target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
          Start Survey Now
        </a> */}
      </div>
    </div>
  );
}
