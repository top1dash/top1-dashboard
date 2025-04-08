import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import FilterChips from './FilterChips';
import { BarChart2, ShieldCheck } from 'lucide-react';

export default function SurveyInsightsRow({ surveyName, title, user, userRankings }) {
  const [filtered, setFiltered] = useState(null);
  const [ranking, setRanking] = useState(null);

  useEffect(() => {
    const found = userRankings.find((r) => r.survey_name === surveyName);
    setRanking(found);
  }, [userRankings, surveyName]);

  const formatFilterLabel = (data) => {
    const gender = data?.gender?.toLowerCase() || 'all';
    const fields = ['zip', 'city', 'state', 'country', 'school', 'age'];
    const found = fields.find((field) => data?.[field]);
    if (!found) return `Among ${gender} users`;

    const raw = data[found];
    const value = typeof raw === 'object' && raw !== null ? Object.keys(raw)[0] : raw;

    let detail = '';
    switch (found) {
      case 'zip':
      case 'city':
      case 'state':
      case 'country':
        detail = `in ${value}`;
        break;
      case 'age':
        detail = `between age ${value}`;
        break;
      case 'school':
        detail = `at ${value}`;
        break;
    }

    return `Among ${gender} users ${detail}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
      {/* Filter column */}
      <div className="col-span-1">
        <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">{title} Filters</h3>
          <FilterChips
            user={user}
            surveyName={surveyName}
            updatedAt={ranking?.updated_at}
            onUpdate={setFiltered}
          />
        </div>
      </div>

      {/* 3 Tile Column */}
      <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Percentile */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-700">{title} Percentile</h2>
            <BarChart2 className="w-5 h-5 text-emerald-500" />
          </div>
          {ranking && (
            <>
              <p className="text-4xl font-bold text-emerald-600">
                {(filtered?.percentile ?? ranking?.percentile_rank * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatFilterLabel(filtered)}
              </p>
            </>
          )}
        </div>

        {/* Change Since Last Login */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Change Since Last Login</h2>
            <BarChart2 className="w-5 h-5 text-gray-400" />
          </div>
          {ranking && userRankings.length > 1 && (() => {
            const latest = filtered?.percentile ?? ranking?.percentile_rank;
            const previous = userRankings.find(
              r => r.survey_name === surveyName && r.id !== ranking.id
            )?.percentile_rank;
            const change = latest && previous ? (latest - previous) * 100 : 0;
            const sign = change >= 0 ? '+' : '';
            const iconColor =
              change > 0 ? 'text-emerald-600' :
              change < 0 ? 'text-red-500' :
              'text-gray-500';

            return (
              <p className={`text-3xl font-bold ${iconColor}`}>
                {sign}{change.toFixed(1)}%
              </p>
            );
          })()}
        </div>

        {/* Score */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
            <ShieldCheck className="w-5 h-5 text-blue-500" />
          </div>
          {ranking && (
            <>
              <p className="text-4xl font-bold text-blue-600">
                {(ranking?.total_score * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-500">
                Top {(filtered?.percentile ?? ranking?.percentile_rank * 100).toFixed(0)}% of users
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
