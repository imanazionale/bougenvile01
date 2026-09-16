import React, { useRef } from 'react';
import {
  Download,
  Eye,
  Copy,
  Layout,
  Sun,
  Moon,
  Check,
  Layers,
  Columns2,
  Image as ImageIcon,
  HelpCircle,
  Grid,
  CheckCircle,
  Camera,
  Upload,
  RotateCcw,
  Edit3,
  Lock,
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
  isAdmin?: boolean;
  onRequestAdminLogin?: (reason?: string) => void;
  onOpenEditProperty?: () => void;
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
  isAdmin = false,
  onRequestAdminLogin,
  onOpenEditProperty,
}) => {
  const exteriorInputRef = useRef<HTMLInputElement>(null);
  const mezzanineInputRef = useRef<HTMLInputElement>(null);
  const clusterInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerUpload = (type: 'exterior' | 'mezzanine' | 'cluster') => {
    if (!isAdmin) {
      if (onRequestAdminLogin) {
        onRequestAdminLogin('Silakan login sebagai Admin terlebih dahulu untuk mengunggah foto properti.');
      }
      return;
    }

    if (type === 'exterior') exteriorInputRef.current?.click();
    else if (type === 'mezzanine') mezzanineInputRef.current?.click();
    else if (type === 'cluster') clusterInputRef.current?.click();
  };

  const handleEditPropertyClick = () => {
    if (!isAdmin) {
      if (onRequestAdminLogin) {
        onRequestAdminLogin('Silakan login sebagai Admin terlebih dahulu untuk mengedit informasi properti.');
      }
      return;
    }
    if (onOpenEditProperty) onOpenEditProperty();
  };

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
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 shadow-xs dark:shadow-none transition cursor-pointer"
        >
          <Eye className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>Simulasi Feed</span>
        </button>

        <button
          type="button"
          onClick={onOpenCaption}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 shadow-xs dark:shadow-none transition cursor-pointer"
        >
          <Copy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Salin Teks Iklan</span>
        </button>
      </div>

      {/* Control Box: Theme, Photos, and Layout selection */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none space-y-4">
        
        {/* Real Photo Status & Management */}
        <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Foto Asli Rumah (Tersimpan di Supabase Storage)</span>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={onResetPhotos}
                className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-300 transition flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 cursor-pointer shadow-xs"
                title="Kembalikan foto asli bawaan"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Hidden inputs - Only rendered when admin */}
          {isAdmin && (
            <>
              <input
                ref={exteriorInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPhotoUpload('heroExterior', f);
                  e.target.value = '';
                }}
              />
              <input
                ref={mezzanineInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPhotoUpload('mezzanineInterior', f);
                  e.target.value = '';
                }}
              />
              <input
                ref={clusterInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPhotoUpload('clusterStreet', f);
                  e.target.value = '';
                }}
              />
            </>
          )}

          {!isAdmin && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
              <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Hanya Admin terverifikasi yang dapat mengubah atau mengunggah foto properti.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Tampak Depan Hero */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-2 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-900 dark:text-white">Tampak Depan</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-1 rounded font-medium">Hero Utama</span>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                {photos.heroExterior ? (
                  <img
                    src={photos.heroExterior}
                    alt="Tampak Depan"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <Camera className="w-5 h-5 text-neutral-400 dark:text-neutral-500 mb-1" />
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Belum ada foto/video</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleTriggerUpload('exterior')}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition text-center border ${
                  isAdmin
                    ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/30'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                }`}
              >
                {!isAdmin ? <Lock className="w-3 h-3 shrink-0" /> : <Upload className="w-3 h-3 shrink-0" />}
                <span>{isAdmin ? (photos.heroExterior ? 'Ganti Foto Fasad' : 'Pilih Foto Fasad') : 'Login Admin untuk Ubah'}</span>
              </button>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 text-center truncate">Fasad & Bangunan Asli</span>
            </div>

            {/* Mezzanine Interior Inset */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-2 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-900 dark:text-white">Area Mezanine</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1 rounded font-medium">1/2 Lantai</span>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                {photos.mezzanineInterior ? (
                  <img
                    src={photos.mezzanineInterior}
                    alt="Area Mezanine"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <Camera className="w-5 h-5 text-neutral-400 dark:text-neutral-500 mb-1" />
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Belum ada foto/video</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleTriggerUpload('mezzanine')}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition text-center border ${
                  isAdmin
                    ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/30'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                }`}
              >
                {!isAdmin ? <Lock className="w-3 h-3 shrink-0" /> : <Upload className="w-3 h-3 shrink-0" />}
                <span>{isAdmin ? (photos.mezzanineInterior ? 'Ganti Foto Mezanine' : 'Pilih Foto Mezanine') : 'Login Admin untuk Ubah'}</span>
              </button>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 text-center truncate">Tangga & Mezanine</span>
            </div>

            {/* Jalanan Cluster */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-2 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-900 dark:text-white">Jalan Cluster</span>
                {photos.clusterStreet ? (
                  <span className="text-[9px] bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 px-1 rounded font-medium">Tersedia</span>
                ) : (
                  <span className="text-[9px] bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1 rounded font-medium">Belum ada foto/video</span>
                )}
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                {photos.clusterStreet ? (
                  <img
                    src={photos.clusterStreet}
                    alt="Kondisi Jalanan Cluster"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <Camera className="w-5 h-5 text-neutral-400 dark:text-neutral-500 mb-1" />
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Belum ada foto/video</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleTriggerUpload('cluster')}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition text-center border ${
                  isAdmin
                    ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/30'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                }`}
              >
                {!isAdmin ? <Lock className="w-3 h-3 shrink-0" /> : <Upload className="w-3 h-3 shrink-0" />}
                <span>{isAdmin ? (photos.clusterStreet ? 'Ganti Foto Jalan' : 'Pilih Foto Jalan') : 'Login Admin untuk Ubah'}</span>
              </button>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 text-center truncate">Lingkungan Jalan Cluster</span>
            </div>
          </div>
        </div>

        {/* Global Theme Selector (Light Mode & Dark Mode) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Tema Global Website & Desain</span>
            </label>
            <span className="text-[11px] text-neutral-500">2 Pilihan Tampilan</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Light Mode Option */}
            <button
              type="button"
              onClick={() => onThemeChange('light')}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                currentThemeId === 'light'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-200 font-bold shadow-xs ring-1 ring-amber-500/30'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-900 dark:hover:text-white shadow-xs dark:shadow-none'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
                <Sun className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Light Mode</span>
                  {currentThemeId === 'light' && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                </div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                  Terang, bersih & hangat
                </div>
              </div>
            </button>

            {/* Dark Mode Option */}
            <button
              type="button"
              onClick={() => onThemeChange('dark')}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                currentThemeId === 'dark'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-200 font-bold shadow-xs ring-1 ring-amber-500/30'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-900 dark:hover:text-white shadow-xs dark:shadow-none'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
                <Moon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Dark Mode</span>
                  {currentThemeId === 'dark' && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                </div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                  Gelap, elegan & arsitektural
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Photo Layout Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Komposisi Visual Rumah</span>
            </label>
            <span className="text-[11px] text-neutral-500">Menonjolkan Mezanine & Fasad</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onLayoutChange('hybrid-inset')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                photoLayout === 'hybrid-inset'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                  : 'bg-white dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 shadow-xs dark:shadow-none'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="text-[11px]">Fasad + Inset Mezanine</span>
            </button>

            <button
              type="button"
              onClick={() => onLayoutChange('split-dual')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                photoLayout === 'split-dual'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                  : 'bg-white dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 shadow-xs dark:shadow-none'
              }`}
            >
              <Columns2 className="w-4 h-4" />
              <span className="text-[11px]">Split Dual Kolom</span>
            </button>

            <button
              type="button"
              onClick={() => onLayoutChange('hero-exterior')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                photoLayout === 'hero-exterior'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                  : 'bg-white dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 shadow-xs dark:shadow-none'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-[11px]">Hero Utama Eksterior</span>
            </button>
          </div>
        </div>

        {/* Toggles & Verification Checklist */}
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onToggleGuides}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              showGuides
                ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold'
                : 'bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 shadow-xs dark:shadow-none'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Garis Panduan Feed (Safe Zone)</span>
          </button>

          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            Format Rasio 4:5 (1080×1350)
          </span>
        </div>

      </div>

      {/* Property Information Verification Card with Edit Option */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800/70 text-xs text-neutral-600 dark:text-neutral-400 shadow-xs dark:shadow-none space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-300 font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Kepatuhan Data & Informasi Resmi:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-800 dark:text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[11px]">
              {priceFull}
            </span>
            <button
              type="button"
              onClick={handleEditPropertyClick}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-500/20 text-neutral-700 dark:text-neutral-300 hover:text-amber-700 dark:hover:text-amber-300 text-[11px] font-medium border border-neutral-300 dark:border-neutral-700 transition cursor-pointer"
              title="Edit Informasi Properti di Supabase"
            >
              {!isAdmin ? <Lock className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
              <span>Edit Info Properti</span>
            </button>
          </div>
        </div>
        <p className="leading-relaxed text-[11px] text-neutral-600 dark:text-neutral-400">
          Semua detail tersimpan di tabel <strong>properties</strong> & <strong>property_media</strong> Supabase: <strong>Mezanine 1/2 lantai</strong>, <strong>LT 88 m²</strong>, <strong>Sewa: {priceFull}</strong> di <strong>Taman Jaya, Cipayung – Depok</strong>. Menggunakan foto rumah asli Anda yang tersimpan di bucket <strong>property-media</strong> tanpa modifikasi AI.
        </p>
      </div>
    </div>
  );
};
