import type { Property } from '@er/shared';

interface AlsoListedAtProps {
  listings: Property['alsoListedAt'];
}

export function AlsoListedAt({ listings }: AlsoListedAtProps) {
  if (listings.length === 0) return null;
  return (
    <section className="er-surface" aria-labelledby="also-listed-title">
      <h2 className="h6 mb-2" id="also-listed-title">
        <i className="bi bi-copy me-2" aria-hidden="true" />
        Também anunciado em
      </h2>
      <ul className="list-unstyled mb-0 d-grid gap-1">
        {listings.map((listing) => (
          <li key={listing.url}>
            <a href={listing.url} target="_blank" rel="noopener noreferrer nofollow">
              {listing.sourceName}
              <i className="bi bi-box-arrow-up-right ms-1 small" aria-hidden="true" />
              <span className="visually-hidden"> (abre em nova aba)</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="small text-body-secondary mt-2 mb-0">Preços e condições podem variar entre imobiliárias.</p>
    </section>
  );
}
