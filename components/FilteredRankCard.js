import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectItem } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';

export default function FilteredRankCard({ user }) {
  const [gender, setGender] = useState('default');
  const [age, setAge] = useState('default');
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRank = async (genderFilter, ageFilter) => {
    setLoading(true);
    try {
      const response = await fetch('/functions/v1/get-filtered-rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          survey_name: 'divorce_risk',
          gender: genderFilter === 'default' ? null : genderFilter,
          age: ageFilter === 'default' ? null : ageFilter,
        }),
      });

      const data = await response.json();
      setRankData(data);
    } catch (error) {
      console.error('❌ Error fetching filtered rank:', error);
      setRankData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.email) return;
    console.log('✅ TEST: FilteredRankCard loaded with user:', user);

    const defaultGender = user.gender || 'default';
    const defaultAge = user.age || 'default';

    setGender(defaultGender);
    setAge(defaultAge);
    fetchRank(defaultGender, defaultAge);
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      fetchRank(gender, age);
    }
  }, [gender, age]);

  return (
    <Card className="w-full max-w-xl mx-auto p-4 mt-6">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold">Your Divorce Risk Rank</h2>

        <div className="flex gap-4">
          <div className="flex flex-col">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onChange={setGender}>
              <SelectItem value="default">All</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="I Consider Myself as Non-Binary">Non-Binary</SelectItem>
            </Select>
          </div>

          <div className="flex flex-col">
            <Label htmlFor="age">Age</Label>
            <Select value={age} onChange={setAge}>
              <SelectItem value="default">All</SelectItem>
              {['18-20', '21-24', '25-29', '30-34', '35-39', '40-49', '50-59', '60+'].map(ageGroup => (
                <SelectItem key={ageGroup} value={ageGroup}>
                  {ageGroup}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-6">
          {loading || !rankData ? (
            <Skeleton className="h-8 w-full rounded-md" />
          ) : (
            <div className="text-lg">
              <p>
                Rank:{' '}
                <span className="font-bold">
                  {rankData?.rank !== undefined ? `#${rankData.rank}` : 'N/A'}
                </span>
              </p>
              <p>
                Percentile:{' '}
                <span className="font-bold">
                  {rankData?.percentile !== undefined
                    ? `${(rankData.percentile * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Compared to others with your selected criteria
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
