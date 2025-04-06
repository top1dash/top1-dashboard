import React, { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import { supabase } from '../supabaseClient';
import FilterChips from './FilterChips';

const FILTER_OPTIONS = ['all', 'age', 'zip/postal_code', 'city', 'state', 'country', 'school'];

export default function FilteredRankCard({ user, surveyName, updatedAt, onUpdate }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [surveyConfig, setSurveyConfig] = useState({ higher_is_better: true });

  useEffect(() => {
    const fetchSurveyConfig = async () => {
      const { data, error } = await supabase
        .from('survey_config')
        .select('higher_is_better')
        .eq('survey_name', surveyName)
        .single();

      if (data) setSurveyConfig(data);
    };

    fetchSurveyConfig();
  }, [surveyName]);

  const fetchRank = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const filters = {
        email: user.email,
        survey_name: surveyName,
        gender: user.gender,
        age: activeFilter === 'age' ? user.age : null,
        zip: activeFilter === 'zip/postal_code' ? user.zip : null,
        city: activeFilter === 'city' ? user.city : null,
        state: activeFilter === 'state' ? user.state : null,
        country: activeFilter === 'country' ? user.country : null,
        school: activeFilter === 'school' ? user.school : null,
      };

      console.log('📡 Fetching filtered rank for:', filters);

      const response = await fetch(
        'https://hwafvupabcnhialqqgxy.supabase.co/functions/v1/get-filtered-rank',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(filters),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const adjustedData =
          surveyConfig.higher_is_better || data.percentile === null
            ? data
            : {
                ...data,
                percentile: 1 - data.percentile,
              };

        onUpdate?.(activeFilter === 'all' ? null : adjustedData);
      } else {
        console.error('❌ Supabase function error:', data?.error || 'Unknown');
        onUpdate?.(null);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      onUpdate?.(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRank();
  }, [activeFilter, surveyName, surveyConfig]);

  return (
    <div className="mt-2 flex justify-center">
      <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
    </div>
  );
}
