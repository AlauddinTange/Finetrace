import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, AlertTriangle, FolderKanban, Network, BarChart2, LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/cases', label: 'Cases', icon: FolderKanban },
    { path: '/graph', label: 'Graph', icon: Network },
    { path: '/benchmark', label: 'Benchmark', icon: BarChart2 },
  ];

  return (
    <header className="bg-bg-card border-b border-border sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="p-2 bg-accent-red/10 border border-accent-red/30 rounded-lg text-accent-red shadow-[0_0_10px_rgba(255,77,109,0.2)]">
            <ShieldAlert size={22} />
          </div>
          <span className="font-bold text-lg tracking-wider text-text-primary">FIN<span className="text-accent-red">TRACE</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-bg-elevated text-accent-cyan border border-border shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 bg-bg-elevated border border-border px-3 py-1.5 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan text-xs font-bold">
            <User size={14} />
          </div>
          <span className="text-xs font-medium text-text-primary hidden sm:inline">Investigator</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 bg-bg-elevated border border-border rounded-lg text-text-secondary hover:text-accent-red hover:border-accent-red/40 transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
 
export default Header; 
