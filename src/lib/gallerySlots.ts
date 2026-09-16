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
 * - Automatically detects keywords in caption (depan, belakang, mezanine, cluster/jalan, walkthrough)
 * - Guarantees sequential 1-based numbering: 1., 2., 3., 4., 5...
 * - Handles custom captions with clean Title Casing
 */
export function getSlotBadge(sortOrder: number, caption?: string, isVideo?: boolean): string {
  const displayIndex = sortOrder + 1;
  const cleanCaption = caption?.trim();

  if (cleanCaption) {
    const lower = cleanCaption.toLowerCase();
    if (lower.includes('depan')) {
      return `${displayIndex}. Tampak Depan`;
    }
    if (lower.includes('belakang')) {
      return `${displayIndex}. ${isVideo ? 'Video Area Belakang' : 'Area Belakang'}`;
    }
    if (lower.includes('mezanine')) {
      return `${displayIndex}. Area Mezanine`;
    }
    if (lower.includes('cluster') || lower.includes('jalan')) {
      return `${displayIndex}. Lingkungan & Jalanan Cluster Asri`;
    }
    if (lower.includes('walkthrough')) {
      return `${displayIndex}. Video Walkthrough`;
    }
    // Capitalize first letter of custom caption
    const formatted = cleanCaption.charAt(0).toUpperCase() + cleanCaption.slice(1);
    return `${displayIndex}. ${formatted}`;
  }

  // Fallbacks if no caption provided
  if (sortOrder === 0) return `${displayIndex}. Tampak Depan`;
  if (sortOrder === 1) return `${displayIndex}. ${isVideo ? 'Video Dokumentasi' : 'Area Mezanine'}`;
  if (sortOrder === 2) return `${displayIndex}. Lingkungan & Jalanan Cluster Asri`;
  if (isVideo) return `${displayIndex}. Video Walkthrough`;
  return `${displayIndex}. Foto Properti`;
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
  if (lower.includes('mezanine')) return 'mezzanine';
  if (lower.includes('jalan') || lower.includes('cluster')) return 'cluster';
  if (lower.includes('walkthrough')) return 'walkthrough';
  if (lower.includes('belakang')) return 'interior';
  if (sortOrder === 1) return 'mezzanine';
  if (sortOrder === 2) return 'cluster';
  return 'interior';
}

