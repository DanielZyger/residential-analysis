import { useState, type KeyboardEvent } from 'react';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { cx } from '../../utils/cx';

interface PhotoGalleryProps {
  photos: string[];
  title: string;
}

export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [index, setIndex] = useState(0);
  const count = photos.length;

  if (count === 0) {
    return (
      <div className="photo-gallery photo-gallery--empty er-media">
        <ImageWithFallback src={undefined} alt={title} />
      </div>
    );
  }

  const go = (next: number) => setIndex((next + count) % count);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') go(index - 1);
    if (event.key === 'ArrowRight') go(index + 1);
  };

  return (
    <div className="photo-gallery">
      <div
        className="carousel slide photo-gallery__carousel"
        role="region"
        aria-roledescription="carrossel"
        aria-label={`Fotos de ${title}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div className="carousel-inner">
          {photos.map((photo, photoIndex) => (
            <div
              key={photo}
              className={cx('carousel-item', photoIndex === index && 'active')}
              role="group"
              aria-roledescription="foto"
              aria-label={`${photoIndex + 1} de ${count}`}
              aria-hidden={photoIndex !== index}
            >
              <div className="photo-gallery__frame">
                <ImageWithFallback src={photo} alt={`${title} — foto ${photoIndex + 1}`} eager={photoIndex === 0} />
              </div>
            </div>
          ))}
        </div>
        {count > 1 && (
          <>
            <button className="carousel-control-prev" type="button" onClick={() => go(index - 1)} aria-label="Foto anterior">
              <span className="carousel-control-prev-icon" aria-hidden="true" />
            </button>
            <button className="carousel-control-next" type="button" onClick={() => go(index + 1)} aria-label="Próxima foto">
              <span className="carousel-control-next-icon" aria-hidden="true" />
            </button>
            <span className="photo-gallery__counter er-tabular" aria-live="polite">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="photo-gallery__thumbs" role="tablist" aria-label="Miniaturas">
          {photos.map((photo, photoIndex) => (
            <button
              key={photo}
              type="button"
              role="tab"
              aria-selected={photoIndex === index}
              aria-label={`Ver foto ${photoIndex + 1}`}
              className={cx('photo-gallery__thumb', photoIndex === index && 'photo-gallery__thumb--active')}
              onClick={() => setIndex(photoIndex)}
            >
              <ImageWithFallback src={photo} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
