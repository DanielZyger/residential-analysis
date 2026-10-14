import type { ReactNode } from 'react';
import { StateBlock } from './StateBlock';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon = 'search', action }: EmptyStateProps) {
  return (
    <StateBlock icon={icon} title={title} action={action}>
      {description}
    </StateBlock>
  );
}
