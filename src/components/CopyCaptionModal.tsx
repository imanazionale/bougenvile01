import React, { useState } from 'react';
import { Copy, Check, X, FileText, MessageCircle } from 'lucide-react';
import { PropertyData } from '../types';
import { getWhatsAppDirectUrl } from '../data';

interface CopyCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PropertyData;
}

export const CopyCaptionModal: React.FC<CopyCaptionModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const waDirectUrl = getWhatsAppDirectUrl(
    data.contactNumber,
    "Assalamualaikum, Apakah ini pemilik Rumah Kontrakan di Depok ?"
  );

  const captionText = `✨ ${data.title} ✨
Hunian Nyaman di Lingkungan Islami & Strategis Depok

📍 Lokasi:
${data.location}

💰 Biaya Sewa:
${data.priceFull} (${data.price}/bln)

📐 Spesifikasi:
• Konsep: ${data.mezzanine}
• Luas Tanah: ${data.landArea}

🏡 Lingkungan & Suasana Cluster:
Cluster sudah 95% terhuni, lingkungan nyaman dan aktif, dengan suasana hunian yang aman dan tertata. Tersedia masjid di dalam cluster sehingga memudahkan aktivitas ibadah sehari-hari.

KENAPA PILIH RUMAH INI?
✓ Cluster Islami
✓ Masjid di Dalam Cluster
✓ ±10 Menit ke Stasiun Depok
✓ Dekat Tol Desari
✓ Smart Door Lock
✓ AC 1/2 PK

"${data.ctaTitle}"

📲 ${data.ctaButton}:
Hubungi / WhatsApp: ${data.contactNumber}
Direct WhatsApp: ${waDirectUrl}

Silakan kirim pesan atau direct message untuk info lebih lanjut & jadwal survey lokasi langsung.

---
#rumahkontrakandepok #sewarumahdepok #clusterislamidepok #cipayungdepok #rumahmezanine #kontrakandepok #propertidepok #inforumahdepok`;

  const handleCopy = async () => {
    let success = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(captionText);
        success = true;
      }
    } catch {
      // Proceed to fallback
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = captionText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        console.warn('Fallback copy failed:', fallbackErr);
      }
    }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <FileText className="w-5 h-5" />
            <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">Teks Iklan / Caption Medsos</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Teks copywriting di bawah sudah disesuaikan dengan seluruh informasi resmi properti (tanpa penambahan data fiktif) dan siap dipaste ke Instagram, Facebook Marketplace, atau status WhatsApp.
          </p>

          <div className="relative">
            <pre className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 font-mono whitespace-pre-wrap leading-relaxed max-h-[340px] overflow-y-auto">
              {captionText}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
            <span className="text-xs text-neutral-500">
              {captionText.length} karakter • Siap diposting
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={waDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md cursor-pointer"
                title="Buka WhatsApp langsung ke pemilik"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Tes Chat WA</span>
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
