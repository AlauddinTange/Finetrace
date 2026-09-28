import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlerts } from '../api/endpoints';
import { Alert } from '../types';
import { Header } from '../components/Header';
import { AlertCard } from '../components/AlertCard';
import { Search, Filter } from 'lucide-react';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAlerts();
        setAlerts(data);
        setFilteredAlerts(data);
      } catch (err) {
        setError('Failed to fetch alerts.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  useEffect(() => {
    let result = alerts;
    if (searchQuery) {
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.alert_code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (severityFilter !== 'ALL') {
      result = result.filter((a) => a.severity === severityFilter);
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((a) => a.status === statusFilter);
    }
    setFilteredAlerts(result);
  }, [searchQuery, severityFilter, statusFilter, alerts]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Alert Investigation Queue</h1>
            <p className="text-xs text-text-secondary mt-1">Review, filter, and investigate triggered risk alerts</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
              />
            </div>

            <div className="flex items-center gap-2 bg-bg-card border border-border rounded-lg px-3 py-2">
              <Filter className="text-text-muted" size={14} />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-transparent text-xs text-text-primary focus:outline-none"
              >
                <option value="ALL" className="bg-bg-card">All Severities</option>
                <option value="LOW" className="bg-bg-card">Low</option>
                <option value="MEDIUM" className="bg-bg-card">Medium</option>
                <option value="HIGH" className="bg-bg-card">High</option>
                <option value="CRITICAL" className="bg-bg-card">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-text-secondary">Loading alerts...</div>
        ) : error ? (
          <div className="text-center py-20 text-accent-red">{error}</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-20 text-text-muted bg-bg-card border border-border rounded-xl">No alerts found matching your criteria.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onClick={(id) => navigate(`/alerts/${id}`)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};