// components/Navbar.js
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProfileDropdown from './ProfileDropdown';
import { supabase } from '../supabaseClient';

export default function Navbar() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <div className="text-2xl font-bold">
        <Link href="/">Top1Dash</Link>
      </div>

      <div className="space-x-4 flex items-center">
        <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
          Dashboard
        </Link>

        <Link href="/survey" className="text-gray-700 hover:text-blue-600">
          Surveys
        </Link>

        {!session && (
          <>
            <Link href="/login" className="text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link href="/signup" className="text-gray-700 hover:text-blue-600">
              Sign Up
            </Link>
          </>
        )}

        <ProfileDropdown />
      </div>
    </nav>
  );
}
