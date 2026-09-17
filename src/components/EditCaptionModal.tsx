import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { MediaItem } from '../types';
import { updateMediaCaption } from '../lib/supabase';
import { getSlotBadge } from '../lib/gallerySlots';

interface EditCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem: MediaItem | null;
  onSaveSuccess: (updatedItem: MediaItem) => void;
}

export const EditCaptionModal: React.FC<EditCaptionModalProps> = ({
  isOpen,
  onClose,
  mediaItem,
  onSaveSuccess,
}) => {
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && mediaItem) {
      setCaption(mediaItem.caption || mediaItem.title || '');
      setErrorMsg(null);
    }
  }, [isOpen, mediaItem]);

  if (!isOpen || !mediaItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      setErrorMsg('Keterangan / caption tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (mediaItem.supabaseId) {
        const { success, error } = await updateMediaCaption(mediaItem.supabaseId, caption.trim());
        if (error) {
          setErrorMsg(error.message || 'Gagal menyimpan keterangan media.');
          setLoading(false);
          return;
        }
      }

      const updated: MediaItem = {
        ...mediaItem,
        title: caption.trim(),
        caption: caption.trim(),
        description: caption.trim(),
        badge: getSlotBadge(mediaItem.sort_order ?? 0, caption.trim(), mediaItem.type === 'video'),
      };

      onSaveSuccess(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#16181D] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white tracking-wide">
                Edit Keterangan Media
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Pembaruan Keterangan Foto / Video
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media Preview Thumbnail */}
        <div className="px-6 pt-4 flex items-center gap-3">
          <div className="w-16 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
            {mediaItem.type === 'photo' ? (
              <img src={mediaItem.url} alt={mediaItem.title} className="w-full h-full object-cover" />
            ) : (
              <video src={mediaItem.url} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="text-xs">
            <span className="text-amber-700 dark:text-amber-400 font-semibold block">{mediaItem.badge}</span>
            <span className="text-neutral-600 dark:text-neutral-400 text-[11px] truncate max-w-[240px] block">
              {mediaItem.title}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Keterangan / Caption
            </label>
            <textarea
              rows={3}
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Masukkan judul atau penjelasan foto/video..."
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Caption</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
