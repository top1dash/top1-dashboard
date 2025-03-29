// pages/surveys/index.js
import Link from 'next/link';

export default function SurveysIndex() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6">Choose a Survey</h1>

        <Link href="/survey/divorce_risk">
          <a className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition">
            Divorce Risk Survey
          </a>
        </Link>
      </div>
    </div>
  );
}
