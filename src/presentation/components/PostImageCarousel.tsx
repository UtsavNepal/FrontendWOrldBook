import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";

interface PostImageCarouselProps {
  images: string[];
  onImageClick?: () => void;
  className?: string;
}

const PostImageCarousel: React.FC<PostImageCarouselProps> = ({ images, onImageClick, className = "" }) => {
  const [index, setIndex] = useState(0);
  if (!images.length) return null;

  const atStart = index <= 0;
  const atEnd = index >= images.length - 1;

  return (
    <div className={`relative bg-black ${className}`}>
      <img
        src={getImageUrl(images[index])}
        alt={`Photo ${index + 1}`}
        className="max-h-[520px] w-full cursor-pointer object-contain"
        onClick={onImageClick}
      />
      {images.length > 1 && (
        <>
          <button
            type="button"
            disabled={atStart}
            onClick={(e) => {
              e.stopPropagation();
              if (!atStart) setIndex((current) => current - 1);
            }}
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-wb-ink shadow-card disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            disabled={atEnd}
            onClick={(e) => {
              e.stopPropagation();
              if (!atEnd) setIndex((current) => current + 1);
            }}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-wb-ink shadow-card disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
          <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
            {index + 1}/{images.length}
          </span>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, dot) => (
              <span
                key={dot}
                className={`h-1.5 w-1.5 rounded-full ${dot === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PostImageCarousel;
