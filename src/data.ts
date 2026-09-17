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
  description: "Hunian nyaman dan asri di Taman Jaya, Cipayung – Depok. Cluster sudah 95% terhuni, lingkungan nyaman dan aktif, dengan suasana hunian yang aman dan tertata. Tersedia masjid di dalam cluster sehingga memudahkan aktivitas ibadah sehari-hari.",
  clusterInfo: "Cluster sudah 95% terhuni, lingkungan nyaman dan aktif, dengan suasana hunian yang aman dan tertata. Tersedia masjid di dalam cluster sehingga memudahkan aktivitas ibadah sehari-hari.",
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

export const WHATSAPP_CONFIG = {
  rawNumber: "0812-8304-3842",
  phoneDigits: "6281283043842",
  defaultMessage: "Assalamu’alaikum warahmatullahi wabarakatuh. Apakah rumahnya masih tersedia?",
  directUrl: `https://wa.me/6281283043842?text=${encodeURIComponent("Assalamu’alaikum warahmatullahi wabarakatuh. Apakah rumahnya masih tersedia?")}`,
};

export function getWhatsAppDirectUrl(
  phone: string = "0812-8304-3842",
  message: string = "Assalamu’alaikum warahmatullahi wabarakatuh. Apakah rumahnya masih tersedia?"
): string {
  let cleanDigits = phone.replace(/[^0-9]/g, '');
  if (cleanDigits.startsWith('0')) {
    cleanDigits = '62' + cleanDigits.slice(1);
  } else if (!cleanDigits.startsWith('62')) {
    cleanDigits = '62' + cleanDigits;
  }
  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;
}

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
 * Urutan Galeri Media Sesuai Ketentuan:
 * 1. Foto Depan Rumah
 * 2. Foto Mezanine
 * 3. Foto Jalanan Cluster
 * 4. dan seterusnya bebas Video semua
 */
export const DEFAULT_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'media-1-exterior',
    type: 'photo',
    url: '/20260905_131958.jpg',
    title: 'Foto Depan Rumah & Carport',
    category: 'exterior',
    badge: '1. Foto Depan Rumah',
    description: 'Fasad rumah minimalis modern di cluster asri, dilengkapi carport dan smart door lock.',
    sort_order: 0,
  },
  {
    id: 'media-2-mezzanine',
    type: 'photo',
    url: '/20260905_130239.jpg',
    title: 'Foto Mezanine 1/2 Lantai & Tangga',
    category: 'mezzanine',
    badge: '2. Foto Mezanine',
    description: 'Konsep mezanine fungsional 1/2 lantai untuk ruang kerja/santai/kamar ekstra dengan sirkulasi udara optimal.',
    sort_order: 1,
  },
];
