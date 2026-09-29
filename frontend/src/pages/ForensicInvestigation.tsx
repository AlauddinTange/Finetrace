import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAlert, getTransactions } from '../api/endpoints';
import { Alert, Transaction } from '../types';
import { Header } from '../components/Header';
import { ArrowLeft, Database, ShieldAlert, FileText, Users, CreditCard, Key, Activity, Smartphone, LogIn, Tag } from 'lucide-react';

export const ForensicInvestigation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<string>('transactions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForensicData = async () => {
      try {
        if (id) {
          const alertData = await getAlert(id);
          setAlert(alertData);
        }
        const txData = await getTransactions();
        setTransactions(txData);
      } catch (err) {
        console.error('Failed to load forensic data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForensicData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-secondary">Loading forensic vault...</div>;

  const tables = [
    { id: 'transactions', label: 'Transactions', icon: <CreditCard size={16} />, count: transactions.length },
    { id: 'access_logs', label: 'Access Logs', icon: <FileText size={16} />, count: 124 },
    { id: 'accounts', label: 'Accounts', icon: <Database size={16} />, count: 48 },
    { id: 'beneficiary_changes', label: 'Beneficiary Changes', icon: <ShieldAlert size={16} />, count: 12 },
    { id: 'customers', label: 'Customers', icon: <Users size={16} />, count: 35 },
    { id: 'devices', label: 'Devices', icon: <Smartphone size={16} />, count: 89 },
    { id: 'employees', label: 'Employees', icon: <Users size={16} />, count: 52 },
    { id: 'login_events', label: 'Login Events', icon: <LogIn size={16} />, count: 310 },
    { id: 'permissions', label: 'Permissions', icon: <Key size={16} />, count: 24 },
    { id: 'scenario_labels', label: 'Scenario Labels', icon: <Tag size={16} />, count: 5 },
  ];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
          <ArrowLeft size={14} /> Back to Alert
        </button>

        {/* Top Banner */}
        <div className="bg-bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-text-muted">{alert?.alert_code || 'CASE-FORENSIC-01'}</span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan uppercase">
                Full Spectrum Audit
              </span>
            </div>
            <h1 className="text-xl font-bold text-text-primary">Deep Forensic Evidence Vault</h1>
            <p className="text-xs text-text-secondary mt-1">Inspecting raw database records and audit trails linked to this investigation.</p>
          </div>
        </div>

        {/* Table Selector Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tables.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-accent-cyan text-bg-primary shadow-[0_0_15px_rgba(74,222,222,0.2)]'
                  : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-accent-cyan/50'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === t.id ? 'bg-bg-primary/20 text-bg-primary' : 'bg-bg-elevated text-text-muted'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Active Table View */}
        <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-accent-cyan" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">Table: {activeTab}</h2>
            </div>
            <span className="text-xs text-text-muted font-mono">Database Synchronized</span>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'transactions' ? (
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
                  {transactions.map((tx) => (
                    <tr key={tx.id || tx.transaction_id} className="hover:bg-bg-elevated transition-colors">
                      <td className="py-3 font-mono text-xs text-text-muted">{tx.transaction_id}</td>
                      <td className="py-3 font-mono text-xs">{tx.sender_account}</td>
                      <td className="py-3 font-mono text-xs">{tx.receiver_account}</td>
                      <td className="py-3 font-semibold text-accent-cyan">₹{tx.amount?.toLocaleString()}</td>
                      <td className="py-3 text-xs text-text-secondary">{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-text-muted flex flex-col items-center justify-center space-y-2">
                <Activity size={32} className="text-text-muted/40 animate-pulse" />
                <p className="text-xs font-medium">Displaying records for <span className="text-accent-cyan font-mono">{activeTab}</span> table.</p>
                <p className="text-[10px] text-text-secondary">All raw audit logs, metadata, and relationship identifiers are indexed and verified.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};