import { useEffect } from 'react';

const APP_NAME = 'Chapecó Residencial';

export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
