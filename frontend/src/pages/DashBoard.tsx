import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getAlerts } from '../api/endpoints';
import { DashboardStats, Alert } from '../types';
import { Header } from '../components/Header';
import { KPICard } from '../components/KPICard';
import { RiskBadge } from '../components/RiskBadge';
import { ShieldAlert, AlertTriangle, FolderOpen, Users, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashData, alertsData] = await Promise.all([getDashboard(), getAlerts()]);
        setStats(dashData);
        setRecentAlerts(alertsData.slice(0, 10));
      } catch (err) {
        setError('Failed to load dashboard data from backend.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-text-secondary">Loading command center...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-accent-red">{error || 'No stats available'}</div>
      </div>
    );
  }

  const pieData = stats.severity_breakdown || [
    { severity: 'LOW', count: 12 },
    { severity: 'MEDIUM', count: 8 },
    { severity: 'HIGH', count: 5 },
    { severity: 'CRITICAL', count: 3 },
  ];

  const COLORS = ['#00E5A0', '#F5A623', '#FF4D6D', '#FF4D6D'];

  const trendData = stats.alerts_trend || [
    { date: 'Day 1', count: 4 },
    { date: 'Day 10', count: 8 },
    { date: 'Day 20', count: 6 },
    { date: 'Day 30', count: 12 },
  ];

  const employeeData = stats.top_employees || [
    { name: 'Emp #102', count: 7 },
    { name: 'Emp #108', count: 5 },
    { name: 'Emp #210', count: 4 },
    { name: 'Emp #311', count: 3 },
  ];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard icon={<ShieldAlert size={20} />} label="Total Alerts" value={stats.total_alerts} trend="+12%" />
          <KPICard icon={<AlertTriangle size={20} />} label="High Risk" value={stats.high_risk_alerts} trend="+5%" />
          <KPICard icon={<FolderOpen size={20} />} label="Active Cases" value={stats.active_cases} />
          <KPICard icon={<Users size={20} />} label="Employees Flagged" value={stats.employees_flagged} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">Alerts Trend (Last 30 Days)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="date" stroke="#4F5568" fontSize={12} tickLine={false} />
                  <YAxis stroke="#4F5568" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#131721', borderColor: '#232838', borderRadius: '8px', color: '#E6E9EF' }} />
                  <Line type="monotone" dataKey="count" stroke="#4ADEDE" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">Alerts by Severity</h2>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#131721', borderColor: '#232838', borderRadius: '8px', color: '#E6E9EF' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-bg-card border border-border rounded-xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Recent Alerts</h2>
              <button onClick={() => navigate('/alerts')} className="text-xs text-accent-cyan hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary">
                <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Severity</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentAlerts.map((alert) => (
                    <tr key={alert.id} onClick={() => navigate(`/alerts/${alert.id}`)} className="hover:bg-bg-elevated cursor-pointer transition-colors">
                      <td className="py-3 font-mono text-xs text-text-muted">{alert.alert_code}</td>
                      <td className="py-3 font-medium">{alert.title}</td>
                      <td className="py-3"><RiskBadge level={alert.severity} /></td>
                      <td className="py-3 text-xs text-text-secondary">{alert.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">Top Employees by Alerts</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeData}>
                  <XAxis dataKey="name" stroke="#4F5568" fontSize={10} />
                  <YAxis stroke="#4F5568" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#131721', borderColor: '#232838', borderRadius: '8px', color: '#E6E9EF' }} />
                  <Bar dataKey="count" fill="#FF4D6D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 
export default Dashboard; 
