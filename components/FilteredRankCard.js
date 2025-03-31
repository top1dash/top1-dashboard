import { useEffect } from 'react';

export default function FilteredRankCard({ user }) {
  useEffect(() => {
    console.log('🧪 TEST: FilteredRankCard loaded with user:', user);
  }, [user]);

  if (!user?.email) {
    return <p className="text-red-500">⚠️ No user email provided</p>;
  }

  return (
    <div className="bg-yellow-100 text-yellow-800 p-4 mt-6 rounded-md">
      ✅ FilteredRankCard rendered! (email: {user.email})
    </div>
  );
}
