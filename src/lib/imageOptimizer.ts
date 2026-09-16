/**
 * Client-side image compression and optimization utility
 * Prevents "The object exceeded the maximum allowed size" errors when uploading
 * high-resolution camera photos to Supabase Storage.
 */

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
  maxSizeBytes?: number;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formatted = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${formatted} ${units[i]}`;
}

export function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'heif', 'avif'].includes(ext);
}

export function isVideoFile(file: File): boolean {
  if (file.type && file.type.startsWith('video/')) return true;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  return ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v', '3gp'].includes(ext);
}

/**
 * Automatically compress and downscale an image client-side before uploading.
 * High-resolution phone camera photos (5-20MB) are resized to web standards
 * (max 1920px width/height, ~300KB-800KB) while maintaining pristine visual quality.
 */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  // If not an image, return original
  if (!isImageFile(file)) {
    return file;
  }

  // Preserve SVG or animated GIF as-is if already reasonably sized
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext === 'svg' || (ext === 'gif' && file.size < 1.5 * 1024 * 1024)) {
    return file;
  }

  const {
    maxDimension = 1920,
    quality = 0.82,
    maxSizeBytes = 1.8 * 1024 * 1024, // 1.8 MB safe threshold for Supabase
  } = options;

  // If already under 700KB and reasonable size, skip compression
  if (file.size <= 700 * 1024 && ext !== 'png' && ext !== 'bmp') {
    return file;
  }

  try {
    let sourceWidth = 0;
    let sourceHeight = 0;
    let imageSource: CanvasImageSource;

    // Use createImageBitmap if supported for efficiency and automatic orientation handling
    if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
      try {
        const bmp = await createImageBitmap(file);
        sourceWidth = bmp.width;
        sourceHeight = bmp.height;
        imageSource = bmp;
      } catch {
        // Fallback to Image element
        const img = await loadImageElement(file);
        sourceWidth = img.naturalWidth || img.width;
        sourceHeight = img.naturalHeight || img.height;
        imageSource = img;
      }
    } else {
      const img = await loadImageElement(file);
      sourceWidth = img.naturalWidth || img.width;
      sourceHeight = img.naturalHeight || img.height;
      imageSource = img;
    }

    if (!sourceWidth || !sourceHeight) {
      return file;
    }

    // Try multiple compression passes if needed to ensure file is under maxSizeBytes
    const attempts = [
      { dim: maxDimension, q: quality },
      { dim: Math.min(maxDimension, 1600), q: Math.max(0.74, quality - 0.08) },
      { dim: Math.min(maxDimension, 1280), q: 0.68 },
      { dim: Math.min(maxDimension, 1024), q: 0.60 },
    ];

    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      const { width, height } = calculateAspectRatioFit(sourceWidth, sourceHeight, attempt.dim, attempt.dim);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return file;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill white background for transparent PNGs converted to JPEG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(imageSource, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', attempt.q);
      });

      if (blob) {
        // If file fits or is on the last attempt, return it
        if (blob.size <= maxSizeBytes || i === attempts.length - 1) {
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const newFileName = `${baseName}.jpg`;
          return new File([blob], newFileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
        }
      }
    }

    return file;
  } catch (err) {
    console.warn('Image compression fallback to original file:', err);
    return file;
  }
}

/**
 * Load HTMLImageElement from File via Object URL
 */
function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * Calculate proportional dimensions within max width & height
 */
function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (srcWidth <= maxWidth && srcHeight <= maxHeight) {
    return { width: Math.round(srcWidth), height: Math.round(srcHeight) };
  }
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio),
  };
}

/**
 * Formats upload errors with user-friendly Indonesian messages
 */
export function formatUploadErrorMessage(err: any, file?: File): string {
  const rawMsg = err?.message || String(err || '');
  const lowerMsg = rawMsg.toLowerCase();

  if (
    lowerMsg.includes('exceeded the maximum allowed size') ||
    lowerMsg.includes('payload too large') ||
    lowerMsg.includes('entity too large') ||
    lowerMsg.includes('413')
  ) {
    const fileSizeStr = file ? ` (${formatFileSize(file.size)})` : '';
    if (file && isVideoFile(file)) {
      return `Ukuran video terkompresi${fileSizeStr} masih melebihi batas 50MB Supabase Storage. Silakan potong durasi video sebelum mengunggah.`;
    }
    return `Ukuran berkas${fileSizeStr} melebihi batas kapasitas Supabase Storage (50MB).`;
  }

  if (
    lowerMsg.includes('row-level security') ||
    lowerMsg.includes('rls') ||
    lowerMsg.includes('permission denied')
  ) {
    return 'Gagal mengunggah: Terkendala aturan hak akses (RLS) Supabase Storage. Pastikan Anda sudah login sebagai Admin properti.';
  }

  if (lowerMsg.includes('jwt') || lowerMsg.includes('unauthorized') || lowerMsg.includes('401')) {
    return 'Sesi login telah berakhir. Silakan login kembali sebagai Admin.';
  }

  return rawMsg;
}
