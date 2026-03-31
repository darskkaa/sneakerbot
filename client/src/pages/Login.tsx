import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react';
import ParticlesWaves from '../components/common/ParticlesWaves';

const MESH_GRADIENT =
  'radial-gradient(ellipse 60% 45% at 10% 15%, rgba(99,102,241,0.18) 0%, transparent 65%),' +
  'radial-gradient(ellipse 50% 50% at 90% 85%, rgba(16,185,129,0.12) 0%, transparent 65%),' +
  'radial-gradient(ellipse 40% 35% at 75% 10%, rgba(139,92,246,0.10) 0%, transparent 55%)';

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
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#030712' }}>
      {/* Gradient mesh */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: MESH_GRADIENT }}
      />
      {/* Particles */}
      <ParticlesWaves />

      {/* Content */}
      <div className="relative flex items-center justify-center min-h-screen px-4" style={{ zIndex: 2 }}>
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, hsl(239 84% 67%) 0%, hsl(260 80% 60%) 100%)',
                boxShadow: '0 0 40px rgba(99,102,241,0.50)',
              }}
            >
              <Zap className="w-7 h-7 text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">SneakerBot</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          {/* Card */}
          <div className="glass-elevated p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
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
    </div>
  );
}
