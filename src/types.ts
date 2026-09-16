export type ColorThemeId = 'light' | 'dark';

export interface ColorTheme {
  id: ColorThemeId;
  name: string;
  bgGradient: string;
  cardBg: string;
  headerAccent: string;
  badgeBg: string;
  badgeText: string;
  accentGold: string;
  textPrimary: string;
  textSecondary: string;
  borderSubtle: string;
  ctaBg: string;
  ctaText: string;
  checkColor: string;
}

export type PhotoLayout = 'hybrid-inset' | 'split-dual' | 'hero-exterior';

export interface PropertyData {
  id?: number;
  title: string;
  tagline: string;
  location: string;
  mezzanine: string;
  landArea: string;
  land_area_numeric?: number;
  price: string;
  price_numeric?: number;
  pricePeriod: string;
  priceFull: string;
  targetAudience: string;
  description?: string;
  highlights: {
    id: string;
    text: string;
    icon: string;
  }[];
  ctaTitle: string;
  ctaButton: string;
  contactNumber: string;
}

export interface PropertyPhotos {
  heroExterior: string;
  mezzanineInterior: string;
  clusterStreet?: string;
}

export type MediaType = 'photo' | 'video';

export interface MediaItem {
  id: string;
  supabaseId?: number;
  property_id?: number;
  file_path?: string;
  type: MediaType;
  url: string;
  title: string;
  category: 'exterior' | 'mezzanine' | 'interior' | 'cluster' | 'walkthrough' | 'facility';
  badge: string;
  description?: string;
  caption?: string;
  sort_order?: number;
  isUploadedByUser?: boolean;
}

export interface GallerySlotInfo {
  slot: number;
  sort_order: number;
  badge: string;
  caption: string;
  category: 'exterior' | 'mezzanine' | 'interior' | 'cluster' | 'walkthrough' | 'facility';
  defaultType: MediaType;
  label: string;
  description: string;
  buttonLabel: string;
}
