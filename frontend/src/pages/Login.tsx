import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/endpoints';
import { ShieldAlert, Lock, User, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem('access_token', data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
  console.error('LOGIN ERROR:', err);
  setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-bg-card border border-border rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red shadow-[0_0_15px_rgba(255,77,109,0.3)] mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">FIN<span className="text-accent-red">TRACE</span></h1>
          <p className="text-xs text-text-secondary mt-1">Financial Crime Investigation Platform</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg text-xs text-accent-red text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-cyan transition-colors"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-cyan transition-colors"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-cyan hover:bg-accent-cyan/90 text-bg-primary font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(74,222,222,0.2)]"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login; 
