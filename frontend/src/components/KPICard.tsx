import React, { ReactNode } from 'react';

interface KPICardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({ icon, label, value, trend }) => {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between hover:border-border/80 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-bg-elevated rounded-lg text-accent-cyan border border-border">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent-green/10 text-accent-green">
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight mb-1">{value}</div>
        <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
};