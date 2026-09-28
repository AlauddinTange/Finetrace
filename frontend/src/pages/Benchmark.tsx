import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { getAlerts } from '../api/endpoints';
import type { Alert } from '../types';

const Benchmark: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setAlerts(await getAlerts());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total     = alerts.length;
  const critical  = alerts.filter(a => a.severity === 'CRITICAL').length;
  const high      = alerts.filter(a => a.severity === 'HIGH').length;
  const medium    = alerts.filter(a => a.severity === 'MEDIUM').length;
  const low       = alerts.filter(a => a.severity === 'LOW').length;

  const STATS = [
    { label: 'Total Alerts',    value: total,    color: '#4ADEDE' },
    { label: 'Critical',        value: critical, color: '#FF4D6D' },
    { label: 'High',            value: high,     color: '#FF4D6D' },
    { label: 'Medium',          value: medium,   color: '#F5A623' },
    { label: 'Low',             value: low,      color: '#00E5A0' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="px-6 py-6 max-w-screen-2xl mx-auto">
        <h1 className="text-2xl font-extrabold text-text-primary mb-1">Benchmark</h1>
        <p className="text-text-secondary text-sm mb-6">
          Detection distribution across your current dataset
        </p>

        {loading ? (
          <div className="text-text-muted">Loading…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {STATS.map(s => (
                <div key={s.label} className="bg-bg-card border border-border rounded-xl p-5">
                  <div className="text-3xl font-extrabold" style={{ color: s.color }}>
                    {s.value}
                  </div>
                  <div className="text-sm text-text-secondary mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-bg-card border border-border rounded-xl p-6">
              <h3 className="text-text-primary font-semibold mb-4">Severity Distribution</h3>
              <div className="space-y-3">
                {STATS.slice(1).map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-text-secondary">{s.label}</span>
                      <span className="text-text-primary font-semibold">
                        {total ? ((s.value / total) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${total ? (s.value / total) * 100 : 0}%`,
                          background: s.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Benchmark;