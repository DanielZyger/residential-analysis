import type { ReactNode } from 'react';

interface FilterSectionProps {
  children: ReactNode;
}

export function FilterSection({ children }: FilterSectionProps) {
  return <section className="filters-panel__section">{children}</section>;
}
