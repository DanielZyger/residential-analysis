import { StateBlock } from './StateBlock';

interface ErrorStateProps {
  error?: Error;
  title?: string;
  onRetry?: () => void;
}

export function ErrorState({ error, title = 'Não foi possível carregar os dados', onRetry }: ErrorStateProps) {
  return (
    <StateBlock
      icon="exclamation-triangle"
      title={title}
      variant="error"
      role="alert"
      action={
        onRetry && (
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={onRetry}>
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
            Tentar novamente
          </button>
        )
      }
    >
      {error?.message}
    </StateBlock>
  );
}
