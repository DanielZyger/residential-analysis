import { DataNotice } from '../../components/DataNotice';
import { useMeta } from '../../hooks/useMeta';
import { formatNumber } from '../../utils/format';

export function AppFooter() {
  const { data } = useMeta();
  return (
    <footer className="app-footer">
      <div className="container">
        <DataNotice variant="footer" collectedAt={data?.collectedAt ?? null} />
        <div className="app-footer__meta">
          <span>Chapecó Residencial · projeto independente, sem vínculo com as imobiliárias listadas.</span>
          {data && <span className="er-tabular">{formatNumber(data.totalProperties)} imóveis indexados</span>}
        </div>
      </div>
    </footer>
  );
}
