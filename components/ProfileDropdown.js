// components/ProfileDropdown.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';

export default function ProfileDropdown() {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!session) return null;

  return (
    <div className="ml-4">
      <span className="mr-2 text-sm text-gray-600">{session.user.email}</span>
      <button
        onClick={handleLogout}
        className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
      >
        Log Out
      </button>
    </div>
  );
}
