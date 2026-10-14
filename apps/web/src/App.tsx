import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoadingState } from './components/LoadingState';
import { AppLayout } from './features/layout/AppLayout';

const RankingPage = lazy(() => import('./features/ranking/RankingPage'));
const PropertyPage = lazy(() => import('./features/property/PropertyPage'));
const NeighborhoodsPage = lazy(() => import('./features/neighborhoods/NeighborhoodsPage'));
const SourcesPage = lazy(() => import('./features/sources/SourcesPage'));
const NotFoundPage = lazy(() => import('./features/layout/NotFoundPage'));

export function App() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingState />}>
        <Routes>
          <Route path="/" element={<RankingPage />} />
          <Route path="/imovel/:id" element={<PropertyPage />} />
          <Route path="/bairros" element={<NeighborhoodsPage />} />
          <Route path="/fontes" element={<SourcesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
