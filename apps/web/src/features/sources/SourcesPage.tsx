import { listSources } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { PageHeader } from '../../components/PageHeader';
import { SkeletonTable } from '../../components/SkeletonTable';
import { useApi } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateTime, formatNumber } from '../../utils/format';
import { SourcesTable } from './SourcesTable';
import './sources.scss';

const PRINCIPLES = [
  {
    icon: 'globe2',
    title: 'Coleta pública',
    text: 'Lemos apenas páginas públicas dos sites das imobiliárias, respeitando o robots.txt e um intervalo entre requisições.',
  },
  {
    icon: 'shield-check',
    title: 'Sem parceria',
    text: 'Não temos vínculo comercial com nenhuma imobiliária. Os anúncios pertencem a elas e cada imóvel aponta para o anúncio original.',
  },
  {
    icon: 'clock-history',
    title: 'Pode haver atraso',
    text: 'Preços, disponibilidade e características podem mudar entre uma coleta e outra ou divergir por erros de leitura.',
  },
  {
    icon: 'telephone',
    title: 'Confirme sempre',
    text: 'Antes de qualquer decisão, confirme todas as informações diretamente com a imobiliária responsável pelo anúncio.',
  },
];

export default function SourcesPage() {
  const state = useApi((signal) => listSources(signal), []);
  useDocumentTitle('Fontes dos dados');
  const data = state.data;

  const renderTable = () => {
    if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;
    if (!data) return <SkeletonTable columns={5} rows={6} />;
    if (data.items.length === 0) return <EmptyState icon="database" title="Nenhuma fonte cadastrada" />;
    return <SourcesTable items={data.items} />;
  };

  return (
    <div className="sources-page">
      <PageHeader
        eyebrow="Transparência"
        title="De onde vêm os dados"
        subtitle="Os imóveis exibidos são coletados automaticamente dos sites das imobiliárias de Erechim. Não há parceria com nenhuma delas neste momento."
      />
      <ul className="sources-principles">
        {PRINCIPLES.map((principle) => (
          <li key={principle.title} className="sources-principles__item">
            <i className={`bi bi-${principle.icon}`} aria-hidden="true" />
            <div>
              <h2 className="h6 mb-1">{principle.title}</h2>
              <p className="mb-0 small text-body-secondary">{principle.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="sources-page__heading">
        <h2 className="h5 mb-0">Imobiliárias monitoradas</h2>
        {data && (
          <p className="small text-body-secondary mb-0 er-tabular">
            {formatNumber(data.totalProperties)} imóveis · última coleta {formatDateTime(data.collectedAt)}
          </p>
        )}
      </div>
      {renderTable()}
      <p className="small text-body-secondary mt-3 mb-0">
        É responsável por uma das imobiliárias listadas e deseja corrigir dados, solicitar remoção ou firmar parceria? Entre em contato com o
        mantenedor do projeto.
      </p>
    </div>
  );
}
