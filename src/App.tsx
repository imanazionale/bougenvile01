import React, { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import {
  Download,
  Share2,
  Eye,
  Copy,
  Sparkles,
  Building,
  CheckCircle,
  Home,
  FileText,
  Sliders,
  Maximize,
  Tag,
  Camera,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';
import { ColorThemeId, PhotoLayout, PropertyPhotos, MediaItem } from './types';
import { PROPERTY_DATA, COLOR_THEMES, DEFAULT_MEDIA_ITEMS } from './data';
import { AdPoster } from './components/AdPoster';
import { AdCustomizerControls } from './components/AdCustomizerControls';
import { SocialPreviewModal } from './components/SocialPreviewModal';
import { CopyCaptionModal } from './components/CopyCaptionModal';
import { PropertyGallerySection } from './components/PropertyGallerySection';
import { MediaLightbox } from './components/MediaLightbox';
import { safeStorage, compressImageFile, readMediaFile } from './lib/storage';

export default function App() {
  const [currentThemeId, setCurrentThemeId] = useState<ColorThemeId>('warm-sand');
  const [photoLayout, setPhotoLayout] = useState<PhotoLayout>('hybrid-inset');
  const [showGuides, setShowGuides] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCaptionOpen, setIsCaptionOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Gallery state & Lightbox modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Show auto-dismissing toast notifications
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  // Real photos state with safe local persistence
  const [photos, setPhotos] = useState<PropertyPhotos>(() => {
    const savedHero = safeStorage.get('ad_hero_photo');
    const savedMez = safeStorage.get('ad_mezzanine_photo');
    const savedCluster = safeStorage.get('ad_cluster_photo');
    return {
      heroExterior: savedHero || '/20260905_131958.jpg',
      mezzanineInterior: savedMez || '/20260905_130239.jpg',
      clusterStreet: savedCluster || undefined,
    };
  });

  // Media list state initialized with default uploaded property media
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const savedMediaJson = safeStorage.get('property_extra_media_v1');
    const baseItems: MediaItem[] = [
      {
        id: 'media-1-exterior',
        type: 'photo',
        url: photos.heroExterior,
        title: 'Tampak Depan Rumah & Carport',
        category: 'exterior',
        badge: '1. Tampak Depan',
        description: 'Fasad rumah minimalis modern di cluster islami asri, dilengkapi carport dan smart door lock.',
      },
      {
        id: 'media-2-mezzanine',
        type: 'photo',
        url: photos.mezzanineInterior,
        title: 'Area Mezanine 1/2 Lantai & Tangga',
        category: 'mezzanine',
        badge: '2. Area Mezanine',
        description: 'Konsep mezanine fungsional 1/2 lantai untuk ruang kerja/santai/kamar ekstra dengan sirkulasi udara optimal.',
      },
    ];

    if (photos.clusterStreet) {
      baseItems.push({
        id: 'media-3-cluster',
        type: 'photo',
        url: photos.clusterStreet,
        title: 'Lingkungan & Jalanan Cluster Asri',
        category: 'cluster',
        badge: '4. Jalanan Cluster',
        description: 'Suasana lingkungan jalan cluster yang tenang, aman, bersih, dan asri.',
      });
    }

    if (savedMediaJson) {
      try {
        const extraItems = JSON.parse(savedMediaJson) as MediaItem[];
        return [...baseItems, ...extraItems];
      } catch (e) {
        console.warn('Error parsing extra media:', e);
      }
    }

    return baseItems;
  });

  // Synchronize base media items if photos are updated
  const syncMediaWithPhotos = (newHero?: string, newMez?: string, newCluster?: string) => {
    setMediaItems((prev) => {
      let updated = prev.map((item) => {
        if (item.id === 'media-1-exterior' && newHero) return { ...item, url: newHero };
        if (item.id === 'media-2-mezzanine' && newMez) return { ...item, url: newMez };
        if (item.id === 'media-3-cluster' && newCluster) return { ...item, url: newCluster };
        return item;
      });

      if (newCluster && !updated.some((m) => m.id === 'media-3-cluster')) {
        updated = [
          ...updated.slice(0, 2),
          {
            id: 'media-3-cluster',
            type: 'photo',
            url: newCluster,
            title: 'Lingkungan & Jalanan Cluster Asri',
            category: 'cluster',
            badge: '4. Jalanan Cluster',
            description: 'Suasana lingkungan jalan cluster yang tenang, aman, bersih, dan asri.',
          },
          ...updated.slice(2),
        ];
      }
      return updated;
    });
  };

  const handlePhotoUpload = async (
    type: 'heroExterior' | 'mezzanineInterior' | 'clusterStreet',
    file: File
  ) => {
    try {
      const dataUrl = await compressImageFile(file);
      setPhotos((prev) => ({ ...prev, [type]: dataUrl }));

      // Safely persist without blocking or quota crashes
      if (type === 'heroExterior') {
        safeStorage.set('ad_hero_photo', dataUrl);
        syncMediaWithPhotos(dataUrl, undefined, undefined);
      } else if (type === 'mezzanineInterior') {
        safeStorage.set('ad_mezzanine_photo', dataUrl);
        syncMediaWithPhotos(undefined, dataUrl, undefined);
      } else if (type === 'clusterStreet') {
        safeStorage.set('ad_cluster_photo', dataUrl);
        syncMediaWithPhotos(undefined, undefined, dataUrl);
      }

      const label =
        type === 'heroExterior'
          ? 'tampak depan'
          : type === 'mezzanineInterior'
          ? 'area mezanine'
          : 'kondisi jalanan cluster';

      showToast('success', `Foto ${label} berhasil dipasang!`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memproses file foto';
      console.error('Photo upload failed:', err);
      showToast('error', errorMsg);
    }
  };

  const handleResetPhotos = () => {
    safeStorage.remove('ad_hero_photo');
    safeStorage.remove('ad_mezzanine_photo');
    safeStorage.remove('ad_cluster_photo');
    setPhotos({
      heroExterior: '/20260905_131958.jpg',
      mezzanineInterior: '/20260905_130239.jpg',
      clusterStreet: undefined,
    });
    setMediaItems((prev) =>
      prev
        .filter((m) => m.id !== 'media-3-cluster')
        .map((item) => {
          if (item.id === 'media-1-exterior') return { ...item, url: '/20260905_131958.jpg' };
          if (item.id === 'media-2-mezzanine') return { ...item, url: '/20260905_130239.jpg' };
          return item;
        })
    );
    showToast('success', 'Foto telah dikembalikan ke foto asli bawaan.');
  };

  // Upload additional media (photos and videos) into gallery
  const handleAddMediaFiles = async (fileList: FileList) => {
    const newItems: MediaItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) continue;

      try {
        let url = '';
        if (isImage) {
          url = await compressImageFile(file);
        } else {
          url = await readMediaFile(file);
        }

        const count = mediaItems.length + newItems.length + 1;
        let badge = `${count}. Tambahan`;
        let category: MediaItem['category'] = 'interior';

        if (isVideo) {
          badge = `${count}. Walkthrough Video`;
          category = 'walkthrough';
        } else if (file.name.toLowerCase().includes('cluster') || file.name.toLowerCase().includes('masjid')) {
          badge = `${count}. Lingkungan Cluster`;
          category = 'cluster';
        } else if (file.name.toLowerCase().includes('fasilitas') || file.name.toLowerCase().includes('smart')) {
          badge = `${count}. Fasilitas`;
          category = 'facility';
        } else {
          badge = `${count}. Foto Interior`;
          category = 'interior';
        }

        newItems.push({
          id: `user-media-${Date.now()}-${i}`,
          type: isVideo ? 'video' : 'photo',
          url,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          category,
          badge,
          description: isVideo
            ? 'Video walkthrough rekaman asli hunian cluster islami Cipayung Depok.'
            : 'Dokumentasi asli area properti tanpa editan AI.',
          isUploadedByUser: true,
        });
      } catch (err) {
        console.error('Error processing uploaded file:', file.name, err);
      }
    }

    if (newItems.length > 0) {
      setMediaItems((prev) => {
        const updated = [...prev, ...newItems];
        const userUploaded = updated.filter((m) => m.isUploadedByUser);
        try {
          safeStorage.set('property_extra_media_v1', JSON.stringify(userUploaded));
        } catch (e) {
          console.warn('Could not persist extra media:', e);
        }
        return updated;
      });

      showToast(
        'success',
        `${newItems.length} media baru berhasil ditambahkan ke Galeri Rumah!`
      );
    }
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      const userUploaded = updated.filter((m) => m.isUploadedByUser);
      safeStorage.set('property_extra_media_v1', JSON.stringify(userUploaded));
      return updated;
    });
    showToast('success', 'Media berhasil dihapus dari galeri.');
  };

  const posterRef = useRef<HTMLDivElement>(null);

  const currentTheme = COLOR_THEMES[currentThemeId] || COLOR_THEMES['warm-sand'];

  // High-Resolution 4:5 PNG Export
  const handleExportPng = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);

    try {
      // Temporarily hide safe zone guides before capture if on
      const previousGuides = showGuides;
      if (previousGuides) setShowGuides(false);

      // Wait a tick for render
      await new Promise((r) => setTimeout(r, 120));

      const dataUrl = await htmlToImage.toPng(posterRef.current, {
        quality: 0.95,
        pixelRatio: 2, // Sharp output while avoiding canvas size limits
        skipFonts: true, // Prevents cross-origin font cssRules SecurityError in iframes
        cacheBust: false,
      });

      const link = document.createElement('a');
      link.download = `iklan-rumah-dikontrakkan-depok-4x5-${currentThemeId}.png`;
      link.href = dataUrl;
      link.click();

      if (previousGuides) setShowGuides(true);
      showToast('success', 'Gambar HD 4:5 berhasil diunduh!');
    } catch (error) {
      console.error('Gagal mengunduh gambar:', error);
      showToast('error', 'Gagal memproses unduhan gambar. Silakan coba kembali.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1013] text-neutral-100 flex flex-col font-sans">
      
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-40 bg-[#121418]/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-amber-900/30">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Desain Promosi Rumah Kontrakan
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Depok
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Format Portrait 4:5 • Instagram Feed & Facebook Marketplace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 transition"
              title="Lihat simulasi postingan di Instagram & Facebook"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Simulasi Feed</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCaptionOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 transition"
              title="Buka teks iklan siap pakai"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Teks Iklan</span>
            </button>

            <button
              type="button"
              onClick={handleExportPng}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Unduh HD (PNG)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN WORKSPACE ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT / CENTER: POSTER PREVIEW CANVAS */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* Canvas Action Bar */}
            <div className="w-full max-w-[480px] sm:max-w-[500px] flex items-center justify-between mb-3 px-1 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-300">Ukuran Asli 4:5</span>
                <span className="text-[11px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">
                  1080 × 1350 px
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuides(!showGuides)}
                  className={`text-[11px] px-2 py-1 rounded transition ${
                    showGuides
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium'
                      : 'hover:text-neutral-200'
                  }`}
                >
                  {showGuides ? 'Sembunyikan Grid' : 'Tampilkan Grid Safe Zone'}
                </button>
              </div>
            </div>

            {/* Quick Photo Upload Helper Banner */}
            <div className="w-full max-w-[480px] sm:max-w-[500px] mb-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] leading-tight">
                  <strong className="text-amber-300">Pilih Foto Asli:</strong> Klik langsung pada gambar poster atau gunakan tombol di panel kanan untuk memasang foto asli rumah Anda.
                </span>
              </div>
            </div>

            {/* Poster Stage */}
            <div className="w-full max-w-[480px] sm:max-w-[500px] relative transition-transform">
              <AdPoster
                ref={posterRef}
                data={PROPERTY_DATA}
                theme={currentTheme}
                photoLayout={photoLayout}
                photos={photos}
                showGuides={showGuides}
                onPhotoUpload={handlePhotoUpload}
                isInteractive={true}
              />
            </div>

            {/* Micro details under poster */}
            <div className="w-full max-w-[480px] sm:max-w-[500px] mt-3 flex items-center justify-between text-[11px] text-neutral-500 px-2">
              <span>Format 4:5 (1080×1350 px) optimal untuk Feed & Marketplace</span>
              <span className="text-amber-400 font-semibold">{PROPERTY_DATA.priceFull}</span>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTROLS & INFORMATION OVERVIEW */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Controls Component */}
            <AdCustomizerControls
              currentThemeId={currentThemeId}
              onThemeChange={setCurrentThemeId}
              photoLayout={photoLayout}
              onLayoutChange={setPhotoLayout}
              showGuides={showGuides}
              onToggleGuides={() => setShowGuides(!showGuides)}
              onExportPng={handleExportPng}
              isExporting={isExporting}
              onOpenPreview={() => setIsPreviewOpen(true)}
              onOpenCaption={() => setIsCaptionOpen(true)}
              photos={photos}
              onPhotoUpload={handlePhotoUpload}
              onResetPhotos={handleResetPhotos}
              priceFull={PROPERTY_DATA.priceFull}
            />

            {/* Verified Property Overview Card */}
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Building className="w-4 h-4" />
                  <span className="text-white">Rincian Data Iklan Terverifikasi</span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  100% Sesuai Data
                </span>
              </div>

              {/* Verified Specs Grid including Price */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800 col-span-2 sm:col-span-1">
                  <span className="text-neutral-500 block mb-0.5">Headline</span>
                  <strong className="text-white text-xs">RUMAH DIKONTRAKKAN</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 col-span-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-medium block">Harga Sewa Kontrakan</span>
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <strong className="text-amber-300 text-sm font-extrabold">{PROPERTY_DATA.priceFull}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="text-neutral-500 block mb-0.5">Konsep Lantai</span>
                  <strong className="text-amber-300">{PROPERTY_DATA.mezzanine}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="text-neutral-500 block mb-0.5">Luas Tanah</span>
                  <strong className="text-emerald-400">{PROPERTY_DATA.landArea}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="text-neutral-500 block mb-0.5">Lokasi Properti</span>
                  <strong className="text-neutral-200">Taman Jaya, Depok</strong>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Poin Keunggulan (Kenapa Pilih Rumah Ini?):
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-neutral-300">
                  {PROPERTY_DATA.highlights.map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800/80 text-xs text-neutral-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500">Call to Action:</span>
                  <span className="text-amber-300 font-medium italic">"Hubungi Kami untuk Info & Survey"</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500">Kontak:</span>
                  <span className="text-white font-mono font-bold bg-neutral-800 px-2 py-0.5 rounded text-amber-300">
                    {PROPERTY_DATA.contactNumber}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ================= GALERI RUMAH (HORIZONTAL CAROUSEL) ================= */}
        <PropertyGallerySection
          mediaList={mediaItems}
          onOpenLightbox={(index) => {
            setLightboxIndex(index);
            setLightboxOpen(true);
          }}
          onAddMediaFiles={handleAddMediaFiles}
          onRemoveMedia={handleRemoveMedia}
          onUploadClusterPhoto={(file) => handlePhotoUpload('clusterStreet', file)}
        />

      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          {toast.type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-neutral-200 flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-neutral-500 hover:text-neutral-300 p-0.5 rounded transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ================= MODALS ================= */}
      <SocialPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={PROPERTY_DATA}
        theme={currentTheme}
        photoLayout={photoLayout}
        photos={photos}
      />

      <CopyCaptionModal
        isOpen={isCaptionOpen}
        onClose={() => setIsCaptionOpen(false)}
        data={PROPERTY_DATA}
      />

      {/* Media Lightbox Modal */}
      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        mediaList={mediaItems}
        currentIndex={lightboxIndex}
        onSelectIndex={setLightboxIndex}
      />

    </div>
  );
}
