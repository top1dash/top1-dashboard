// pages/signup.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push('/dashboard');
    };
    checkSession();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    // Split full name into first and last
    const [name_first, ...rest] = name.trim().split(' ');
    const name_last = rest.join(' ') || '';

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name_first,
          name_last,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        <div className="space-y-3 mb-6">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border rounded py-2 hover:bg-yellow-300 bg-yellow-400 font-medium"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_icon.png" alt="Amazon" className="w-5 h-5" />
            Continue with Amazon
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border rounded py-2 hover:bg-gray-100"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="w-5 h-5" />
            Continue with Apple
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border rounded py-2 hover:bg-gray-100"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>

        <hr className="mb-6" />

        <form onSubmit={handleSignup}>
          <label className="block mb-1 text-sm font-medium">Your name</label>
          <input
            type="text"
            placeholder="First and last name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-full text-sm"
            required
          />

          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-full text-sm"
            required
          />

          <label className="block mb-1 text-sm font-medium">Password</label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-full text-sm"
            required
          />
          <p className="text-xs text-gray-500 mt-1 mb-3">
            ⓘ Passwords must be at least 6 characters.
          </p>

          <label className="block mb-1 text-sm font-medium">Re-enter password</label>
          <input
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-full text-sm"
            required
          />

          {errorMsg && (
            <p className="text-red-500 text-sm mb-4 text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-full text-sm hover:bg-gray-900 transition"
          >
            Create account
          </button>
        </form>

        <p className="text-xs text-gray-600 text-center mt-4">
          By creating an account, you agree to the{' '}
          <a href="#" className="underline">Terms of Service</a> and{' '}
          <a href="#" className="underline">Privacy Policy</a>.
        </p>

        <p className="text-sm text-center mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 underline hover:text-blue-800">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
