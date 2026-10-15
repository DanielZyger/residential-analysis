import { useState } from 'react';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { PhotoCarousel } from '../../components/PhotoCarousel';
import { cx } from '../../utils/cx';

interface PhotoGalleryProps {
  photos: string[];
  title: string;
}

export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [index, setIndex] = useState(0);
  return (
    <div className="photo-gallery">
      <PhotoCarousel photos={photos} title={title} index={index} onIndexChange={setIndex} eager />
      {photos.length > 1 && (
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
