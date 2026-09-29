import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAlert, updateCaseStatus } from '../api/endpoints';
import { Alert } from '../types';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { ArrowLeft, UserCheck, FileText, Send } from 'lucide-react';

export const CaseEscalation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alertData, setAlertData] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvestigator, setSelectedInvestigator] = useState('Dr. Vikram Malhotra (Lead Forensic)');
  const [seniorReviewNotes, setSeniorReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const seniorInvestigators = [
    'Dr. Vikram Malhotra (Lead Forensic)',
    'Ananya Sharma (Senior Risk Officer)',
    'Rajesh Kumar (Compliance Director)',
    'Priya Deshmukh (AML Special Unit Head)'
  ];

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        if (!id) return;
        const fetchedAlert = await getAlert(id);
        setAlertData(fetchedAlert);
        setSeniorReviewNotes(
          `Automated Escalation Review for ${fetchedAlert.alert_code}: Entity exhibits multi-vector risk signals requiring senior compliance sign-off under RBI guidelines.`
        );
      } catch (err) {
        console.error('Failed to fetch alert for escalation', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlert();
  }, [id]);

  const handleFinalizeEscalation = async () => {
    try {
      if (!alertData) return;
      setSubmitting(true);

      // 1. Send PATCH request to update case status, assign senior investigator, and attach review notes
      await updateCaseStatus(alertData.id, {
        status: 'ESCALATED',
        priority: 'CRITICAL',
        assigned_to: selectedInvestigator,
        senior_review: seniorReviewNotes,
        escalated_at: new Date().toISOString()
      });

      // 2. Trigger success confirmation popup and redirect to cases management board
      window.alert(`Case successfully escalated and assigned to ${selectedInvestigator}!`);
      navigate('/cases');
    } catch (err) {
      console.error('Failed to submit escalation:', err);
      window.alert('Failed to submit escalation. Please check backend logs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-secondary">Loading escalation portal...</div>;
  if (!alertData) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-accent-red">Alert not found</div>;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
          <ArrowLeft size={14} /> Back to Alert Details
        </button>

        {/* Top Header Card */}
        <div className="bg-bg-card border border-border rounded-xl p-6 shadow-md flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-text-muted">{alertData.alert_code}</span>
              <RiskBadge level={alertData.severity} />
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-accent-amber/10 border border-accent-amber/30 text-accent-amber uppercase">
                Senior Escalation Review
              </span>
            </div>
            <h1 className="text-xl font-bold text-text-primary">{alertData.title}</h1>
          </div>
        </div>

        {/* Escalation Form Card */}
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <UserCheck className="text-accent-cyan" size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">Assign Senior Investigator</h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Select Senior Reviewer / Committee Lead</label>
            <select
              value={selectedInvestigator}
              onChange={(e) => setSelectedInvestigator(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-cyan transition-colors"
            >
              {seniorInvestigators.map((inv, idx) => (
                <option key={idx} value={inv} className="bg-bg-card text-text-primary">
                  {inv}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <FileText className="text-accent-cyan" size={18} />
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Senior Investigator Review & Compliance Notes</label>
            </div>
            <textarea
              rows={5}
              value={seniorReviewNotes}
              onChange={(e) => setSeniorReviewNotes(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-cyan transition-colors leading-relaxed"
              placeholder="Enter formal compliance findings, risk assessment, and recommended regulatory action..."
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-bg-elevated border border-border hover:border-text-secondary text-text-secondary text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalizeEscalation}
              disabled={submitting}
              className="px-6 py-2.5 bg-accent-amber text-bg-primary font-bold text-xs rounded-lg transition-all hover:opacity-90 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-2 cursor-pointer"
            >
              <Send size={14} /> {submitting ? 'Assigning & Saving...' : 'Finalize & Assign Case'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseEscalation;