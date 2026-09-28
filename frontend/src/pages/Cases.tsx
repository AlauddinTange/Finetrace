import React, { useEffect, useState } from 'react';
import { getCases, updateCaseStatus } from '../api/endpoints';
import { Case } from '../types';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';

const COLUMNS = ['NEW', 'INVESTIGATING', 'ESCALATED', 'CLOSED', 'FALSE_POSITIVE'];

export const Cases: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getCases();
        setCases(data);
      } catch (err) {
        setError('Failed to fetch cases.');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateCaseStatus(id, newStatus);
      setCases(cases.map((c) => (c.id === id ? { ...c, status: newStatus as any } : c)));
    } catch (err) {
      alert('Failed to update case status.');
    }
  };

  if (loading) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-secondary">Loading cases Kanban board...</div>;
  if (error) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-accent-red">{error}</div>;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Investigation Cases Kanban</h1>
          <p className="text-xs text-text-secondary mt-1">Manage lifecycle status of ongoing financial crime cases</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const columnCases = cases.filter((c) => c.status === col);
            return (
              <div key={col} className="bg-bg-card border border-border rounded-xl p-4 flex flex-col min-w-[260px]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">{col.replace('_', ' ')}</span>
                  <span className="px-2 py-0.5 rounded-full bg-bg-elevated text-xs font-mono text-accent-cyan border border-border">
                    {columnCases.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {columnCases.map((item) => (
                    <div key={item.id} className="bg-bg-elevated border border-border rounded-lg p-3 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-text-muted">{item.case_id || `CS-${item.id.slice(0, 6)}`}</span>
                        <RiskBadge level={item.risk_level || 'MEDIUM'} />
                      </div>
                      <div className="text-sm font-medium text-text-primary">Employee: {item.employee_name || item.employee_id || 'N/A'}</div>
                      <div className="text-xs text-text-muted">Assigned: {item.assigned_to || 'Unassigned'}</div>
                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Evidence: {item.evidence_count || 3}</span>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="bg-bg-card border border-border rounded text-[10px] text-text-primary px-1.5 py-1 focus:outline-none"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};