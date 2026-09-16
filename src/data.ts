import { ColorTheme, PropertyData, MediaItem } from './types';

export const PROPERTY_DATA: PropertyData = {
  title: "RUMAH DIKONTRAKKAN",
  tagline: "Hunian Asri & Nyaman untuk Keluarga",
  location: "Taman Jaya, Cipayung – Depok",
  mezzanine: "Mezanine 1/2 Lantai",
  landArea: "LT 88 m²",
  price: "Rp 2,3 Juta",
  pricePeriod: "/ bulan",
  priceFull: "Rp 2,3 Juta / bulan",
  targetAudience: "Keluarga muda / pasangan di lingkungan aman & islami",
  highlights: [
    { id: '1', text: 'Cluster Islami', icon: 'ShieldCheck' },
    { id: '2', text: 'Masjid di Dalam Cluster', icon: 'Landmark' },
    { id: '3', text: '±10 Menit ke Stasiun Depok', icon: 'Train' },
    { id: '4', text: 'Dekat Tol Desari', icon: 'Car' },
    { id: '5', text: 'Smart Door Lock', icon: 'Fingerprint' },
    { id: '6', text: 'AC 1/2 PK', icon: 'Wind' },
  ],
  ctaTitle: "Nyaman untuk Tinggal, Tenang untuk Keluarga",
  ctaButton: "Hubungi Kami untuk Info & Survey",
  contactNumber: "0812-8304-3842",
};

export const COLOR_THEMES: Record<string, ColorTheme> = {
  'light': {
    id: 'light',
    name: 'Light Mode',
    bgGradient: 'from-[#FCFAF7] via-[#F7F4EC] to-[#EFEAE0]',
    cardBg: 'bg-white/95 border-amber-900/15',
    headerAccent: 'text-[#8A6732]',
    badgeBg: 'bg-[#1C1D1F]',
    badgeText: 'text-[#F3ECE2]',
    accentGold: 'text-[#B08945]',
    textPrimary: 'text-[#1C1917]',
    textSecondary: 'text-[#57534E]',
    borderSubtle: 'border-[#E7DEC9]',
    ctaBg: 'bg-gradient-to-r from-[#1E2022] to-[#2B2D30]',
    ctaText: 'text-[#F5EFEB]',
    checkColor: 'text-[#9A7338]',
  },
  'dark': {
    id: 'dark',
    name: 'Dark Mode',
    bgGradient: 'from-[#121316] via-[#18191E] to-[#1E2026]',
    cardBg: 'bg-[#181A1F]/95 border-neutral-700/60',
    headerAccent: 'text-[#E5BE79]',
    badgeBg: 'bg-[#C8A058]',
    badgeText: 'text-[#121315]',
    accentGold: 'text-[#E4BC72]',
    textPrimary: 'text-[#F5F5F7]',
    textSecondary: 'text-[#A0A4B0]',
    borderSubtle: 'border-[#333742]',
    ctaBg: 'bg-gradient-to-r from-[#C8A058] to-[#DFC184]',
    ctaText: 'text-[#141518]',
    checkColor: 'text-[#DFC184]',
  },
};

/**
 * Urutan Galeri Media Sesuai Permintaan User:
 * 1. Tampak depan rumah
 * 2. Area mezanine
 * 3. Foto interior lainnya
 * 4. Foto lingkungan cluster
 * 5. Video walkthrough rumah
 * 6. Video/foto fasilitas lainnya sesuai file upload
 */
export const DEFAULT_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'media-1-exterior',
    type: 'photo',
    url: '/20260905_131958.jpg',
    title: 'Tampak Depan Rumah & Carport',
    category: 'exterior',
    badge: '1. Tampak Depan',
    description: 'Fasad rumah minimalis modern di cluster asri, dilengkapi carport dan smart door lock.',
  },
  {
    id: 'media-2-mezzanine',
    type: 'photo',
    url: '/20260905_130239.jpg',
    title: 'Area Mezanine 1/2 Lantai & Tangga',
    category: 'mezzanine',
    badge: '2. Area Mezanine',
    description: 'Konsep mezanine fungsional 1/2 lantai untuk ruang kerja/santai/kamar ekstra dengan sirkulasi udara optimal.',
  },
];
