import React, { useState } from 'react';
import {
  Instagram,
  Store,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Share2,
  X,
  MapPin,
  CheckCircle,
  Tag,
} from 'lucide-react';
import { ColorTheme, PhotoLayout, PropertyData, PropertyPhotos } from '../types';
import { AdPoster } from './AdPoster';
import { getWhatsAppDirectUrl } from '../data';

interface SocialPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PropertyData;
  theme: ColorTheme;
  photoLayout: PhotoLayout;
  photos?: PropertyPhotos;
}

export const SocialPreviewModal: React.FC<SocialPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  theme,
  photoLayout,
  photos,
}) => {
  const [platform, setPlatform] = useState<'instagram' | 'marketplace'>('instagram');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Simulasi Tampilan Media Sosial:</span>
            <div className="flex items-center bg-neutral-200 dark:bg-neutral-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setPlatform('instagram')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  platform === 'instagram'
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram Feed</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform('marketplace')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  platform === 'marketplace'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>FB Marketplace</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Feed Container */}
        <div className="p-4 sm:p-6 bg-neutral-100 dark:bg-neutral-950 flex justify-center max-h-[80vh] overflow-y-auto">
          {platform === 'instagram' ? (
            /* Instagram Post Mockup */
            <div className="w-full max-w-[420px] bg-black text-white rounded-xl border border-neutral-800 overflow-hidden shadow-2xl">
              {/* IG Header */}
              <div className="flex items-center justify-between p-3 border-b border-neutral-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-xs font-bold text-amber-300">
                      DP
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold">properti.depok.id</span>
                      <CheckCircle className="w-3 h-3 text-blue-400 fill-blue-400" />
                    </div>
                    <p className="text-[10px] text-neutral-400">Taman Jaya, Cipayung, Depok</p>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-neutral-400" />
              </div>

              {/* 4:5 Ad Poster Feed Container */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-neutral-900">
                <AdPoster data={data} theme={theme} photoLayout={photoLayout} photos={photos} />
              </div>

              {/* IG Post Actions */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <Heart className="w-5 h-5 text-neutral-200 hover:text-red-500 transition cursor-pointer" />
                    <MessageCircle className="w-5 h-5 text-neutral-200" />
                    <Send className="w-5 h-5 text-neutral-200" />
                  </div>
                  <Bookmark className="w-5 h-5 text-neutral-200" />
                </div>

                <p className="text-xs font-semibold mb-1">Disukai oleh keluarga.muda dan lainnya</p>

                {/* Caption preview */}
                <div className="text-xs text-neutral-300 space-y-1">
                  <p>
                    <span className="font-bold text-white mr-1.5">properti.depok.id</span>
                    RUMAH DIKONTRAKKAN di Taman Jaya, Cipayung – Depok! Sewa {data.priceFull} ({data.price}/bln). Hunian nyaman dengan Mezanine 1/2 Lantai & LT 88 m² di cluster islami...
                  </p>
                  <p className="text-neutral-500 text-[11px] cursor-pointer">Lihat semua komentar</p>
                  <p className="text-neutral-500 text-[10px] uppercase">1 JAM YANG LALU</p>
                </div>
              </div>
            </div>
          ) : (
            /* Facebook Marketplace Mockup */
            <div className="w-full max-w-[440px] bg-neutral-900 text-white rounded-xl border border-neutral-800 overflow-hidden shadow-2xl">
              <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-neutral-200">Marketplace Facebook</span>
                </div>
                <span className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full font-medium">
                  Tersedia untuk Disewa
                </span>
              </div>

              {/* Marketplace Image Container */}
              <div className="relative w-full aspect-[4/5] bg-neutral-950">
                <AdPoster data={data} theme={theme} photoLayout={photoLayout} photos={photos} />
              </div>

              {/* Marketplace Item Info */}
              <div className="p-4 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-white leading-snug">
                      {data.title} - Mezanine 1/2 Lantai
                    </h3>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm whitespace-nowrap">
                      {data.priceFull}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{data.location}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-800/80 border border-neutral-700/60 space-y-1 text-xs">
                  <p className="font-semibold text-amber-300">Kondisi & Lingkungan Cluster:</p>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    Cluster sudah 95% terhuni, lingkungan nyaman dan aktif, dengan suasana hunian yang aman dan tertata. Tersedia masjid di dalam cluster sehingga memudahkan aktivitas ibadah sehari-hari.
                  </p>
                  <p className="font-semibold text-amber-300 pt-1">Highlight Properti:</p>
                  <p className="text-neutral-300">• Cluster Islami & Masjid di Dalam Cluster</p>
                  <p className="text-neutral-300">• ±10 Menit Stasiun Depok & Dekat Tol Desari</p>
                  <p className="text-neutral-300">• Smart Door Lock & AC 1/2 PK</p>
                  <p className="text-neutral-300">• Luas Tanah: {data.landArea} | {data.mezzanine}</p>
                  <p className="text-amber-200 font-mono font-semibold pt-1">Hubungi: {data.contactNumber}</p>
                </div>

                <div className="flex gap-2 pt-1">
                  <a
                    href={getWhatsAppDirectUrl(data.contactNumber, "Assalamu’alaikum warahmatullahi wabarakatuh. Apakah rumahnya masih tersedia?")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat WhatsApp Pemilik</span>
                  </a>
                  <div className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300">
                    <Share2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400">
          <span>Format rasio: <strong>4:5 (1080 x 1350 px)</strong> optimal untuk feed & posting marketplace.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white font-medium cursor-pointer transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
