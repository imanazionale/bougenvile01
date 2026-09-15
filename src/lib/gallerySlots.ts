import { GallerySlotInfo, MediaItem } from '../types';

/**
 * Predefined labels and metadata for the first 4 items in the property gallery:
 * - 1st media (sort_order 0): Tampak Depan Rumah & Carport
 * - 2nd media (sort_order 1): Area Mezanine 1/2 Lantai & Tangga
 * - 3rd media (sort_order 2): Lingkungan & Jalanan Cluster Asri
 * - 4th media (sort_order 3): Video Walkthrough Hunian / Dokumentasi Properti
 */
export const PRIMARY_SLOT_DEFINITIONS: Omit<GallerySlotInfo, 'slot' | 'sort_order'>[] = [
  {
    badge: '1. Tampak Depan',
    caption: 'Tampak Depan Rumah & Carport',
    category: 'exterior',
    defaultType: 'photo',
    label: 'Tampak Depan Rumah',
    description: 'Foto fasad dan tampak depan rumah belum tersimpan di sistem. Klik tombol di bawah untuk memilih foto asli.',
    buttonLabel: 'Pilih Foto Tampak Depan',
  },
  {
    badge: '2. Area Mezanine',
    caption: 'Area Mezanine 1/2 Lantai & Tangga',
    category: 'mezzanine',
    defaultType: 'photo',
    label: 'Area Mezanine 1/2 Lantai',
    description: 'Foto area mezanine fungsional belum tersimpan di sistem. Klik tombol di bawah untuk memilih foto asli.',
    buttonLabel: 'Pilih Foto Area Mezanine',
  },
  {
    badge: '3. Lingkungan & Jalanan Cluster Asri',
    caption: 'Lingkungan & Jalanan Cluster Asri',
    category: 'cluster',
    defaultType: 'photo',
    label: 'Lingkungan & Jalanan Cluster Asri',
    description: 'Foto kondisi jalan cluster asri belum tersimpan di sistem. Klik tombol di bawah untuk memilih foto asli.',
    buttonLabel: 'Pilih Foto Jalanan Cluster',
  },
  {
    badge: '4. Video Walkthrough',
    caption: 'Video Walkthrough Hunian',
    category: 'walkthrough',
    defaultType: 'video',
    label: 'Video Walkthrough / Foto Hunian',
    description: 'Video walkthrough atau foto dokumentasi hunian belum tersimpan di sistem. Klik tombol di bawah untuk memilih file.',
    buttonLabel: 'Pilih Video / Foto Hunian',
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

  // Dynamic additional media items for sort_order >= 4
  return {
    slot: displaySlot,
    sort_order: nextSortOrder,
    badge: `${displaySlot}. Media Tambahan`,
    caption: `Dokumentasi Properti #${displaySlot}`,
    category: 'interior',
    defaultType: 'photo',
    label: `Media Tambahan #${displaySlot}`,
    description: `Media dokumentasi properti urutan #${displaySlot}. Klik tombol di bawah untuk memilih file foto atau video.`,
    buttonLabel: `Pilih File #${displaySlot}`,
  };
}

/**
 * Format badge for a given sort_order (0-indexed) and caption
 * - sort_order 0 -> 1. Tampak Depan
 * - sort_order 1 -> 2. Area Mezanine
 * - sort_order 2 -> 3. Lingkungan & Jalanan Cluster Asri
 * - sort_order 3 -> 4. Video Walkthrough (if video) or 4. <caption/Foto>
 * - sort_order N -> (N+1). <caption/Foto/Video>
 */
export function getSlotBadge(sortOrder: number, caption?: string, isVideo?: boolean): string {
  const displayIndex = sortOrder + 1;
  const cleanCaption = caption?.trim();

  // 1st media: sort_order 0
  if (sortOrder === 0) {
    if (
      cleanCaption &&
      cleanCaption !== 'Tampak Depan Rumah & Carport' &&
      !cleanCaption.toLowerCase().includes('tampak depan')
    ) {
      return `1. ${cleanCaption}`;
    }
    return '1. Tampak Depan';
  }

  // 2nd media: sort_order 1
  if (sortOrder === 1) {
    if (
      cleanCaption &&
      cleanCaption !== 'Area Mezanine 1/2 Lantai & Tangga' &&
      !cleanCaption.toLowerCase().includes('area mezanine')
    ) {
      return `2. ${cleanCaption}`;
    }
    return '2. Area Mezanine';
  }

  // 3rd media: sort_order 2
  if (sortOrder === 2) {
    if (
      cleanCaption &&
      cleanCaption !== 'Lingkungan & Jalanan Cluster Asri' &&
      !cleanCaption.toLowerCase().includes('jalanan cluster') &&
      !cleanCaption.toLowerCase().includes('cluster asri')
    ) {
      return `3. ${cleanCaption}`;
    }
    return '3. Lingkungan & Jalanan Cluster Asri';
  }

  // 4th media: sort_order 3
  if (sortOrder === 3) {
    if (isVideo || (cleanCaption && cleanCaption.toLowerCase().includes('walkthrough'))) {
      return '4. Video Walkthrough';
    }
    if (cleanCaption && cleanCaption !== 'Video Walkthrough Hunian' && cleanCaption !== 'Dokumentasi Properti #4') {
      return `4. ${cleanCaption}`;
    }
    return '4. Video Walkthrough';
  }

  // Dynamic additional media (sort_order >= 4)
  return `${displayIndex}. ${cleanCaption || (isVideo ? 'Video' : 'Foto')}`;
}

/**
 * Determine category from sort_order and media type
 */
export function getSlotCategory(
  sortOrder: number,
  isVideo: boolean = false,
  caption?: string
): MediaItem['category'] {
  if (isVideo) return 'walkthrough';
  if (sortOrder === 0 || (caption && caption.toLowerCase().includes('depan'))) return 'exterior';
  if (sortOrder === 1 || (caption && caption.toLowerCase().includes('mezanine'))) return 'mezzanine';
  if (
    sortOrder === 2 ||
    (caption && (caption.toLowerCase().includes('jalan') || caption.toLowerCase().includes('cluster')))
  ) {
    return 'cluster';
  }
  if (caption && caption.toLowerCase().includes('walkthrough')) {
    return 'walkthrough';
  }
  return 'interior';
}

