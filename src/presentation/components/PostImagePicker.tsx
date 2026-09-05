import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";
import ProcessProgressBox from "./ProcessProgressBox";
import { runTimedProgress } from "../../utils/runTimedProgress";

export type PickedImage = {
  id: string;
  url: string;
  file?: File;
  path?: string;
};

interface PostImagePickerProps {
  existing?: string[];
  onChange: (payload: { keep: string[]; files: File[] }) => void;
}

const PostImagePicker: React.FC<PostImagePickerProps> = ({ existing = [], onChange }) => {
  const [items, setItems] = useState<PickedImage[]>(() =>
    existing.map((path) => ({ id: path, url: getImageUrl(path), path }))
  );
  const [index, setIndex] = useState(0);
  const [process, setProcess] = useState<{ label: string; percent: number } | null>(null);

  useEffect(() => {
    onChange({
      keep: items.filter((item) => item.path).map((item) => item.path!) ,
      files: items.filter((item) => item.file).map((item) => item.file!),
    });
  }, [items]);

  const current = items[index];
  const atStart = index <= 0;
  const atEnd = index >= items.length - 1;

  const addFiles = async (files: FileList | null) => {
    if (!files?.length || process) return;
    const next = Array.from(files).slice(0, Math.max(0, 10 - items.length)).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      url: URL.createObjectURL(file),
      file,
    }));
    if (!next.length) return;
    setProcess({ label: next.length > 1 ? "Uploading photos" : "Uploading photo", percent: 1 });
    await runTimedProgress(10000, (percent) => {
      setProcess((current) => current ? { ...current, percent } : current);
    });
    setItems((prev) => [...prev, ...next]);
    setIndex(items.length ? items.length : 0);
    setProcess(null);
  };

  const removeAt = async (removeIndex: number) => {
    if (process) return;
    setProcess({ label: "Deleting photo", percent: 1 });
    await runTimedProgress(10000, (percent) => {
      setProcess((current) => current ? { ...current, percent } : current);
    });
    const removed = items[removeIndex];
    if (removed?.file) URL.revokeObjectURL(removed.url);
    const next = items.filter((_, i) => i !== removeIndex);
    setItems(next);
    setIndex((currentIndex) => {
      if (!next.length) return 0;
      if (currentIndex > removeIndex) return currentIndex - 1;
      return Math.min(currentIndex, next.length - 1);
    });
    setProcess(null);
  };

  const dots = useMemo(() => items.map((item) => item.id), [items]);

  return (
    <div className="mb-4">
      {process && <ProcessProgressBox label={process.label} percent={process.percent} />}
      {current && (
        <div className="relative mb-3 overflow-hidden rounded-xl bg-black">
          <img src={current.url} alt="" className="max-h-80 w-full object-contain" />
          <button
            type="button"
            onClick={() => removeAt(index)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
            aria-label="Delete image"
          >
            <X size={16} />
          </button>
          {items.length > 1 && (
            <>
              <button
                type="button"
                disabled={atStart}
                onClick={() => !atStart && setIndex((value) => value - 1)}
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 disabled:opacity-30"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                disabled={atEnd}
                onClick={() => !atEnd && setIndex((value) => value + 1)}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 disabled:opacity-30"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
              <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
                {index + 1}/{items.length}
              </span>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {dots.map((id, dot) => (
                  <span key={id} className={`h-1.5 w-1.5 rounded-full ${dot === index ? "bg-white" : "bg-white/50"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {items.length > 1 && (
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {items.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(itemIndex)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${itemIndex === index ? "border-wb-blue" : "border-transparent"}`}
            >
              <img src={item.url} alt="" className="h-full w-full object-cover" />
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(itemIndex);
                }}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
              >
                <X size={10} />
              </span>
            </button>
          ))}
        </div>
      )}
      {items.length < 10 && (
        <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-wb-line bg-wb-canvas px-4 py-3 text-sm font-semibold text-wb-muted hover:bg-white ${process ? "pointer-events-none opacity-60" : ""}`}>
          <ImagePlus size={18} />
          {items.length ? "Add more photos" : "Add photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={Boolean(process)}
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
};

export default PostImagePicker;
