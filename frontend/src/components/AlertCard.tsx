import React from 'react';
import { Alert } from '../types';
import { RiskBadge } from './RiskBadge';
import { ArrowRight, Clock } from 'lucide-react';

interface AlertCardProps {
  alert: Alert;
  onClick: (id: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick }) => {
  return (
    <div
      onClick={() => onClick(alert.id)}
      className="bg-bg-card border border-border rounded-xl p-5 hover:border-accent-cyan/40 transition-all cursor-pointer shadow-lg flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-text-muted">{alert.alert_code || `ALT-${alert.id.slice(0, 6)}`}</span>
          <RiskBadge level={alert.severity || alert.risk_level || 'MEDIUM'} />
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-2 group-hover:text-accent-cyan transition-colors">
          {alert.title}
        </h3>
        <p className="text-sm text-text-secondary line-clamp-2 mb-4">
          {alert.summary}
        </p>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Clock size={13} />
          <span>{new Date(alert.created_at).toLocaleDateString()}</span>
        </div>
        <span className="text-accent-cyan font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Investigate <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
};