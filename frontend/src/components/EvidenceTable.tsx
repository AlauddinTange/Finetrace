import React from 'react';
import { ExternalLink, Inbox } from 'lucide-react';

export interface EvidenceRow {
  transaction_id?: string | null;
  employee_id?: string | null;
  customer_id?: string | null;
  amount?: string | number | null;
  timestamp?: string | null;
  type?: string | null;
  status?: string | null;
  [key: string]: string | number | null | undefined;
}

interface EvidenceTableProps { rows: EvidenceRow[]; }

const COLUMN_ORDER = ['transaction_id', 'employee_id', 'customer_id', 'amount', 'type', 'status', 'timestamp'];

const formatCell = (val: string | number | null | undefined): string => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'number') return val.toLocaleString();
  return String(val);
};

const EvidenceTable: React.FC<EvidenceTableProps> = ({ rows }) => {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-text-muted gap-2">
        <Inbox size={28} />
        <p className="text-sm">No evidence records found.</p>
      </div>
    );
  }

  const availableKeys = new Set<string>();
  rows.forEach((r) => Object.keys(r).forEach((k) => availableKeys.add(k)));
  const headers = COLUMN_ORDER.filter((k) => availableKeys.has(k));
  const extra = [...availableKeys].filter((k) => !COLUMN_ORDER.includes(k));
  const allHeaders = [...headers, ...extra];

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-bg-elevated">
            {allHeaders.map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">
                {h.replace(/_/g, ' ')}
              </th>
            ))}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/40 hover:bg-bg-elevated/60">
              {allHeaders.map((h) => (
                <td key={h} className="px-4 py-3 text-text-primary font-mono text-xs whitespace-nowrap">
                  {formatCell(row[h])}
                </td>
              ))}
              <td className="px-4 py-3">
                <button className="text-text-muted hover:text-accent-cyan">
                  <ExternalLink size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EvidenceTable;