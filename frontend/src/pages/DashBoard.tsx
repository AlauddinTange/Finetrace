import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getAlerts, updateCaseStatus } from '../api/endpoints';
import { DashboardStats, Alert, Case } from '../types';
import { Header } from '../components/Header';
import { KPICard } from '../components/KPICard';
import { RiskBadge } from '../components/RiskBadge';
import { ShieldAlert, FolderKanban, Users, AlertTriangle, ArrowRight, TrendingUp, X, CheckCircle, Cpu, Network, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'cases' | 'graph'>('feed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, alertsData] = await Promise.all([getDashboard(), getAlerts()]);
        setStats(statsData);
        setAlerts(alertsData);
      } catch (err) {
        setError('Failed to load command center data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-secondary animate-pulse">Initializing FINTRACE Intelligence Hub...</div>;
  if (error) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-accent-red">{error}</div>;

  const chartData = stats?.alerts_trend || [
    { date: 'Mon', count: 12 },
    { date: 'Tue', count: 18 },
    { date: 'Wed', count: 25 },
    { date: 'Thu', count: 19 },
    { date: 'Fri', count: 32 },
    { date: 'Sat', count: 15 },
    { date: 'Sun', count: 22 },
  ];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col selection:bg-accent-cyan/30">
      <Header />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Simple Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-card border border-border rounded-xl p-5 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent-green animate-ping" />
              <h1 className="text-xl font-bold text-text-primary">Autonomous Surveillance Active</h1>
            </div>
            <p className="text-xs text-text-secondary">AI models are actively monitoring transaction streams and network graphs in real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/graph')}
              className="px-4 py-2 bg-bg-elevated border border-border hover:border-accent-cyan text-text-primary font-medium rounded-lg text-xs flex items-center gap-2 transition-all"
            >
              <Network size={14} className="text-accent-cyan" /> Graph Explorer
            </button>
            <button
              onClick={() => navigate('/cases')}
              className="px-4 py-2 bg-accent-cyan text-bg-primary font-semibold rounded-lg text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(74,222,222,0.2)] transition-all hover:bg-accent-cyan/90"
            >
              <Zap size={14} /> View Kanban Cases
            </button>
          </div>
        </div>

        {/* Simplified KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={<AlertTriangle size={18} />} label="Total Alerts" value={stats?.total_alerts || 148} trend="+12%" />
          <KPICard icon={<ShieldAlert size={18} />} label="High Risk Triggers" value={stats?.high_risk_alerts || 24} trend="+4 critical" />
          <KPICard icon={<FolderKanban size={18} />} label="Active Cases" value={stats?.active_cases || 12} />
          <KPICard icon={<Users size={18} />} label="Flagged Employees" value={stats?.employees_flagged || 5} />
        </div>

        {/* Analytics & Trend Graph */}
        <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">System-Wide Alert Velocity</h2>
            <span className="text-xs text-accent-cyan font-mono bg-bg-elevated px-2 py-1 rounded border border-border">Real-Time Feed</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ADEDE" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4ADEDE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232838" />
                <XAxis dataKey="date" stroke="#8A93A5" fontSize={11} />
                <YAxis stroke="#8A93A5" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#131721', borderColor: '#232838', borderRadius: '8px', color: '#E6E9EF' }} />
                <Area type="monotone" dataKey="count" stroke="#4ADEDE" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Alert Queue Table */}
        <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Priority Investigation Queue</h2>
            <span className="text-xs text-text-muted">Click any item to open instant AI triage drawer</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-primary">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Alert Title</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Quick Triage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className="hover:bg-bg-elevated/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 font-mono text-xs text-text-muted">{alert.alert_code || `ALT-${alert.id.slice(0, 6)}`}</td>
                    <td className="py-3.5 font-medium text-text-primary group-hover:text-accent-cyan transition-colors">{alert.title}</td>
                    <td className="py-3.5"><RiskBadge level={alert.severity} /></td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-bg-elevated border border-border text-text-secondary uppercase">
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="text-xs text-accent-cyan font-medium inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Inspect <ArrowRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Slide-Over Instant Triage Drawer (Interactive & Simple) */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-lg bg-bg-card border-l border-border h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-muted">{selectedAlert.alert_code}</span>
                  <RiskBadge level={selectedAlert.severity} />
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-1.5 bg-bg-elevated rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <h2 className="text-lg font-bold text-text-primary mb-2">{selectedAlert.title}</h2>
                <p className="text-sm text-text-secondary leading-relaxed">{selectedAlert.summary}</p>
              </div>

              <div className="p-4 bg-bg-elevated border border-border rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-accent-cyan">
                  <Cpu size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Autonomous LLM Summary</span>
                </div>
                <p className="text-xs text-text-primary leading-relaxed">
                  {selectedAlert.llm_explanation || 'Graph model flagged an anomalous multi-hop layering pattern across secondary entity accounts exceeding structural risk limits.'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Trigger Signals</span>
                <ul className="space-y-2">
                  {(selectedAlert.signals || ['Structuring threshold crossed', 'Rapid velocity transfer']).map((sig, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-text-primary bg-bg-elevated p-2.5 rounded-lg border border-border">
                      <CheckCircle size={14} className="text-accent-green shrink-0" />
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex items-center gap-3">
              <button
                onClick={() => setSelectedAlert(null)}
                className="flex-1 py-2.5 bg-bg-elevated border border-border hover:border-accent-red text-text-primary text-xs font-semibold rounded-lg transition-colors"
              >
                Dismiss Alert
              </button>
              <button
                onClick={() => {
                  navigate(`/alerts/${selectedAlert.id}`);
                }}
                className="flex-1 py-2.5 bg-accent-cyan text-bg-primary text-xs font-semibold rounded-lg transition-colors shadow-[0_0_12px_rgba(74,222,222,0.2)]"
              >
                Full Investigation View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
export default Dashboard; 
