import { useCallback, useState } from 'react';
import { CITY_NAME, TRANSACTION_LABELS } from '@er/shared';
import { listProperties } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { TransactionToggle } from '../../components/TransactionToggle';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFiltersFromUrl } from '../../hooks/useFiltersFromUrl';
import { useMeta } from '../../hooks/useMeta';
import { countActiveRefinements, filtersToParams } from '../../utils/query';
import { ActiveFilterChips } from '../filters/ActiveFilterChips';
import { FiltersPanel } from '../filters/FiltersPanel';
import { PropertyList } from './PropertyList';
import { RankingToolbar } from './RankingToolbar';
import './ranking.scss';

export default function RankingPage() {
  const { filters, update, setPage, reset } = useFiltersFromUrl();
  const meta = useMeta();
  const [showFilters, setShowFilters] = useState(false);
  const queryKey = filtersToParams(filters).toString();
  const list = useApi((signal) => listProperties(filters, signal), [queryKey], { keepPreviousData: true });
  const hideFilters = useCallback(() => setShowFilters(false), []);

  const verb = filters.transaction === 'sale' ? 'comprar' : 'alugar';
  useDocumentTitle(`Ranking · ${TRANSACTION_LABELS[filters.transaction]}`);

  const data = list.data;
  const activeFilters = countActiveRefinements(filters);
  const page = data?.page ?? filters.page ?? 1;
  const pageSize = data?.pageSize ?? filters.pageSize ?? 0;
  const rangeStart = data && data.total > 0 ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = data ? Math.min(data.total, rangeStart + data.items.length - 1) : 0;

  const renderResults = () => {
    if (list.error) return <ErrorState error={list.error} onRetry={list.reload} />;
    if (data && data.items.length === 0) {
      return (
        <EmptyState
          title="Nenhum imóvel encontrado"
          description="Tente ampliar a faixa de preço, remover bairros ou reduzir o número mínimo de dormitórios."
          action={
            activeFilters > 0 && (
              <button type="button" className="btn btn-primary btn-sm" onClick={reset}>
                Limpar filtros
              </button>
            )
          }
        />
      );
    }
    return (
      <>
        <PropertyList items={data?.items} startPosition={rangeStart || 1} refreshing={list.loading && Boolean(data)} />
        {data && <Pagination className="mt-4" page={data.page} totalPages={data.totalPages} onChange={setPage} />}
      </>
    );
  };

  return (
    <div className="ranking-page">
      <PageHeader
        eyebrow={`${CITY_NAME} · imóveis residenciais`}
        title={`Melhores imóveis para ${verb}`}
        subtitle="Ranking por custo-benefício: preço do m² comparado à mediana do bairro e da cidade, localização, espaço, vagas e qualidade do anúncio."
        actions={<TransactionToggle value={filters.transaction} onChange={(transaction) => update({ transaction })} size="lg" />}
      />
      <div className="row g-4">
        <div className="col-lg-3">
          <FiltersPanel
            filters={filters}
            meta={meta}
            onChange={update}
            onReset={reset}
            show={showFilters}
            onHide={hideFilters}
            total={data?.total}
          />
        </div>
        <section className="col-lg-9" aria-label="Resultados">
          <RankingToolbar
            filters={filters}
            total={data?.total}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            activeFilters={activeFilters}
            onSortChange={update}
            onOpenFilters={() => setShowFilters(true)}
          />
          <ActiveFilterChips filters={filters} meta={meta} onChange={update} onReset={reset} />
          {renderResults()}
        </section>
      </div>
    </div>
  );
}
