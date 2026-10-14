import type { ReactNode } from 'react';

interface StatPillProps {
  icon: string;
  label: string;
  value: ReactNode;
}

export function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <span className="stat-pill" title={label}>
      <i className={`bi bi-${icon}`} aria-hidden="true" />
      <span>{value}</span>
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
