import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { DataNotice } from '../../components/DataNotice';
import { AppFooter } from './AppFooter';
import { AppNavbar } from './AppNavbar';
import './layout.scss';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="app-shell">
      <a href="#conteudo" className="visually-hidden-focusable app-shell__skip">
        Pular para o conteúdo
      </a>
      <AppNavbar />
      <DataNotice variant="bar" />
      <main id="conteudo" className="app-shell__main container" tabIndex={-1}>
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
