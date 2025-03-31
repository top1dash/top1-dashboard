import { useEffect, useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'

export default function FilteredRankCard({ user }) {
  const [gender, setGender] = useState('default')
  const [age, setAge] = useState('default')
  const [rankData, setRankData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRank = async (genderFilter, ageFilter) => {
    setLoading(true)
    const response = await fetch('/functions/v1/get-filtered-rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        survey_name: 'divorce_risk',
        gender: genderFilter === 'default' ? null : genderFilter,
        age: ageFilter === 'default' ? null : ageFilter
      })
    })
    const data = await response.json()
    setRankData(data)
    setLoading(false)
  }

  useEffect(() => {
    // Auto-apply filters from profile on load
    const defaultGender = user.gender || 'default'
    const defaultAge = user.age || 'default'
    setGender(defaultGender)
    setAge(defaultAge)
    fetchRank(defaultGender, defaultAge)
  }, [user])

  useEffect(() => {
    fetchRank(gender, age)
  }, [gender, age])

  return (
    <Card className="w-full max-w-xl mx-auto p-4">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold">Your Divorce Risk Rank</h2>

        <div className="flex gap-4">
          <div className="flex flex-col">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">All</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="I Consider Myself as Non-Binary">Non-Binary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <Label htmlFor="age">Age</Label>
            <Select value={age} onValueChange={setAge}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Age Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">All</SelectItem>
                {['18-20', '21-24', '25-29', '30-34', '35-39', '40-49', '50-59', '60+'].map(ageGroup => (
                  <SelectItem key={ageGroup} value={ageGroup}>{ageGroup}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <Skeleton className="h-8 w-full rounded-md" />
          ) : (
            <div className="text-lg">
              <p>Rank: <span className="font-bold">#{rankData.rank}</span></p>
              <p>Percentile: <span className="font-bold">{(rankData.percentile * 100).toFixed(1)}%</span></p>
              <p className="text-sm text-muted-foreground mt-1">
                Compared to others with your selected criteria
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
