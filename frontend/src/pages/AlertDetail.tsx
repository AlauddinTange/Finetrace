import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAlert, getTransactions } from '../api/endpoints';
import { Alert, Transaction } from '../types';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { CheckCircle2, ArrowLeft, ShieldAlert, Cpu } from 'lucide-react';

export const AlertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const [alertData, txData] = await Promise.all([getAlert(id), getTransactions()]);
        setAlert(alertData);
        setTransactions(txData);
      } catch (err) {
        setError('Failed to fetch alert details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-secondary">Loading alert investigation...</div>;
  if (error || !alert) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-accent-red">{error || 'Alert not found'}</div>;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <button onClick={() => navigate('/alerts')} className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={14} /> Back to Alerts
        </button>

        <div className="bg-bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-text-muted">{alert.alert_code}</span>
              <RiskBadge level={alert.severity} />
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-bg-elevated border border-border text-text-secondary uppercase">
                {alert.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-text-primary">{alert.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-bg-elevated border border-border hover:border-accent-cyan text-text-primary text-xs font-semibold rounded-lg transition-colors">
              DISMISS
            </button>
            <button className="px-4 py-2 bg-accent-amber/20 border border-accent-amber/40 text-accent-amber text-xs font-semibold rounded-lg transition-colors">
              ESCALATE
            </button>
            <button className="px-4 py-2 bg-accent-cyan text-bg-primary text-xs font-semibold rounded-lg transition-colors shadow-[0_0_12px_rgba(74,222,222,0.2)]">
              INVESTIGATE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Why Flagged</h2>
            <ul className="space-y-3">
              {(alert.signals || ['Structuring threshold crossed', 'Unusual login timestamp', 'Rapid multi-beneficiary transfer']).map((signal, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-text-primary">
                  <CheckCircle2 className="text-accent-green mt-0.5 shrink-0" size={16} />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4 self-start">Entity Network Preview</h2>
            <div className="p-4 bg-bg-elevated border border-border rounded-lg text-text-muted flex flex-col items-center justify-center w-full h-40">
              <ShieldAlert className="text-accent-cyan mb-2" size={28} />
              <span className="text-xs">1-Hop Graph Relationship Node Preview</span>
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-accent-cyan">
              <Cpu size={16} />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">LLM Investigation Summary</h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {alert.llm_explanation || alert.summary || 'Automated graph pattern analysis identified anomalous rapid movement of capital exceeding structural risk parameters between associated employee and external beneficiary accounts.'}
            </p>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">Evidence & Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-primary">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Sender</th>
                  <th className="pb-3">Receiver</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-bg-elevated transition-colors">
                    <td className="py-3 font-mono text-xs text-text-muted">{tx.transaction_id}</td>
                    <td className="py-3">{tx.sender_account}</td>
                    <td className="py-3">{tx.receiver_account}</td>
                    <td className="py-3 font-semibold text-accent-cyan">${tx.amount?.toLocaleString()}</td>
                    <td className="py-3 text-xs text-text-secondary">{new Date(tx.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};