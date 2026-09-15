import React, { forwardRef, useState, useRef } from 'react';
import {
  MapPin,
  CheckCircle2,
  Layers,
  Maximize2,
  ShieldCheck,
  Landmark,
  Train,
  Car,
  Fingerprint,
  Wind,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Tag,
  Camera,
} from 'lucide-react';
import { ColorTheme, PhotoLayout, PropertyData, PropertyPhotos } from '../types';

// Bundled fallback images
import fallbackHouseExterior from '../assets/images/house_exterior_1789381755113.jpg';
import fallbackMezzanineInterior from '../assets/images/mezzanine_interior_1789381782369.jpg';

interface AdPosterProps {
  data: PropertyData;
  theme: ColorTheme;
  photoLayout: PhotoLayout;
  photos?: PropertyPhotos;
  scale?: number;
  showGuides?: boolean;
  onPhotoUpload?: (type: 'heroExterior' | 'mezzanineInterior', file: File) => void;
  isInteractive?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck,
  Landmark,
  Train,
  Car,
  Fingerprint,
  Wind,
};

export const AdPoster = forwardRef<HTMLDivElement, AdPosterProps>(
  ({ data, theme, photoLayout, photos, scale = 1, showGuides = false, onPhotoUpload, isInteractive = false }, ref) => {
    // Primary real photos uploaded by user with graceful fallback
    const [exteriorSrc, setExteriorSrc] = useState<string>(
      photos?.heroExterior || '/20260905_131958.jpg'
    );
    const [mezzanineSrc, setMezzanineSrc] = useState<string>(
      photos?.mezzanineInterior || '/20260905_130239.jpg'
    );

    const exteriorInputRef = useRef<HTMLInputElement>(null);
    const mezzanineInputRef = useRef<HTMLInputElement>(null);

    // Update if parent passes updated photo URLs
    React.useEffect(() => {
      if (photos?.heroExterior) setExteriorSrc(photos.heroExterior);
    }, [photos?.heroExterior]);

    React.useEffect(() => {
      if (photos?.mezzanineInterior) setMezzanineSrc(photos.mezzanineInterior);
    }, [photos?.mezzanineInterior]);

    const handleDrop = (e: React.DragEvent, type: 'heroExterior' | 'mezzanineInterior') => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const file = e.dataTransfer.files?.[0];
        if (file && onPhotoUpload) {
          onPhotoUpload(type, file);
        }
      } catch (err) {
        console.error('Drop upload error:', err);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    return (
      <div
        ref={ref}
        id="property-ad-poster-canvas"
        className={`relative w-full aspect-[4/5] select-none overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 bg-gradient-to-b ${theme.bgGradient} ${theme.textPrimary}`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
      >
        {/* Hidden File Inputs for Interactive Mode (Always available in all layouts) */}
        {isInteractive && onPhotoUpload && (
          <>
            <input
              ref={exteriorInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPhotoUpload('heroExterior', file);
                e.target.value = '';
              }}
            />
            <input
              ref={mezzanineInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPhotoUpload('mezzanineInterior', file);
                e.target.value = '';
              }}
            />
          </>
        )}

        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 pattern-islamic-subtle pointer-events-none opacity-40" />

        {/* Framing border */}
        <div className="absolute inset-2 sm:inset-3 rounded-xl border pointer-events-none border-amber-900/10 z-20" />

        {/* Safe Guide Lines (Only visible when toggled) */}
        {showGuides && (
          <div className="absolute inset-0 z-30 pointer-events-none border-2 border-dashed border-rose-500/50 m-6 flex flex-col justify-between">
            <div className="text-[10px] bg-rose-500 text-white px-2 py-0.5 w-fit rounded-br">
              Safe Zone (Feed Crop 1:1 Safety)
            </div>
            <div className="text-[10px] bg-rose-500 text-white px-2 py-0.5 w-fit self-end rounded-tl">
              Portrait 4:5 (1080 x 1350)
            </div>
          </div>
        )}

        {/* Main Flex Column Container */}
        <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-5 md:p-6 text-inherit">
          
          {/* ================= HEADER SECTION ================= */}
          <header className="flex flex-col items-center text-center pt-1 sm:pt-2">
            
            {/* Subtle Islamic Motif Top Accent */}
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <span className="h-[1px] w-6 sm:w-10 bg-amber-700/30" />
              <div className="flex items-center gap-1 text-[#9A7338]">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-amber-800 dark:text-amber-300">
                  Cluster Islami Depok
                </span>
                <Sparkles className="w-3 h-3 text-amber-600" />
              </div>
              <span className="h-[1px] w-6 sm:w-10 bg-amber-700/30" />
            </div>

            {/* Main Headline: RUMAH DIKONTRAKKAN */}
            <div className="relative inline-block mb-1">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-[34px] leading-tight tracking-wider uppercase text-neutral-900 dark:text-white drop-shadow-sm">
                {data.title}
              </h1>
              <div className="h-1 w-24 sm:w-32 mx-auto mt-1 rounded-full bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-80" />
            </div>

            {/* Location Tag & Price Badge */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-0.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm font-medium tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{data.location}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 dark:bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-600/30 text-xs sm:text-sm font-extrabold tracking-wide shadow-sm">
                <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{data.price} <span className="font-semibold text-[11px] opacity-80">{data.pricePeriod}</span></span>
              </div>
            </div>
          </header>

          {/* ================= VISUAL SHOWCASE (CLEAN REAL PHOTOS) ================= */}
          <div className="my-2 sm:my-3 relative flex-1 min-h-[170px] sm:min-h-[220px] max-h-[300px] flex flex-col justify-center">
            
            {/* Layout 1: Hybrid Inset (Hero Real Exterior + Clean Inset Real Mezzanine) */}
            {photoLayout === 'hybrid-inset' && (
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md border border-neutral-200/80 dark:border-neutral-700/80 group bg-neutral-100 dark:bg-neutral-800">
                {/* Clean Hero Image - Real Photo Without Murky Dark Gradient */}
                <img
                  src={exteriorSrc}
                  onError={() => setExteriorSrc(fallbackHouseExterior)}
                  alt="Foto Asli Tampak Depan Rumah Kontrakan Depok"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />

                {/* Interactive upload overlay for Hero Image */}
                {isInteractive && onPhotoUpload && (
                  <div
                    onDrop={(e) => handleDrop(e, 'heroExterior')}
                    onDragOver={handleDragOver}
                    onClick={() => exteriorInputRef.current?.click()}
                    className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity cursor-pointer z-20 text-white"
                    title="Klik atau Drag & Drop untuk mengganti foto tampak depan asli"
                  >
                    <div className="bg-amber-500 text-neutral-950 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-lg">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Ganti Foto Asli Tampak Depan</span>
                    </div>
                    <span className="text-[10px] text-neutral-200 bg-black/60 px-2 py-0.5 rounded">
                      Klik atau Drag & Drop foto asli ke sini
                    </span>
                  </div>
                )}

                {/* Inset Real Mezzanine Interior Card */}
                <div className="absolute bottom-2.5 right-2.5 w-32 sm:w-44 aspect-[4/3] rounded-lg overflow-hidden border-2 border-white shadow-xl z-20 bg-neutral-900 group/inset">
                  <img
                    src={mezzanineSrc}
                    onError={() => setMezzanineSrc(fallbackMezzanineInterior)}
                    alt="Foto Asli Area Mezanine 1/2 Lantai"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Interactive upload overlay for Mezzanine Inset */}
                  {isInteractive && onPhotoUpload && (
                    <div
                      onDrop={(e) => handleDrop(e, 'mezzanineInterior')}
                      onDragOver={handleDragOver}
                      onClick={(e) => {
                        e.stopPropagation();
                        mezzanineInputRef.current?.click();
                      }}
                      className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover/inset:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer z-30 text-white"
                      title="Klik untuk mengganti foto mezanine asli"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[9px] font-bold text-amber-300">Ganti Foto Mezanine</span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-neutral-900/85 py-1 px-1.5 text-center border-t border-white/10">
                    <p className="text-[9px] sm:text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Area Mezanine
                    </p>
                  </div>
                </div>

                {/* Subtle Clean Badge on Top Right */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <div className="bg-neutral-900/85 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-[2px]">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mezanine 1/2 Lantai</span>
                  </div>
                </div>
              </div>
            )}

            {/* Layout 2: Split Dual (Exterior & Mezzanine Side-by-Side) */}
            {photoLayout === 'split-dual' && (
              <div className="grid grid-cols-2 gap-2 h-full rounded-xl overflow-hidden">
                <div className="relative h-full rounded-lg overflow-hidden border border-neutral-200/80 dark:border-neutral-700/80 shadow-md bg-neutral-100 dark:bg-neutral-800 group">
                  <img
                    src={exteriorSrc}
                    onError={() => setExteriorSrc(fallbackHouseExterior)}
                    alt="Foto Asli Fasad Rumah"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isInteractive && onPhotoUpload && (
                    <div
                      onDrop={(e) => handleDrop(e, 'heroExterior')}
                      onDragOver={handleDragOver}
                      onClick={() => exteriorInputRef.current?.click()}
                      className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer z-20 text-white"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-bold">Ganti Tampak Depan</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-[10px] sm:text-xs font-bold text-white bg-neutral-900/85 px-2 py-0.5 rounded shadow">
                      Tampak Depan
                    </span>
                  </div>
                </div>

                <div className="relative h-full rounded-lg overflow-hidden border border-neutral-200/80 dark:border-neutral-700/80 shadow-md bg-neutral-100 dark:bg-neutral-800 group">
                  <img
                    src={mezzanineSrc}
                    onError={() => setMezzanineSrc(fallbackMezzanineInterior)}
                    alt="Foto Asli Area Mezanine"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isInteractive && onPhotoUpload && (
                    <div
                      onDrop={(e) => handleDrop(e, 'mezzanineInterior')}
                      onDragOver={handleDragOver}
                      onClick={() => mezzanineInputRef.current?.click()}
                      className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer z-20 text-white"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-bold">Ganti Area Mezanine</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-[10px] sm:text-xs font-bold text-amber-300 bg-neutral-900/85 px-2 py-0.5 rounded shadow">
                      Area Mezanine
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Layout 3: Hero Exterior Focused */}
            {photoLayout === 'hero-exterior' && (
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md border border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-100 dark:bg-neutral-800 group">
                <img
                  src={exteriorSrc}
                  onError={() => setExteriorSrc(fallbackHouseExterior)}
                  alt="Foto Asli Rumah Kontrakan Depok"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                {isInteractive && onPhotoUpload && (
                  <div
                    onDrop={(e) => handleDrop(e, 'heroExterior')}
                    onDragOver={handleDragOver}
                    onClick={() => exteriorInputRef.current?.click()}
                    className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity cursor-pointer z-20 text-white"
                  >
                    <div className="bg-amber-500 text-neutral-950 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-lg">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Ganti Foto Asli Tampak Depan</span>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2.5 right-2.5 z-10">
                  <div className="bg-neutral-900/85 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-[2px]">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mezanine 1/2 Lantai • LT 88 m²</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= SELLING POINTS PILLS (Under Visual) ================= */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 my-1 sm:my-1.5">
            <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl bg-white/80 dark:bg-white/5 border border-amber-900/10 dark:border-white/10 shadow-sm">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider leading-none mb-0.5">
                  Konsep
                </p>
                <p className="text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate leading-tight">
                  {data.mezzanine}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl bg-white/80 dark:bg-white/5 border border-amber-900/10 dark:border-white/10 shadow-sm">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider leading-none mb-0.5">
                  Luas Tanah
                </p>
                <p className="text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate leading-tight">
                  {data.landArea}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 shadow-sm">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] text-amber-800 dark:text-amber-400 font-medium uppercase tracking-wider leading-none mb-0.5">
                  Harga Sewa
                </p>
                <p className="text-[11px] sm:text-xs font-extrabold text-amber-900 dark:text-amber-300 truncate leading-tight">
                  {data.price}
                </p>
              </div>
            </div>
          </div>

          {/* ================= KENAPA PILIH RUMAH INI? SECTION ================= */}
          <section className="my-1.5 sm:my-2">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 sm:h-4 bg-amber-600 rounded-full" />
                <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-800 dark:text-neutral-200">
                  KENAPA PILIH RUMAH INI?
                </h2>
              </div>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium italic">
                Depok Property Highlight
              </span>
            </div>

            {/* 6 Key Points in 2-column Grid */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {data.highlights.map((item) => {
                const IconComponent = ICON_MAP[item.icon] || CheckCircle2;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 shadow-sm hover:border-amber-500/40 transition-colors"
                  >
                    <div className="w-4 h-4 rounded-full bg-amber-600/15 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ================= CALL TO ACTION SECTION ================= */}
          <footer className="mt-1 sm:mt-1.5 pt-2 border-t border-amber-900/10 dark:border-white/10 flex flex-col items-center text-center gap-1.5">
            {/* Tagline / Hook */}
            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-neutral-700 dark:text-neutral-300 italic tracking-wide">
              "{data.ctaTitle}"
            </p>

            {/* Main CTA & Contact Banner */}
            <div className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 dark:from-amber-600 dark:via-amber-500 dark:to-amber-600 text-white shadow-lg flex items-center justify-between gap-2 border border-amber-500/30">
              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 dark:bg-black/20 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 dark:text-neutral-950 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] sm:text-[10px] uppercase font-semibold text-amber-300 dark:text-neutral-900 tracking-wider">
                      {data.ctaButton}
                    </p>
                    <span className="text-[9px] font-bold text-emerald-400 dark:text-neutral-950">
                      • {data.priceFull}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-extrabold tracking-wider text-white dark:text-neutral-950 font-mono">
                    Hubungi: {data.contactNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-amber-500 text-neutral-950 dark:bg-neutral-950 dark:text-amber-300 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm shrink-0">
                <span>Survey</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </footer>

        </div>
      </div>
    );
  }
);

AdPoster.displayName = 'AdPoster';
