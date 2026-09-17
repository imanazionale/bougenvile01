import { GallerySlotInfo, MediaItem } from '../types';

/**
 * Predefined labels and metadata for the property gallery:
 * - 1st media (sort_order 0): 1. Foto Depan Rumah
 * - 2nd media (sort_order 1): 2. Foto Mezanine
 * - 3rd media (sort_order 2): 3. Foto Jalanan Cluster
 * - 4th media and beyond: Video dokumentasi hunian
 */
export const PRIMARY_SLOT_DEFINITIONS: Omit<GallerySlotInfo, 'slot' | 'sort_order'>[] = [
  {
    badge: '1. Foto Depan Rumah',
    caption: 'Foto Depan Rumah & Carport',
    category: 'exterior',
    defaultType: 'photo',
    label: 'Foto Depan Rumah',
    description: 'Foto fasad dan tampak depan rumah asli di cluster.',
    buttonLabel: 'Pilih Foto Depan Rumah',
  },
  {
    badge: '2. Foto Mezanine',
    caption: 'Foto Mezanine 1/2 Lantai & Tangga',
    category: 'mezzanine',
    defaultType: 'photo',
    label: 'Foto Mezanine 1/2 Lantai',
    description: 'Foto area mezanine fungsional 1/2 lantai.',
    buttonLabel: 'Pilih Foto Mezanine',
  },
  {
    badge: '3. Foto Jalanan Cluster',
    caption: 'Foto Jalanan & Lingkungan Cluster',
    category: 'cluster',
    defaultType: 'photo',
    label: 'Foto Jalanan Cluster',
    description: 'Foto lingkungan dan jalanan cluster asri yang tertata dan nyaman.',
    buttonLabel: 'Pilih Foto Jalanan Cluster',
  },
  {
    badge: '4. Video Walkthrough',
    caption: 'Video Walkthrough Hunian',
    category: 'walkthrough',
    defaultType: 'video',
    label: 'Video Dokumentasi Hunian',
    description: 'Video walkthrough atau dokumentasi video ruangan rumah.',
    buttonLabel: 'Pilih Video Hunian',
  },
];

/**
 * Calculate the next dynamic sort_order:
 * - first media = 0
 * - second = 1
 * - third = 2
 * - fourth = 3
 * - etc.
 * When all media are deleted, the next uploaded media must use sort_order 0.
 */
export function getNextSortOrder(
  existingItems: { sort_order?: number }[],
  offset: number = 0
): number {
  if (!existingItems || existingItems.length === 0) {
    return 0 + offset;
  }

  const maxOrder = existingItems.reduce((max, item) => {
    if (typeof item.sort_order === 'number' && item.sort_order > max) {
      return item.sort_order;
    }
    return max;
  }, -1);

  const baseOrder = maxOrder >= 0 ? maxOrder + 1 : existingItems.length;
  return baseOrder + offset;
}

/**
 * Determine the next gallery slot dynamically from existing property_media records.
 * - If no media exist (or all media deleted), returns sort_order 0.
 * - Does NOT force a hardcoded "4. Video Walkthrough" when determining the next slot.
 * - Preserves existing labels for the first 4 items (sort_orders 0..3) while supporting
 *   unlimited additional media items dynamically.
 */
export function getNextGallerySlot(
  existingItems: { sort_order?: number; category?: string; type?: string }[],
  offset: number = 0
): GallerySlotInfo {
  const nextSortOrder = getNextSortOrder(existingItems, offset);
  const displaySlot = nextSortOrder + 1;

  // Use defined primary metadata for the first 4 items (0, 1, 2, 3)
  if (nextSortOrder < PRIMARY_SLOT_DEFINITIONS.length) {
    const def = PRIMARY_SLOT_DEFINITIONS[nextSortOrder];
    return {
      slot: displaySlot,
      sort_order: nextSortOrder,
      badge: def.badge,
      caption: def.caption,
      category: def.category,
      defaultType: def.defaultType,
      label: def.label,
      description: def.description,
      buttonLabel: def.buttonLabel,
    };
  }

  // Dynamic additional media items for sort_order >= 4: default to video
  return {
    slot: displaySlot,
    sort_order: nextSortOrder,
    badge: `${displaySlot}. Video Walkthrough`,
    caption: `Video Dokumentasi #${displaySlot}`,
    category: 'walkthrough',
    defaultType: 'video',
    label: `Video Dokumentasi #${displaySlot}`,
    description: `Media video dokumentasi hunian urutan #${displaySlot}. Klik tombol di bawah untuk memilih file video atau foto.`,
    buttonLabel: `Pilih Video #${displaySlot}`,
  };
}

/**
 * Format badge for a given sort_order (0-indexed) and caption
 * Strictly reflects the required ordering:
 * 1. Foto Depan Rumah
 * 2. Foto Mezanine
 * 3. Foto Jalanan Cluster
 * 4. dan seterusnya Video / Media
 */
export function getSlotBadge(sortOrder: number, caption?: string, isVideo?: boolean): string {
  const displayIndex = sortOrder + 1;
  const cleanCaption = caption?.trim();

  if (sortOrder === 0) return '1. Foto Depan Rumah';
  if (sortOrder === 1) return '2. Foto Mezanine';
  if (sortOrder === 2) return '3. Foto Jalanan Cluster';

  if (isVideo) {
    if (cleanCaption && cleanCaption.toLowerCase().includes('walkthrough')) {
      return `${displayIndex}. Video Walkthrough`;
    }
    if (cleanCaption && cleanCaption.toLowerCase().includes('belakang')) {
      return `${displayIndex}. Video Area Belakang`;
    }
    if (cleanCaption) {
      const formatted = cleanCaption.charAt(0).toUpperCase() + cleanCaption.slice(1);
      return `${displayIndex}. ${formatted.startsWith('Video') ? formatted : 'Video ' + formatted}`;
    }
    return `${displayIndex}. Video Walkthrough`;
  }

  if (cleanCaption) {
    const formatted = cleanCaption.charAt(0).toUpperCase() + cleanCaption.slice(1);
    return `${displayIndex}. ${formatted}`;
  }

  return `${displayIndex}. Video Dokumentasi`;
}

/**
 * Determine category from sort_order, media type, and caption
 */
export function getSlotCategory(
  sortOrder: number,
  isVideo: boolean = false,
  caption?: string
): MediaItem['category'] {
  if (isVideo) return 'walkthrough';
  const lower = caption?.toLowerCase() || '';
  if (lower.includes('depan') || sortOrder === 0) return 'exterior';
  if (lower.includes('mezanine') || sortOrder === 1) return 'mezzanine';
  if (lower.includes('jalan') || lower.includes('cluster') || sortOrder === 2) return 'cluster';
  if (lower.includes('walkthrough')) return 'walkthrough';
  if (lower.includes('belakang')) return 'interior';
  if (sortOrder === 1) return 'mezzanine';
  if (sortOrder === 2) return 'cluster';
  return 'interior';
}

/**
 * Enforce strict gallery media order:
 * 1. Foto Depan Rumah
 * 2. Foto Mezanine
 * 3. Foto Jalanan Cluster
 * 4. dan seterusnya bebas Video semua
 */
export function orderGalleryMediaItems<T extends {
  type?: string;
  media_type?: string;
  category?: string;
  caption?: string | null;
  file_path?: string;
  url?: string;
  title?: string;
  sort_order?: number;
  id?: any;
}>(items: T[]): T[] {
  if (!items || items.length === 0) return [];

  const isVideoItem = (item: T) =>
    item.type === 'video' ||
    item.media_type === 'video' ||
    item.category === 'walkthrough' ||
    (item.file_path && /\.(mp4|mov|webm|mkv|avi|m4v|3gp)$/i.test(item.file_path)) ||
    (item.url && /\.(mp4|mov|webm|mkv|avi|m4v|3gp)(\?|$)/i.test(item.url)) ||
    (item.caption && item.caption.toLowerCase().includes('video'));

  const photos = items.filter((item) => !isVideoItem(item));
  const videos = items.filter((item) => isVideoItem(item));

  // 1. Foto Depan Rumah
  let depanItem = photos.find(
    (p) =>
      p.category === 'exterior' ||
      /depan|fasad|carport|131958/i.test(p.caption || '') ||
      /depan|fasad|carport|131958/i.test(p.title || '') ||
      /depan|fasad|carport|131958/i.test(p.file_path || '')
  );

  // 2. Foto Mezanine
  let mezanineItem = photos.find(
    (p) =>
      p !== depanItem &&
      (p.category === 'mezzanine' ||
        /mezan|tangga|130239/i.test(p.caption || '') ||
        /mezan|tangga|130239/i.test(p.title || '') ||
        /mezan|tangga|130239/i.test(p.file_path || ''))
  );

  // 3. Foto Jalanan Cluster
  let clusterItem = photos.find(
    (p) =>
      p !== depanItem &&
      p !== mezanineItem &&
      (p.category === 'cluster' ||
        /cluster|jalan|lingkungan/i.test(p.caption || '') ||
        /cluster|jalan|lingkungan/i.test(p.title || '') ||
        /cluster|jalan|lingkungan/i.test(p.file_path || ''))
  );

  const remainingPhotos = photos.filter(
    (p) => p !== depanItem && p !== mezanineItem && p !== clusterItem
  );

  if (!depanItem && remainingPhotos.length > 0) {
    depanItem = remainingPhotos.shift();
  }
  if (!mezanineItem && remainingPhotos.length > 0) {
    mezanineItem = remainingPhotos.shift();
  }
  if (!clusterItem && remainingPhotos.length > 0) {
    clusterItem = remainingPhotos.shift();
  }

  // Videos sorted by sort_order or id
  const sortedVideos = [...videos].sort((a, b) => {
    const oA = a.sort_order ?? 999;
    const oB = b.sort_order ?? 999;
    if (oA !== oB) return oA - oB;
    return Number(a.id || 0) - Number(b.id || 0);
  });

  const ordered: T[] = [];
  if (depanItem) ordered.push(depanItem);
  if (mezanineItem) ordered.push(mezanineItem);
  if (clusterItem) ordered.push(clusterItem);

  // 4. dan seterusnya bebas Video semua
  ordered.push(...sortedVideos);

  // Any remaining photos (if any)
  ordered.push(...remainingPhotos);

  return ordered;
}

