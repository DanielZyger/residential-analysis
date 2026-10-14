import { useSearchParams } from 'react-router-dom';
import { TRANSACTION_LABELS, type TransactionType } from '@er/shared';
import { listNeighborhoods } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { PageHeader } from '../../components/PageHeader';
import { SkeletonTable } from '../../components/SkeletonTable';
import { TransactionToggle } from '../../components/TransactionToggle';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatNumber, formatPricePerM2 } from '../../utils/format';
import { parseTransaction } from '../../utils/query';
import { NeighborhoodsTable } from './NeighborhoodsTable';
import './neighborhoods.scss';

export default function NeighborhoodsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const transaction = parseTransaction(searchParams.get('transaction'));
  const state = useApi((signal) => listNeighborhoods(transaction, signal), [transaction], { keepPreviousData: true });
  useDocumentTitle(`Bairros · ${TRANSACTION_LABELS[transaction]}`);

  const setTransaction = (value: TransactionType) => setSearchParams(value === 'sale' ? {} : { transaction: value }, { replace: true });
  const data = state.data;

  const renderContent = () => {
    if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;
    if (!data) return <SkeletonTable columns={5} />;
    if (data.items.length === 0) {
      return <EmptyState icon="geo-alt" title="Nenhum bairro com dados" description="Ainda não há imóveis suficientes coletados para este tipo de negócio." />;
    }
    return (
      <div className={state.loading ? 'er-is-refreshing' : undefined}>
        <NeighborhoodsTable items={data.items} transaction={data.transaction} cityMedian={data.city.medianPricePerM2} />
      </div>
    );
  };

  return (
    <div className="neighborhoods-page">
      <PageHeader
        eyebrow="Mercado"
        title="Preço do m² por bairro"
        subtitle="Estatísticas calculadas a partir dos anúncios coletados. Clique em um bairro para ver os imóveis ranqueados."
        actions={<TransactionToggle value={transaction} onChange={setTransaction} />}
      />
      {data && (
        <div className="neighborhoods-summary">
          <div className="neighborhoods-summary__item">
            <span className="er-eyebrow">Mediana da cidade</span>
            <strong className="er-tabular">{formatPricePerM2(data.city.medianPricePerM2)}</strong>
          </div>
          <div className="neighborhoods-summary__item">
            <span className="er-eyebrow">Imóveis considerados</span>
            <strong className="er-tabular">{formatNumber(data.city.count)}</strong>
          </div>
          <div className="neighborhoods-summary__item">
            <span className="er-eyebrow">Bairros</span>
            <strong className="er-tabular">{formatNumber(data.items.length)}</strong>
          </div>
          <div className="neighborhoods-summary__legend" aria-hidden="true">
            <span>
              <span className="neighborhoods-summary__swatch" /> abaixo da cidade
            </span>
            <span>
              <span className="neighborhoods-summary__swatch neighborhoods-summary__swatch--above" /> acima da cidade
            </span>
            <span>
              <span className="neighborhoods-summary__marker" /> mediana da cidade
            </span>
          </div>
        </div>
      )}
      {renderContent()}
    </div>
  );
}
