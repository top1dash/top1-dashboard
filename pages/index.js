// pages/surveys/index.js
import Link from 'next/link';

export default function SurveysIndex() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-xl bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Choose a Survey</h1>

        <div className="space-y-4">
          <Link href="/surveys/divorce_risk">
            <a className="w-full block bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded text-lg text-center transition">
              Divorce Risk Survey
            </a>
          </Link>

          {/* You can add more buttons here as you add more surveys */}
        </div>
      </div>
    </div>
  );
}
