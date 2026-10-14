import type { Source } from '@er/shared';
import { formatDateTime, formatNumber } from '../../utils/format';
import { SourceStatus } from './SourceStatus';

interface SourcesTableProps {
  items: Source[];
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function SourcesTable({ items }: SourcesTableProps) {
  const sorted = [...items].sort((a, b) => Number(b.active) - Number(a.active) || b.lastRunCount - a.lastRunCount || a.name.localeCompare(b.name, 'pt-BR'));
  return (
    <div className="er-surface p-0 overflow-hidden">
      <div className="table-responsive">
        <table className="table align-middle mb-0 sources-table">
          <caption className="visually-hidden">Imobiliárias monitoradas e situação da última coleta</caption>
          <thead>
            <tr>
              <th scope="col">Imobiliária</th>
              <th scope="col" className="d-none d-md-table-cell">
                Plataforma
              </th>
              <th scope="col">Status</th>
              <th scope="col" className="d-none d-sm-table-cell">
                Última coleta
              </th>
              <th scope="col" className="text-end">
                Imóveis
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((source) => (
              <tr key={source.id}>
                <th scope="row">
                  <div className="fw-semibold">{source.name}</div>
                  <a href={source.website} target="_blank" rel="noopener noreferrer nofollow" className="small">
                    {hostname(source.website)}
                    <span className="visually-hidden"> (abre em nova aba)</span>
                  </a>
                  {source.lastRunError && (
                    <div className="sources-table__error" title={source.lastRunError}>
                      <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
                      {source.lastRunError}
                    </div>
                  )}
                </th>
                <td className="d-none d-md-table-cell">
                  <code className="sources-table__platform">{source.platform}</code>
                </td>
                <td>
                  <SourceStatus source={source} />
                </td>
                <td className="d-none d-sm-table-cell er-tabular small">{formatDateTime(source.lastRunAt)}</td>
                <td className="text-end er-tabular fw-semibold">{formatNumber(source.lastRunCount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
