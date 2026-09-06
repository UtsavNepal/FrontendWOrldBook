const TARGET_BYTES = 2 * 1024 * 1024;
const START_MAX_EDGE = 1920;

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

function drawToCanvas(source: CanvasImageSource, sourceWidth: number, sourceHeight: number, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("We couldn’t compress that photo.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

async function loadSource(file: File) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.src = objectUrl;
  await image.decode();
  return {
    source: image,
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
    close: () => URL.revokeObjectURL(objectUrl),
  };
}

async function compressToTarget(file: File, targetBytes: number): Promise<File> {
  const loaded = await loadSource(file);
  try {
    let maxEdge = START_MAX_EDGE;
    let quality = 0.82;
    let blob = await canvasToBlob(drawToCanvas(loaded.source, loaded.width, loaded.height, maxEdge), quality);

    while (blob.size > targetBytes && (quality > 0.45 || maxEdge > 720)) {
      if (quality > 0.45) {
        quality = Math.max(0.45, quality - 0.12);
      } else {
        maxEdge = Math.round(maxEdge * 0.8);
      }
      blob = await canvasToBlob(drawToCanvas(loaded.source, loaded.width, loaded.height, maxEdge), quality);
    }

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    loaded.close();
  }
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
