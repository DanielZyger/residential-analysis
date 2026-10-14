import type { ReactNode } from 'react';
import { cx } from '../utils/cx';

interface StateBlockProps {
  icon: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  variant?: 'empty' | 'error';
  role?: 'status' | 'alert';
}

export function StateBlock({ icon, title, children, action, variant = 'empty', role = 'status' }: StateBlockProps) {
  return (
    <div className={cx('state-block', `state-block--${variant}`)} role={role}>
      <div className="state-block__icon">
        <i className={`bi bi-${icon}`} aria-hidden="true" />
      </div>
      <h2 className="h5 mb-1">{title}</h2>
      {children && <div className="text-body-secondary">{children}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
