// Resize photos in the browser before upload: longest side 1600px, WebP ~0.8.
// Any failure returns the original file untouched, so conversion can never
// block a save. GIFs are skipped to preserve animation.

const MAX_SIDE = 1600;

export type PreparedImage = {
  file: File;
  converted: boolean;
  savedBytes: number;
};

function asIs(file: File): PreparedImage {
  return { file, converted: false, savedBytes: 0 };
}

export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  try {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return asIs(file);
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
      if (scale === 1 && file.type === "image/webp") return asIs(file);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) return asIs(file);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.8),
      );
      if (!blob) return asIs(file);
      const name = file.name.replace(/\.[a-z0-9]+$/i, "") || "photo";
      const next = new File([blob], `${name}.webp`, { type: "image/webp" });
      return { file: next, converted: true, savedBytes: Math.max(0, file.size - next.size) };
    } finally {
      bitmap.close();
    }
  } catch {
    return asIs(file);
  }
}
