import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { cx } from '../utils/cx';
import { ImageWithFallback } from './ImageWithFallback';

interface PhotoCarouselProps {
  photos: string[];
  title: string;
  index?: number;
  onIndexChange?: (index: number) => void;
  onSelect?: () => void;
  variant?: 'card' | 'gallery';
  eager?: boolean;
  className?: string;
}

const SWIPE_THRESHOLD = 40;

function preload(src: string | undefined): void {
  if (src) new Image().src = src;
}

export function PhotoCarousel({ photos, title, index: controlled, onIndexChange, onSelect, variant = 'gallery', eager = false, className }: PhotoCarouselProps) {
  const [internal, setInternal] = useState(0);
  const [touched, setTouched] = useState(false);
  const swipeStart = useRef<number | null>(null);
  const swiped = useRef(false);
  const count = photos.length;
  const focusable = variant === 'gallery' && count > 1;
  const index = Math.min(controlled ?? internal, Math.max(count - 1, 0));
  const current = useRef(index);
  current.current = index;

  useEffect(() => {
    if (touched && count > 1) preload(photos[(index + 1) % count]);
  }, [touched, index, count, photos]);

  const go = (delta: number) => {
    const target = (current.current + delta + count) % count;
    current.current = target;
    setTouched(true);
    setInternal(target);
    onIndexChange?.(target);
  };
  const step = (delta: number) => (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    go(delta);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') go(-1);
    if (event.key === 'ArrowRight') go(1);
  };
  const onPointerDown = (event: PointerEvent) => {
    swiped.current = false;
    swipeStart.current = event.pointerType === 'mouse' ? null : event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return;
    const delta = event.clientX - swipeStart.current;
    swipeStart.current = null;
    swiped.current = Math.abs(delta) >= SWIPE_THRESHOLD;
    if (swiped.current) go(delta < 0 ? 1 : -1);
  };
  const onClick = () => {
    if (!swiped.current) onSelect?.();
    swiped.current = false;
  };

  if (count === 0) {
    return (
      <div className={cx('photo-carousel', `photo-carousel--${variant}`, className)}>
        <ImageWithFallback src={undefined} alt={title} />
      </div>
    );
  }

  return (
    <div
      className={cx('photo-carousel', `photo-carousel--${variant}`, className)}
      role="region"
      aria-roledescription="carrossel"
      aria-label={`Fotos de ${title}`}
      tabIndex={focusable ? 0 : undefined}
      onKeyDown={focusable ? onKeyDown : undefined}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onClick={onSelect ? onClick : undefined}
    >
      <ImageWithFallback key={photos[index]} src={photos[index]} alt={`${title} — foto ${index + 1} de ${count}`} eager={eager && index === 0} />
      {count > 1 && (
        <>
          <button type="button" className="photo-carousel__nav photo-carousel__nav--prev" onClick={step(-1)} aria-label="Foto anterior">
            <i className="bi bi-chevron-left" aria-hidden="true" />
          </button>
          <button type="button" className="photo-carousel__nav photo-carousel__nav--next" onClick={step(1)} aria-label="Próxima foto">
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
          <span className="photo-carousel__counter er-tabular" aria-live="polite">
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>
  );
}
