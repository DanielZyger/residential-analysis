export function PropertyPageSkeleton() {
  return (
    <div className="row g-4 placeholder-glow" aria-busy="true" aria-label="Carregando imóvel">
      <div className="col-lg-7">
        <span className="placeholder placeholder-lg col-8 rounded mb-3" />
        <div className="photo-gallery__frame">
          <span className="placeholder w-100 h-100 rounded" />
        </div>
      </div>
      <div className="col-lg-5 d-grid gap-3 align-content-start">
        <div className="er-surface d-grid gap-2">
          <span className="placeholder col-4 rounded" />
          <span className="placeholder placeholder-lg col-7 rounded" />
          <span className="placeholder col-6 rounded" />
          <span className="placeholder col-12 rounded" style={{ height: '2.5rem' }} />
        </div>
        <div className="er-surface d-grid gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className="placeholder col-12 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
