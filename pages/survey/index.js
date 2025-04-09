// pages/survey/index.js
import Link from 'next/link';

export default function SurveysIndex() {
  return (
    <>
      <div className="bg-white shadow rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6">Choose a Survey</h1>

        <Link href="/survey/divorce_risk">
          <a className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition mb-4">
            Divorce Risk Survey
          </a>
        </Link>

        <Link href="/survey/physical_appearance_survey">
          <a className="w-full block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition">
            Body Image + Genetics Survey
          </a>
        </Link>
      </div>
    </>
  );
}
