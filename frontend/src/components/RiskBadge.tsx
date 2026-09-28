import React from 'react';
import { Severity } from '../types';

interface RiskBadgeProps {
  level: Severity | string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const upperLevel = level.toUpperCase();

  let styles = 'bg-accent-green/10 text-accent-green border-accent-green/30';
  let pulse = '';

  if (upperLevel === 'MEDIUM') {
    styles = 'bg-accent-amber/10 text-accent-amber border-accent-amber/30';
  } else if (upperLevel === 'HIGH') {
    styles = 'bg-accent-red/20 text-accent-red border-accent-red/40';
  } else if (upperLevel === 'CRITICAL') {
    styles = 'bg-accent-red/30 text-accent-red border-accent-red animate-pulse shadow-[0_0_12px_rgba(255,77,109,0.4)]';
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles} uppercase tracking-wider`}>
      {level}
    </span>
  );
};