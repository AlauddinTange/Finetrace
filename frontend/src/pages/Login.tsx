import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/endpoints';
import { ShieldAlert, User, Lock, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      localStorage.setItem('access_token', data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 selection:bg-accent-cyan/20">
      <div className="bg-bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex flex-col items-center">

        {/* Glowing Shield Icon */}
        <div className="p-3.5 bg-accent-red/10 border border-accent-red/30 rounded-2xl text-accent-red shadow-[0_0_15px_rgba(239,68,68,0.15)] mb-5">
          <ShieldAlert size={28} />
        </div>

        {/* Brand Title */}
        <h1 className="text-xl font-bold tracking-wider text-text-primary mb-1">
          FIN<span className="text-accent-red">TRACE</span>
        </h1>
        <p className="text-xs text-text-secondary mb-8">Financial Crime Investigation Platform</p>

        {error && (
          <div className="w-full mb-4 p-3 bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <User size={16} />
              </span>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 bg-accent-cyan hover:bg-accent-cyan/90 text-bg-card font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};