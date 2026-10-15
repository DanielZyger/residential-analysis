import { monthlyIptu, PROPERTY_TYPE_LABELS, TRANSACTION_LABELS, type RankedProperty } from '@er/shared';
import { EMPTY_VALUE, formatArea, formatCurrency, formatNumber } from '../../utils/format';

interface PropertyFactsProps {
  property: RankedProperty;
}

export function PropertyFacts({ property }: PropertyFactsProps) {
  const facts: { label: string; value: string }[] = [
    { label: 'Negócio', value: TRANSACTION_LABELS[property.transaction] },
    { label: 'Tipo', value: PROPERTY_TYPE_LABELS[property.type] },
    { label: 'Bairro', value: property.neighborhood ?? EMPTY_VALUE },
    { label: 'Endereço', value: property.address ?? EMPTY_VALUE },
    { label: 'Área privativa', value: formatArea(property.privateArea) },
    { label: 'Área total', value: formatArea(property.totalArea) },
    { label: 'Dormitórios', value: formatNumber(property.bedrooms) },
    { label: 'Suítes', value: formatNumber(property.suites) },
    { label: 'Banheiros', value: formatNumber(property.bathrooms) },
    { label: 'Vagas', value: formatNumber(property.parkingSpots) },
    { label: 'Condomínio', value: property.condoFee != null ? `${formatCurrency(property.condoFee)}/mês` : EMPTY_VALUE },
    { label: 'IPTU', value: property.iptu == null ? formatCurrency(null) : `${formatCurrency(property.iptu)}/ano (${formatCurrency(monthlyIptu(property.iptu))}/mês)` },
    { label: 'Código na imobiliária', value: property.externalId },
  ];
  return (
    <section className="er-surface" aria-labelledby="facts-title">
      <h2 className="h5 mb-3" id="facts-title">
        Características
      </h2>
      <dl className="property-facts">
        {facts.map((fact) => (
          <div className="property-facts__item" key={fact.label}>
            <dt>{fact.label}</dt>
            <dd className="er-tabular">{fact.value}</dd>
          </div>
        ))}
      </dl>
      {property.features.length > 0 && (
        <>
          <h3 className="h6 mt-4 mb-2">Diferenciais</h3>
          <ul className="property-features">
            {property.features.map((feature) => (
              <li key={feature}>
                <i className="bi bi-check2 me-1" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
