interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Carregando…' }: LoadingStateProps) {
  return (
    <div className="d-flex align-items-center justify-content-center gap-2 py-5 text-body-secondary" role="status" aria-live="polite">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
