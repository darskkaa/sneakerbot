import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/common';

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    else setError(null);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-wsb-dark-base">
      <div className="bg-wsb-dark-panel p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Sign In</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="block text-gray-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-700 focus:border-wsb-primary focus:outline-none"
          />
          <label className="block text-gray-400">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-700 focus:border-wsb-primary focus:outline-none"
          />
          <button
            type="submit"
            className="w-full py-2 bg-wsb-primary text-white rounded"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-gray-400">
          Don’t have an account? <Link to="/signup" className="text-wsb-primary">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
