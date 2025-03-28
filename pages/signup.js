// pages/signup.js
import { useState , useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push('/dashboard');
    }
  };
  checkSession();
}, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      alert('Account created! Please log in.');
      router.push('/login');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-4 px-4 py-2 border rounded" required />
        <input type="password" name="password" autoComplete="new-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-3 border rounded-md" required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Sign Up</button>
      </form>
    </div>
  );
}
