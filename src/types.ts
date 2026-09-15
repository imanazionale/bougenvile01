export type ColorThemeId = 'warm-sand' | 'midnight-gold' | 'serene-sage' | 'pearl-white';

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
  title: string;
  tagline: string;
  location: string;
  mezzanine: string;
  landArea: string;
  price: string;
  pricePeriod: string;
  priceFull: string;
  targetAudience: string;
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
  type: MediaType;
  url: string;
  title: string;
  category: 'exterior' | 'mezzanine' | 'interior' | 'cluster' | 'walkthrough' | 'facility';
  badge: string;
  description?: string;
  isUploadedByUser?: boolean;
}
