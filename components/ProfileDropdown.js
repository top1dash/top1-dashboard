// components/ui/ProfileDropdown.js
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../supabaseClient';

export default function ProfileDropdown() {
  const [session, setSession] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="relative ml-4" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="text-gray-700 hover:text-blue-600 text-sm"
      >
        Menu ▾
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow z-50">
          {session ? (
            <>
              <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">Dashboard</Link>
              <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-4 py-2 hover:bg-gray-100">Log In</Link>
              <Link href="/signup" className="block px-4 py-2 hover:bg-gray-100">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
