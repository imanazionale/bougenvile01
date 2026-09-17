import React, { useState } from 'react';
import {
  X,
  Share2,
  Instagram,
  MessageCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Smartphone,
  Send,
  Image as ImageIcon,
} from 'lucide-react';
import { PropertyData } from '../types';
import { getWhatsAppDirectUrl } from '../data';

interface ShareSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PropertyData;
  onExportPng: () => void;
  isExporting?: boolean;
}

export const ShareSocialModal: React.FC<ShareSocialModalProps> = ({
  isOpen,
  onClose,
  data,
  onExportPng,
  isExporting = false,
}) => {
  const [copiedType, setCopiedType] = useState<'wa' | 'ig' | 'link' | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'wa' | 'ig'>('all');

  if (!isOpen) return null;

  const directWaUrl = getWhatsAppDirectUrl(
    data.contactNumber,
    "Assalamu’alaikum warahmatullahi wabarakatuh. Apakah rumahnya masih tersedia?"
  );

  // Formatted caption for WhatsApp Story
  const waStoryText = `🏡 *RUMAH DIKONTRAKKAN DI DEPOK*
Cluster Islami Taman Jaya, Cipayung – Depok

• Konsep: ${data.mezzanine}
• Luas Tanah: ${data.landArea}
• Biaya Sewa: *${data.priceFull}*
• Fasilitas: Smart Door Lock, AC 1/2 PK, Masjid di Dalam Cluster
• Akses: ±10 Menit ke Stasiun Depok, Dekat Tol Desari

Lingkungan aman, nyaman & aktif (cluster 95% terhuni).

📲 *Hubungi Pemilik / Jadwal Survey:*
${directWaUrl}`;

  // Formatted caption for Instagram Story / Feed
  const igCaptionText = `✨ RUMAH DIKONTRAKKAN DI DEPOK ✨
Cluster Islami Taman Jaya, Cipayung – Depok

Hunian nyaman dan asri dengan konsep modern mezanine untuk keluarga:
📍 Lokasi: ${data.location}
💰 Sewa: ${data.priceFull} (${data.price}/bln)
📐 Luas Tanah: ${data.landArea} | ${data.mezzanine}

Keunggulan Properti:
✓ Cluster Islami & Masjid di Dalam Cluster
✓ ±10 Menit ke Stasiun Depok & Dekat Tol Desari
✓ Smart Door Lock & AC 1/2 PK
✓ Lingkungan 95% terhuni, aman & aktif

"${data.ctaTitle}"

📲 Hubungi / WhatsApp: ${data.contactNumber}
Direct WA: ${directWaUrl}

#rumahkontrakandepok #sewarumahdepok #clusterislamidepok #cipayungdepok #rumahmezanine #kontrakandepok #propertidepok #inforumahdepok`;

  const copyToClipboard = async (text: string, type: 'wa' | 'ig' | 'link') => {
    let success = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      }
    } catch {
      // fallback below
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.warn('Copy fallback failed:', err);
      }
    }

    if (success) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  // Trigger WhatsApp Story / Status share
  const handleShareWaStory = async () => {
    // Copy text first so user has it ready
    await copyToClipboard(waStoryText, 'wa');

    // If Web Share API is supported, attempt native share
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rumah Kontrakan di depok',
          text: waStoryText,
          url: window.location.href,
        });
        return;
      } catch (err: any) {
        // If user cancelled, do nothing; otherwise fallback to direct WA URL
        if (err?.name === 'AbortError') return;
      }
    }

    // Direct WhatsApp share URL
    const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waStoryText)}`;
    window.open(waShareUrl, '_blank', 'noopener,noreferrer');
  };

  // Trigger Instagram Share flow
  const handleShareInstagram = async () => {
    // Copy Instagram caption & hashtags
    await copyToClipboard(igCaptionText, 'ig');

    // Automatically trigger HD 4:5 PNG download for optimal IG format
    onExportPng();

    // If on mobile browser with Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rumah Kontrakan di depok',
          text: igCaptionText,
          url: window.location.href,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // Open Instagram Web / App
    setTimeout(() => {
      window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#15171C] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                Bagikan ke WhatsApp Story & Instagram
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Format gambar 4:5 dan teks copywriting siap posting
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'all'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Semua Pilihan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wa')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'wa'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Story</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ig')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ig'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram Story & Feed</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Main Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp Story Card */}
            {(activeTab === 'all' || activeTab === 'wa') && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>WhatsApp Story (Status)</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    Langsung bagikan ke status WhatsApp atau chat dengan ringkasan poin properti & tautan kontak pemilik.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleShareWaStory}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Bagikan ke WA Story</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(waStoryText, 'wa')}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold border border-neutral-300 dark:border-neutral-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedType === 'wa' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Teks WA Story Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Teks WA Story</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Instagram Card */}
            {(activeTab === 'all' || activeTab === 'ig') && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/10 border border-pink-500/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-bold text-sm">
                    <Instagram className="w-4 h-4 shrink-0" />
                    <span>Instagram (Story & Feed)</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    Format desain 4:5 (1080×1350) sudah proporsional untuk Story dan Feed IG tanpa terpotong.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleShareInstagram}
                    disabled={isExporting}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>{isExporting ? 'Memproses 4:5...' : 'Posting ke Instagram'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(igCaptionText, 'ig')}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold border border-neutral-300 dark:border-neutral-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedType === 'ig' ? (
                      <>
                        <Check className="w-3 h-3 text-pink-500" />
                        <span className="text-pink-600 dark:text-pink-400">Caption IG Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Caption IG + Tagar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step-by-step Helper Guide */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800/80 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Panduan Berbagi Praktis:</span>
            </div>
            <ul className="text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>
                <strong>WhatsApp Story:</strong> Klik tombol <em>"Bagikan ke WA Story"</em> untuk membuka WhatsApp, lalu pilih <strong>Status Saya</strong>.
              </li>
              <li>
                <strong>Instagram:</strong> Klik tombol <em>"Posting ke Instagram"</em> — sistem otomatis mengunduh desain HD rasio 4:5 dan menyalin caption lengkap. Anda cukup mengunggah foto ke Cerita (Story) atau Feed IG dan tempelkan (paste) teksnya.
              </li>
            </ul>
          </div>

          {/* Preview of Share Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <span>Pratinjau Teks Tautan yang Dibagikan:</span>
              <button
                type="button"
                onClick={() => copyToClipboard(window.location.href, 'link')}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'link' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'link' ? 'Tautan Tersalin' : 'Salin Tautan Web'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-800 dark:text-neutral-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
              {activeTab === 'ig' ? igCaptionText : waStoryText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onExportPng}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 font-semibold cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh HD PNG 4:5 Saja</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
