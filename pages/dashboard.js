
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";

const mockData = [
  {
    email: "cherry@hotmail.com",
    name: "Austin",
    chanceOfDivorce: 5.1,
    percentileRank: 38.5,
  },
  {
    email: "hello@ymail.com",
    name: "sweet",
    chanceOfDivorce: 60,
    percentileRank: 61.5,
  },
  {
    email: "hello@googleface.com",
    name: "Bubba",
    chanceOfDivorce: 105,
    percentileRank: 69.2,
  },
];

export default function Dashboard() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (emailParam) {
      const found = mockData.find((item) => item.email === emailParam);
      setUser(found);
    }
  }, [emailParam]);

  if (!user) {
    return <div className="p-4 text-center">User not found. Please check your link.</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Welcome, {user.name}!</h1>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold">Your Chance of Divorce</h2>
          <p className="text-3xl text-red-600 font-bold">{user.chanceOfDivorce}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold">Your Percentile Rank</h2>
          <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
            <div
              className="h-4 bg-green-500 rounded-full"
              style={{ width: `${user.percentileRank}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            You're in the top {user.percentileRank}% of users
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
