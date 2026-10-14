import { useState } from 'react';
import { cx } from '../utils/cx';

interface ImageWithFallbackProps {
  src: string | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
}

export function ImageWithFallback({ src, alt, className, eager = false }: ImageWithFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) {
    return (
      <div className={cx('er-media__fallback', className)} role="img" aria-label={`${alt} (sem foto disponível)`}>
        <i className="bi bi-house" aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
    />
  );
}
