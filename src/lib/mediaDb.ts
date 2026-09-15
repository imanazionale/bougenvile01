// Rock-solid IndexedDB Persistence Engine for Property Media & Real Photos
// Supports unlimited size (videos, high-res photos, blobs, data URLs)
// Persists reliably across page refresh, tab closure, and future sessions.

import { MediaItem, PropertyPhotos } from '../types';

const DB_NAME = 'PropertyMediaAppDB';
const DB_VERSION = 1;

const STORES = {
  MEDIA_ITEMS: 'media_items',
  PROJECT_PHOTOS: 'project_photos',
  KV_STORE: 'kv_store',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export const getDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.MEDIA_ITEMS)) {
        db.createObjectStore(STORES.MEDIA_ITEMS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.PROJECT_PHOTOS)) {
        db.createObjectStore(STORES.PROJECT_PHOTOS, { keyPath: 'slot' });
      }

      if (!db.objectStoreNames.contains(STORES.KV_STORE)) {
        db.createObjectStore(STORES.KV_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
};

// ===================== PROJECT PHOTOS PERSISTENCE =====================

export interface StoredProjectPhoto {
  slot: 'heroExterior' | 'mezzanineInterior' | 'clusterStreet';
  url: string;
  updatedAt: number;
}

export const saveProjectPhoto = async (
  slot: 'heroExterior' | 'mezzanineInterior' | 'clusterStreet',
  url: string
): Promise<void> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PROJECT_PHOTOS], 'readwrite');
      const store = transaction.objectStore(STORES.PROJECT_PHOTOS);
      const record: StoredProjectPhoto = {
        slot,
        url,
        updatedAt: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save project photo to IndexedDB:', err);
  }
};

export const getProjectPhotos = async (): Promise<Partial<PropertyPhotos>> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORES.PROJECT_PHOTOS], 'readonly');
      const store = transaction.objectStore(STORES.PROJECT_PHOTOS);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = (req.result as StoredProjectPhoto[]) || [];
        const result: Partial<PropertyPhotos> = {};
        for (const item of records) {
          if (item.slot === 'heroExterior') result.heroExterior = item.url;
          if (item.slot === 'mezzanineInterior') result.mezzanineInterior = item.url;
          if (item.slot === 'clusterStreet') result.clusterStreet = item.url;
        }
        resolve(result);
      };

      req.onerror = () => {
        console.warn('Failed to read project photos from IndexedDB:', req.error);
        resolve({});
      };
    });
  } catch (err) {
    console.warn('IndexedDB not ready for getProjectPhotos:', err);
    return {};
  }
};

export const clearProjectPhoto = async (
  slot: 'heroExterior' | 'mezzanineInterior' | 'clusterStreet'
): Promise<void> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PROJECT_PHOTOS], 'readwrite');
      const store = transaction.objectStore(STORES.PROJECT_PHOTOS);
      const req = store.delete(slot);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete project photo from IndexedDB:', err);
  }
};

// ===================== MEDIA ITEMS (GALLERY & CAROUSEL) =====================

export const saveMediaItem = async (item: MediaItem): Promise<void> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.MEDIA_ITEMS], 'readwrite');
      const store = transaction.objectStore(STORES.MEDIA_ITEMS);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save media item to IndexedDB:', err);
  }
};

export const saveAllMediaItems = async (items: MediaItem[]): Promise<void> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.MEDIA_ITEMS], 'readwrite');
      const store = transaction.objectStore(STORES.MEDIA_ITEMS);

      // Clear existing to keep exact order and state
      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        let completed = 0;
        if (items.length === 0) {
          resolve();
          return;
        }
        for (const item of items) {
          const putReq = store.put(item);
          putReq.onsuccess = () => {
            completed++;
            if (completed === items.length) resolve();
          };
          putReq.onerror = () => reject(putReq.error);
        }
      };
      clearReq.onerror = () => reject(clearReq.error);
    });
  } catch (err) {
    console.warn('Failed to bulk save media items to IndexedDB:', err);
  }
};

export const getAllMediaItems = async (): Promise<MediaItem[]> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORES.MEDIA_ITEMS], 'readonly');
      const store = transaction.objectStore(STORES.MEDIA_ITEMS);
      const req = store.getAll();

      req.onsuccess = () => {
        resolve((req.result as MediaItem[]) || []);
      };

      req.onerror = () => {
        console.warn('Failed to get media items from IndexedDB:', req.error);
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('IndexedDB not ready for getAllMediaItems:', err);
    return [];
  }
};

export const deleteMediaItemById = async (id: string): Promise<void> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.MEDIA_ITEMS], 'readwrite');
      const store = transaction.objectStore(STORES.MEDIA_ITEMS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete media item from IndexedDB:', err);
  }
};

export const clearAllSavedMedia = async (): Promise<void> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [STORES.MEDIA_ITEMS, STORES.PROJECT_PHOTOS, STORES.KV_STORE],
        'readwrite'
      );
      transaction.objectStore(STORES.MEDIA_ITEMS).clear();
      transaction.objectStore(STORES.PROJECT_PHOTOS).clear();
      transaction.objectStore(STORES.KV_STORE).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('Failed to clear IndexedDB:', err);
  }
};

// ===================== KEY-VALUE STORE FOR PROJECT SETTINGS =====================

export const saveKV = async (key: string, value: unknown): Promise<void> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.KV_STORE], 'readwrite');
      const store = transaction.objectStore(STORES.KV_STORE);
      const req = store.put({ key, value, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`Failed to save KV ${key} to IndexedDB:`, err);
  }
};

export const getKV = async <T = unknown>(key: string): Promise<T | null> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORES.KV_STORE], 'readonly');
      const store = transaction.objectStore(STORES.KV_STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        resolve(req.result ? (req.result.value as T) : null);
      };
      req.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn(`Failed to get KV ${key} from IndexedDB:`, err);
    return null;
  }
};

