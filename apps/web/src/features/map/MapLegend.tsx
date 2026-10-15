import { formatPricePerM2 } from '../../utils/format';
import type { MapLayer } from './LeafletMap';
import type { ColorClass } from './mapColors';

interface MapLegendProps {
  layer: MapLayer;
  classes: ColorClass[];
}

const SCORE_ITEMS = [
  { tone: 'excellent', label: 'Excelente (80+)' },
  { tone: 'good', label: 'Bom (65–79)' },
  { tone: 'fair', label: 'Regular (50–64)' },
  { tone: 'low', label: 'Baixo (< 50)' },
] as const;

export function MapLegend({ layer, classes }: MapLegendProps) {
  const items =
    layer === 'properties'
      ? SCORE_ITEMS.map((item) => ({ key: item.tone, color: `var(--er-score-${item.tone})`, label: item.label }))
      : classes.map((c) => ({ key: String(c.max), color: c.color, label: `${formatPricePerM2(c.min)} – ${formatPricePerM2(c.max)}` }));
  return (
    <div className="map-legend" aria-label="Legenda do mapa">
      <div className="er-eyebrow mb-1">{layer === 'properties' ? 'Nota do imóvel' : 'Mediana do m² no bairro'}</div>
      <ul>
        {items.map((item) => (
          <li key={item.key}>
            <span className="map-legend__swatch" style={{ background: item.color }} aria-hidden="true" />
            {item.label}
          </li>
        ))}
      </ul>
      {layer === 'neighborhoods' && <div className="map-legend__note">Tamanho do círculo = quantidade de imóveis</div>}
    </div>
  );
}
