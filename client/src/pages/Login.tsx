import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4">
            <Zap className="w-6 h-6 text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">SneakerBot</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="form-input pl-9"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="btn-primary w-full justify-center"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
