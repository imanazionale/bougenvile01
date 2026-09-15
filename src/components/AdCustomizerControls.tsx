import React from 'react';
import {
  Download,
  Eye,
  Copy,
  Layout,
  Palette,
  Layers,
  Columns2,
  Image as ImageIcon,
  HelpCircle,
  Grid,
  CheckCircle,
  Camera,
  Upload,
  RotateCcw,
  Tag,
} from 'lucide-react';
import { ColorThemeId, PhotoLayout, PropertyPhotos } from '../types';
import { COLOR_THEMES } from '../data';

interface AdCustomizerControlsProps {
  currentThemeId: ColorThemeId;
  onThemeChange: (id: ColorThemeId) => void;
  photoLayout: PhotoLayout;
  onLayoutChange: (layout: PhotoLayout) => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  onExportPng: () => void;
  isExporting: boolean;
  onOpenPreview: () => void;
  onOpenCaption: () => void;
  photos: PropertyPhotos;
  onPhotoUpload: (
    type: 'heroExterior' | 'mezzanineInterior' | 'clusterStreet',
    file: File
  ) => void;
  onResetPhotos: () => void;
  priceFull?: string;
}

export const AdCustomizerControls: React.FC<AdCustomizerControlsProps> = ({
  currentThemeId,
  onThemeChange,
  photoLayout,
  onLayoutChange,
  showGuides,
  onToggleGuides,
  onExportPng,
  isExporting,
  onOpenPreview,
  onOpenCaption,
  photos,
  onPhotoUpload,
  onResetPhotos,
  priceFull = 'Rp 2,3 Juta / bulan',
}) => {
  return (
    <div className="space-y-4">
      {/* Top Primary Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExportPng}
          disabled={isExporting}
          className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-950/20 hover:shadow-amber-900/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
          <span>{isExporting ? 'Memproses HD PNG...' : 'Unduh Desain (HD PNG 4:5)'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenPreview}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold text-xs sm:text-sm border border-neutral-700 transition"
        >
          <Eye className="w-4 h-4 text-amber-400" />
          <span>Simulasi Feed</span>
        </button>

        <button
          type="button"
          onClick={onOpenCaption}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold text-xs sm:text-sm border border-neutral-700 transition"
        >
          <Copy className="w-4 h-4 text-emerald-400" />
          <span>Salin Teks Iklan</span>
        </button>
      </div>

      {/* Control Box: Theme, Photos, and Layout selection */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
        
        {/* Real Photo Status & Management */}
        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200 uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Foto Asli Rumah (Tanpa Efek AI)</span>
            </div>
            <button
              type="button"
              onClick={onResetPhotos}
              className="text-[11px] text-neutral-400 hover:text-amber-300 transition flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800"
              title="Kembalikan foto asli bawaan"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Tampak Depan Hero */}
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white">Tampak Depan</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 rounded font-medium">Hero Utama</span>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800">
                <img
                  src={photos.heroExterior}
                  alt="Tampak Depan"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold cursor-pointer transition text-center">
                <Upload className="w-3 h-3 shrink-0" />
                <span>Pilih Foto Fasad</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPhotoUpload('heroExterior', f);
                  }}
                />
              </label>
              <span className="text-[10px] text-neutral-400 text-center truncate">Fasad & Bangunan Asli</span>
            </div>

            {/* Mezzanine Interior Inset */}
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white">Area Mezanine</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded font-medium">1/2 Lantai</span>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800">
                <img
                  src={photos.mezzanineInterior}
                  alt="Area Mezanine"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold cursor-pointer transition text-center">
                <Upload className="w-3 h-3 shrink-0" />
                <span>Pilih Foto Mezanine</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPhotoUpload('mezzanineInterior', f);
                  }}
                />
              </label>
              <span className="text-[10px] text-neutral-400 text-center truncate">Tangga & Mezanine</span>
            </div>

            {/* Jalanan Cluster */}
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white">Jalan Cluster</span>
                {photos.clusterStreet ? (
                  <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1 rounded font-medium">Tersedia</span>
                ) : (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded font-medium">Perlu Diupload</span>
                )}
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                {photos.clusterStreet ? (
                  <img
                    src={photos.clusterStreet}
                    alt="Kondisi Jalanan Cluster"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <Camera className="w-5 h-5 text-neutral-500 mb-1" />
                    <span className="text-[10px] text-neutral-400">Belum ada file</span>
                  </div>
                )}
              </div>
              <label className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold cursor-pointer transition text-center">
                <Upload className="w-3 h-3 shrink-0" />
                <span>{photos.clusterStreet ? 'Ganti Foto Jalan' : 'Pilih Foto Jalan'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPhotoUpload('clusterStreet', f);
                  }}
                />
              </label>
              <span className="text-[10px] text-neutral-400 text-center truncate">Lingkungan Jalan Cluster</span>
            </div>
          </div>
        </div>

        {/* Color Theme Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Pilihan Palet Warna Elegan</span>
            </label>
            <span className="text-[11px] text-neutral-500">Nuansa hangat & premium</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.values(COLOR_THEMES).map((theme) => {
              const isActive = currentThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onThemeChange(theme.id as ColorThemeId)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/80 text-white shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border border-white/20 shrink-0 ${
                      theme.id === 'warm-sand'
                        ? 'bg-[#EFEAE1]'
                        : theme.id === 'pearl-white'
                        ? 'bg-[#FAF8F5]'
                        : theme.id === 'serene-sage'
                        ? 'bg-[#DFE9E1]'
                        : 'bg-[#1F2024]'
                    }`}
                  />
                  <div className="truncate text-xs font-semibold">
                    {theme.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo Layout Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-amber-400" />
              <span>Komposisi Visual Rumah</span>
            </label>
            <span className="text-[11px] text-neutral-500">Menonjolkan Mezanine & Fasad</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onLayoutChange('hybrid-inset')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                photoLayout === 'hybrid-inset'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="text-[11px]">Fasad + Inset Mezanine</span>
            </button>

            <button
              type="button"
              onClick={() => onLayoutChange('split-dual')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                photoLayout === 'split-dual'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Columns2 className="w-4 h-4" />
              <span className="text-[11px]">Split Dual Kolom</span>
            </button>

            <button
              type="button"
              onClick={() => onLayoutChange('hero-exterior')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                photoLayout === 'hero-exterior'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-[11px]">Hero Utama Eksterior</span>
            </button>
          </div>
        </div>

        {/* Toggles & Verification Checklist */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onToggleGuides}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
              showGuides
                ? 'bg-rose-500/10 border-rose-500 text-rose-300'
                : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Garis Panduan Feed (Safe Zone)</span>
          </button>

          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Format Rasio 4:5 (1080×1350)
          </span>
        </div>

      </div>

      {/* Property Information Verification Card (Strict Compliance Note) */}
      <div className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800/70 text-xs text-neutral-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Kepatuhan Data & Informasi Resmi:</span>
          </div>
          <span className="text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[11px]">
            {priceFull}
          </span>
        </div>
        <p className="leading-relaxed text-[11px] text-neutral-400">
          Semua detail mengacu persis pada informasi yang Anda berikan: <strong>Mezanine 1/2 lantai</strong>, <strong>LT 88 m²</strong>, <strong>Sewa: {priceFull}</strong> di <strong>Taman Jaya, Cipayung – Depok</strong> dengan 6 poin keunggulan cluster & fasilitas. Menggunakan foto rumah asli Anda tanpa modifikasi AI.
        </p>
      </div>
    </div>
  );
};
