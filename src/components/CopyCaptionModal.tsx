import React, { useState } from 'react';
import { Copy, Check, X, FileText, Share2 } from 'lucide-react';
import { PropertyData } from '../types';

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

  const captionText = `✨ ${data.title} ✨
Hunian Nyaman di Lingkungan Islami & Strategis Depok

📍 Lokasi:
${data.location}

💰 Biaya Sewa:
${data.priceFull} (${data.price}/bln)

📐 Spesifikasi:
• Konsep: ${data.mezzanine}
• Luas Tanah: ${data.landArea}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2 text-amber-400">
            <FileText className="w-5 h-5" />
            <h3 className="font-bold text-sm sm:text-base text-white">Teks Iklan / Caption Medsos</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-neutral-400">
            Teks copywriting di bawah sudah disesuaikan dengan seluruh informasi resmi properti (tanpa penambahan data fiktif) dan siap dipaste ke Instagram, Facebook Marketplace, atau status WhatsApp.
          </p>

          <div className="relative">
            <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-neutral-200 font-mono whitespace-pre-wrap leading-relaxed max-h-[340px] overflow-y-auto">
              {captionText}
            </pre>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-neutral-500">
              {captionText.length} karakter • Siap diposting
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Teks Lengkap</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
