import { monthlyCosts, type Property } from '@er/shared';
import { cx } from '../utils/cx';
import { formatCurrency } from '../utils/format';
import { PriceTag } from './PriceTag';

interface PriceBreakdownProps {
  property: Pick<Property, 'transaction' | 'price' | 'condoFee' | 'iptu'>;
  size?: 'md' | 'lg';
  className?: string;
}

function iptuLabel(monthly: number | null, annual: number | null): string | null {
  if (monthly == null) return null;
  return annual != null ? `IPTU ${formatCurrency(monthly)} (${formatCurrency(annual)}/ano)` : `IPTU ${formatCurrency(monthly)}`;
}

export function PriceBreakdown({ property, size = 'md', className }: PriceBreakdownProps) {
  const costs = monthlyCosts(property);
  const parts = costs
    ? [`Aluguel ${formatCurrency(costs.rent)}`, costs.condo != null && `Condomínio ${formatCurrency(costs.condo)}`, iptuLabel(costs.iptu, costs.iptuAnnual)]
    : [property.condoFee != null && `Condomínio ${formatCurrency(property.condoFee)}/mês`, property.iptu != null && `IPTU ${formatCurrency(property.iptu)}/ano`];
  const visibleParts = parts.filter(Boolean);
  return (
    <div className={cx('price-breakdown', `price-breakdown--${size}`, className)}>
      {costs && <span className="price-breakdown__label">Total mensal</span>}
      <PriceTag value={costs?.total ?? property.price} transaction={property.transaction} size={size} />
      {visibleParts.length > 0 && <span className="price-breakdown__parts er-tabular">{visibleParts.join(' · ')}</span>}
    </div>
  );
}
