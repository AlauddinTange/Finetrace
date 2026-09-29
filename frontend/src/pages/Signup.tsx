import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ShieldAlert, Lock, User, Mail, ArrowRight } from 'lucide-react';

export const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Adjust endpoint if your backend uses a different registration route (e.g., /api/v1/auth/register)
      await apiClient.post('/api/v1/auth/register', { username, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-bg-card border border-border rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl text-accent-cyan shadow-[0_0_15px_rgba(74,222,222,0.3)] mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">FIN<span className="text-accent-cyan">TRACE</span></h1>
          <p className="text-xs text-text-secondary mt-1">Create Investigator Account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg text-xs text-accent-red text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-cyan transition-colors"
                placeholder="Choose a username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-cyan transition-colors"
                placeholder="investigator@fintrace.io"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-cyan transition-colors"
                placeholder="Create a strong password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-accent-cyan hover:bg-accent-cyan/90 text-bg-primary font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(74,222,222,0.2)]"
          >
            {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-cyan hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};