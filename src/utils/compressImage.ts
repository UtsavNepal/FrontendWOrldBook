const TARGET_BYTES = 2 * 1024 * 1024;
const START_MAX_EDGE = 1920;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("We couldn’t read that photo."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("We couldn’t compress that photo."));
        else resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

function drawToCanvas(image: HTMLImageElement, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("We couldn’t compress that photo.");
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

async function compressToTarget(file: File, targetBytes: number): Promise<File> {
  const image = await loadImage(file);
  let maxEdge = START_MAX_EDGE;
  let quality = 0.82;
  let blob = await canvasToBlob(drawToCanvas(image, maxEdge), quality);

  while (blob.size > targetBytes && (quality > 0.45 || maxEdge > 720)) {
    if (quality > 0.45) {
      quality = Math.max(0.45, quality - 0.12);
    } else {
      maxEdge = Math.round(maxEdge * 0.8);
    }
    blob = await canvasToBlob(drawToCanvas(image, maxEdge), quality);
  }

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
}

export async function prepareImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= TARGET_BYTES) {
    return file;
  }
  try {
    return await compressToTarget(file, TARGET_BYTES);
  } catch {
    return file;
  }
}

export async function prepareImagesForUpload(files: File[]): Promise<File[]> {
  return Promise.all(files.map(prepareImageForUpload));
}
