// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Top1Percent Rankings</h1>
        <p className="text-gray-600 mb-6">
          This is the home of the most insightful survey-driven data rankings. Ready to see your results?
        </p>
        <Link href="/dashboard?email=cherry@hotmail.com">
          <a className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg shadow hover:bg-blue-700 transition">
            Go to Your Dashboard
          </a>
        </Link>
      </div>
    </div>
  );
}
