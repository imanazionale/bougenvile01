import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Film,
  Camera,
  Layers,
  Upload,
  Maximize2,
  Trash2,
  Plus,
  Sparkles,
} from 'lucide-react';
import { MediaItem } from '../types';

interface PropertyGallerySectionProps {
  mediaList: MediaItem[];
  onOpenLightbox: (index: number) => void;
  onAddMediaFiles?: (files: FileList) => void;
  onRemoveMedia?: (id: string) => void;
  onUploadClusterPhoto?: (file: File) => void;
}

export const PropertyGallerySection: React.FC<PropertyGallerySectionProps> = ({
  mediaList,
  onOpenLightbox,
  onAddMediaFiles,
  onRemoveMedia,
  onUploadClusterPhoto,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clusterInputRef = useRef<HTMLInputElement>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const hasClusterPhoto = mediaList.some((m) => m.category === 'cluster' || m.id === 'media-3-cluster');

  // Filter media based on tab
  const filteredList = mediaList.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'photos') return item.type === 'photo';
    if (activeFilter === 'videos') return item.type === 'video';
    return item.category === activeFilter;
  });

  // Smooth scroll buttons
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="mt-10 sm:mt-12 pt-8 border-t border-neutral-800/80">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
              Koleksi Media Asli
            </span>
            <span className="text-xs font-mono font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md">
              Total {mediaList.length} Media
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>GALERI RUMAH</span>
            <span className="text-xs text-neutral-400 font-normal hidden md:inline">
              (Tampak Depan, Mezanine, Ruangan & Video Walkthrough)
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Jelajahi dokumentasi nyata hunian tanpa manipulasi AI. Klik thumbnail untuk membuka pratinjau resolusi penuh atau memutar video walkthrough.
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onAddMediaFiles && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onAddMediaFiles(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition shadow-sm cursor-pointer"
                title="Unggah foto atau video baru dari perangkat Anda"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Foto/Video</span>
              </button>
            </>
          )}

          {/* Carousel Left / Right Scroll Buttons */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
              title="Geser ke Kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
              title="Geser ke Kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
            activeFilter === 'all'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          Semua ({mediaList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('photos')}
          className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'photos'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Foto ({mediaList.filter((m) => m.type === 'photo').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('videos')}
          className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'videos'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Video ({mediaList.filter((m) => m.type === 'video').length})</span>
        </button>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth focus:outline-none"
        style={{ scrollbarWidth: 'thin' }}
      >
        {filteredList.map((item, index) => {
          const originalIndex = mediaList.findIndex((m) => m.id === item.id);
          return (
            <div
              key={item.id}
              className="snap-start shrink-0 w-[260px] sm:w-[300px] md:w-[320px] rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 transition-all duration-200 overflow-hidden shadow-xl flex flex-col group relative"
            >
              {/* Media Card Thumbnail Container */}
              <div
                onClick={() => onOpenLightbox(originalIndex)}
                className="relative aspect-[4/3] w-full bg-neutral-950 overflow-hidden cursor-pointer"
              >
                {item.type === 'photo' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full relative bg-neutral-950 flex items-center justify-center">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover opacity-80"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-neutral-950/40 flex items-center justify-center group-hover:bg-neutral-950/20 transition-all">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Badge: Sequence & Category */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                  <span className="text-[10px] font-bold bg-neutral-950/85 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md backdrop-blur-sm shadow">
                    {item.badge}
                  </span>
                  {item.type === 'video' && (
                    <span className="text-[10px] font-bold bg-rose-600/90 text-white px-1.5 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-sm shadow">
                      <Film className="w-3 h-3" />
                      <span>Video</span>
                    </span>
                  )}
                </div>

                {/* Top Right: Expand Hint Icon */}
                <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-7 h-7 rounded-lg bg-black/75 text-white flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bottom Index Indicator Badge (e.g. 1 / 8) */}
                <div className="absolute bottom-2 right-2 z-10">
                  <span className="text-[10px] font-mono font-bold bg-neutral-950/90 text-neutral-300 border border-white/10 px-2 py-0.5 rounded shadow">
                    {originalIndex + 1} / {mediaList.length}
                  </span>
                </div>
              </div>

              {/* Card Meta & Details */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4
                    onClick={() => onOpenLightbox(originalIndex)}
                    className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Card Footer: Action button */}
                <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onOpenLightbox(originalIndex)}
                    className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>{item.type === 'video' ? 'Putar Video' : 'Lihat Ukuran Penuh'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  {item.isUploadedByUser && onRemoveMedia && (
                    <button
                      type="button"
                      onClick={() => onRemoveMedia(item.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                      title="Hapus media ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Placeholder Upload Card for Cluster Street if not yet uploaded */}
        {!hasClusterPhoto && activeFilter !== 'videos' && onUploadClusterPhoto && (
          <div className="snap-start shrink-0 w-[260px] sm:w-[300px] md:w-[320px] rounded-2xl bg-neutral-900/60 border-2 border-dashed border-amber-500/40 hover:border-amber-400 transition-all duration-200 overflow-hidden shadow-xl flex flex-col justify-between p-4 group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md">
                  4. Jalanan Cluster
                </span>
                <span className="text-[10px] text-neutral-400 font-medium bg-neutral-800 px-2 py-0.5 rounded">
                  Belum Diunggah
                </span>
              </div>

              <div className="aspect-[4/3] rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  Foto Kondisi Jalan Cluster
                </h4>
                <p className="text-[11px] text-neutral-400 leading-tight line-clamp-3">
                  File foto jalan cluster belum sampai ke sistem aplikasi. Klik tombol di bawah untuk memilih file dari galeri/folder Anda.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800">
              <input
                ref={clusterInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUploadClusterPhoto(file);
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => clusterInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-md cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih Foto Jalan Cluster</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
