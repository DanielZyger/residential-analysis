import type { Source } from '@er/shared';

interface SourceStatusProps {
  source: Source;
}

export function SourceStatus({ source }: SourceStatusProps) {
  if (!source.active) {
    return (
      <>
        <span className="badge rounded-pill text-bg-secondary">Não coletada</span>
        {source.inactiveReason && <div className="small text-body-secondary mt-1">{source.inactiveReason}</div>}
      </>
    );
  }
  if (source.lastRunError) return <span className="badge rounded-pill text-bg-danger">Com erro</span>;
  if (!source.lastRunAt) return <span className="badge rounded-pill text-bg-light border">Aguardando coleta</span>;
  return <span className="badge rounded-pill text-bg-success">Ativa</span>;
}
