// Safe Storage Utilities for Iframe & Restricted Environments

export const safeStorage = {
  get: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (err) {
      console.warn('LocalStorage read suppressed:', err);
    }
    return null;
  },

  set: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch (err) {
      console.warn('LocalStorage write suppressed (quota exceeded or iframe restricted):', err);
    }
    return false;
  },

  remove: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn('LocalStorage remove suppressed:', err);
    }
  },
};

/**
 * Compresses an uploaded image file down to max 1600px width/height and JPEG 0.88
 * to ensure high poster quality while preventing memory bloat or quota crashes.
 */
export const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih harus berupa gambar (JPG, PNG, WebP)'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => {
        // Fallback to original data URL if image element decode fails
        resolve(rawDataUrl);
      };
      img.onload = () => {
        try {
          const maxDimension = 1600;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          resolve(compressed);
        } catch (e) {
          console.warn('Canvas image compression fallback:', e);
          resolve(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Reads any media file (image or video) as Data URL.
 */
export const readMediaFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file media'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};
