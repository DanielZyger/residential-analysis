import { Link } from 'react-router-dom';
import { cx } from '../utils/cx';
import { formatDateTime } from '../utils/format';

interface DataNoticeProps {
  variant?: 'bar' | 'inline' | 'footer';
  collectedAt?: string | null;
  className?: string;
}

export function DataNotice({ variant = 'inline', collectedAt, className }: DataNoticeProps) {
  if (variant === 'bar') {
    return (
      <div className={cx('data-notice', 'data-notice--bar', className)} role="note">
        <div className="container">
          <i className="bi bi-info-circle me-1" aria-hidden="true" />
          Dados coletados automaticamente dos sites públicos das imobiliárias, sem parceria.{' '}
          <Link to="/fontes" className="fw-semibold">
            Saiba mais
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className={cx('data-notice', variant === 'inline' && 'data-notice--inline', className)} role="note">
      <p className="mb-1">
        <i className="bi bi-shield-exclamation me-1" aria-hidden="true" />
        <strong>Sem parceria com imobiliárias.</strong> As informações são coletadas automaticamente de anúncios públicos e podem
        estar desatualizadas ou divergir do anúncio original. Sempre confirme preço, disponibilidade e características diretamente com a
        imobiliária responsável.
      </p>
      {collectedAt !== undefined && (
        <p className="mb-0 text-body-secondary">
          Última coleta: <span className="er-tabular">{formatDateTime(collectedAt)}</span> ·{' '}
          <Link to="/fontes">Ver fontes</Link>
        </p>
      )}
    </div>
  );
}
