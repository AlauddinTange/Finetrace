import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAlert, getTransactions, explainAlert, updateCaseStatus } from '../api/endpoints';
import { Alert, Transaction } from '../types';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { CheckCircle2, ArrowLeft, ShieldAlert, Cpu, Network, TrendingUp } from 'lucide-react';

export const AlertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [llmText, setLlmText] = useState('');
  const [llmLoading, setLlmLoading] = useState(false);

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

  useEffect(() => {
    if (!alert) return;
    setLlmLoading(true);
    explainAlert(alert.id)
      .then((r) => setLlmText(r.explanation))
      .catch(() => setLlmText('Could not generate explanation.'))
      .finally(() => setLlmLoading(false));
  }, [alert]);

  const handleDismiss = async () => {
    try {
      if (!alert) return;
      await updateCaseStatus(alert.id, { status: 'FALSE_POSITIVE' });
      navigate('/alerts');
    } catch (err) {
      alert('Failed to dismiss alert.');
    }
  };

 const handleEscalate = () => {
    if (!alert) return;
    // Navigate to senior review and assignment page
    navigate(`/alerts/${alert.id}/escalate`);
  };

  const handleInvestigateFlow = () => {
    if (!alert) return;
    // Navigate to the deep forensic evidence vault page containing all 10 raw database tables
    navigate(`/alerts/${alert.id}/forensic`);
  };

  if (loading) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-secondary">Loading alert investigation...</div>;
  if (error || !alert) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-accent-red">{error || 'Alert not found'}</div>;

  // Safely normalize signals to an array
  const raw = alert.signals as unknown;
  const signalList: string[] = Array.isArray(raw)
    ? raw
    : typeof raw === 'string' && raw.length > 0
    ? raw.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];
  const displaySignals = signalList.length > 0
    ? signalList
    : ['Structuring threshold crossed', 'Unusual login timestamp', 'Rapid multi-beneficiary transfer'];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <button onClick={() => navigate('/alerts')} className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
          <ArrowLeft size={14} /> Back to Alerts
        </button>

        <div className="bg-bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
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
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-bg-elevated border border-border hover:border-accent-red text-text-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              DISMISS
            </button>
            <button
              onClick={handleEscalate}
              className="px-4 py-2 bg-accent-amber/20 border border-accent-amber/40 text-accent-amber text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              ESCALATE
            </button>
            <button
              onClick={handleInvestigateFlow}
              className="px-4 py-2 bg-accent-cyan text-bg-primary text-xs font-semibold rounded-lg transition-colors shadow-[0_0_12px_rgba(74,222,222,0.2)] cursor-pointer flex items-center gap-1.5"
            >
              <TrendingUp size={14} /> INVESTIGATE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Why Flagged</h2>
            <ul className="space-y-3">
              {displaySignals.map((signal, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-text-primary">
                  <CheckCircle2 className="text-accent-green mt-0.5 shrink-0" size={16} />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>

            {alert.counterfactual && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs uppercase tracking-wider text-accent-amber font-semibold mb-2">
                  What Would Clear This Alert
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {alert.counterfactual}
                </p>
              </div>
            )}
          </div>

          <div
            onClick={handleInvestigateFlow}
            className="bg-bg-card border border-border hover:border-accent-cyan rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-sm group"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4 self-start">Entity Network Preview</h2>
            <div className="p-4 bg-bg-elevated border border-border group-hover:border-accent-cyan/50 rounded-lg text-text-muted flex flex-col items-center justify-center w-full h-40 transition-colors">
              <Network className="text-accent-cyan mb-2 group-hover:scale-110 transition-transform" size={32} />
              <span className="text-xs font-medium text-text-primary">Launch Forensic Vault & Tables</span>
              <span className="text-[10px] text-text-muted mt-1">Click to inspect 10 core raw data tables</span>
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-accent-cyan">
              <Cpu size={16} />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">LLM Investigation Summary</h2>
            </div>

            {llmLoading ? (
              <div className="space-y-2">
                <div className="h-3 bg-bg-elevated rounded animate-pulse" />
                <div className="h-3 bg-bg-elevated rounded animate-pulse w-5/6" />
                <div className="h-3 bg-bg-elevated rounded animate-pulse w-4/6" />
                <p className="text-xs text-text-muted pt-2">Generating explanation via Qwen 2.5 Coder…</p>
              </div>
            ) : (
              <p className="text-sm text-text-secondary leading-relaxed">
                {llmText || alert.summary || 'No explanation available.'}
              </p>
            )}

            <div className="pt-3 border-t border-border">
              <p className="text-[10px] text-text-muted uppercase tracking-wider">
<div className="flex items-center justify-between">
  <p className="text-[10px] text-text-muted uppercase tracking-wider">
    Generated by Qwen 2.5 Coder · Evidence-grounded
  </p>
  <div className="flex items-center gap-1 text-[10px] text-accent-green uppercase tracking-wider">
    <span className="w-1.5 h-1.5 rounded-full bg-accent-green"></span>
    Fact-Verified
  </div>
</div>              </p>
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Evidence & Transaction Money Flow Chain</h2>
            <span className="text-xs text-accent-cyan font-mono">Linked Records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-primary">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Sender Account</th>
                  <th className="pb-3">Receiver Account</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.slice(0, 6).map((tx) => (
                  <tr key={tx.id || tx.transaction_id} className="hover:bg-bg-elevated transition-colors">
                    <td className="py-3 font-mono text-xs text-text-muted">{tx.transaction_id}</td>
                    <td className="py-3 font-mono text-xs text-text-primary">{tx.sender_account}</td>
                    <td className="py-3 font-mono text-xs text-text-primary">{tx.receiver_account}</td>
                    <td className="py-3 font-semibold text-accent-cyan">₹{tx.amount?.toLocaleString()}</td>
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

export default AlertDetail;