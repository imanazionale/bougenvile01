import React, { useState, useEffect } from 'react';
import { X, Building, Save, RefreshCw, AlertCircle, CheckCircle2, DollarSign, MapPin, Maximize2, FileText } from 'lucide-react';
import { PropertyData } from '../types';
import { savePropertyInfo } from '../lib/supabase';

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyData: PropertyData;
  onSaveSuccess: (updated: PropertyData) => void;
}

export const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  isOpen,
  onClose,
  propertyData,
  onSaveSuccess,
}) => {
  const [title, setTitle] = useState(propertyData.title);
  const [location, setLocation] = useState(propertyData.location);
  const [landArea, setLandArea] = useState<number | string>(
    propertyData.land_area_numeric || 88
  );
  const [price, setPrice] = useState<number | string>(
    propertyData.price_numeric || 2300000
  );
  const [description, setDescription] = useState(
    propertyData.description || propertyData.tagline || 'Hunian Asri & Nyaman untuk Keluarga'
  );
  const [clusterInfo, setClusterInfo] = useState(
    propertyData.clusterInfo ||
      'Cluster sudah 95% terhuni, lingkungan nyaman dan aktif, dengan suasana hunian yang aman dan tertata. Tersedia masjid di dalam cluster sehingga memudahkan aktivitas ibadah sehari-hari.'
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(propertyData.title);
      setLocation(propertyData.location);
      setLandArea(propertyData.land_area_numeric || 88);
      setPrice(propertyData.price_numeric || 2300000);
      setDescription(
        propertyData.description || propertyData.tagline || 'Hunian Asri & Nyaman untuk Keluarga'
      );
      setClusterInfo(
        propertyData.clusterInfo ||
          'Cluster sudah 95% terhuni, lingkungan nyaman dan aktif, dengan suasana hunian yang aman dan tertata. Tersedia masjid di dalam cluster sehingga memudahkan aktivitas ibadah sehari-hari.'
      );
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, propertyData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const numericPrice = Number(price);
    const numericLandArea = Number(landArea);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMsg('Harga sewa harus berupa angka positif.');
      setLoading(false);
      return;
    }

    if (isNaN(numericLandArea) || numericLandArea <= 0) {
      setErrorMsg('Luas tanah harus berupa angka positif.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await savePropertyInfo(
        {
          title,
          location,
          land_area: numericLandArea,
          price: numericPrice,
          description,
        },
        propertyData.id
      );

      if (error) {
        setErrorMsg(error.message || 'Gagal menyimpan data properti.');
        return;
      }

      // Format updated PropertyData for UI
      const priceJutaFormatted = `Rp ${(numericPrice / 1000000).toLocaleString('id-ID', {
        maximumFractionDigits: 1,
      })} Juta`;

      const updated: PropertyData = {
        ...propertyData,
        id: data?.id || propertyData.id,
        title: title.trim(),
        location: location.trim(),
        land_area_numeric: numericLandArea,
        landArea: `LT ${numericLandArea} m²`,
        price_numeric: numericPrice,
        price: priceJutaFormatted,
        priceFull: `${priceJutaFormatted} / bulan`,
        description: description.trim(),
        tagline: description.trim() || propertyData.tagline,
        clusterInfo: clusterInfo.trim(),
      };

      setSuccessMsg('Informasi properti berhasil disimpan!');
      setTimeout(() => {
        onSaveSuccess(updated);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#16181D] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white tracking-wide">
                Edit Informasi Properti
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Pembaruan Data & Informasi Properti Resmi
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Judul / Headline Utama
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: RUMAH DIKONTRAKKAN"
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Lokasi Properti</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Taman Jaya, Cipayung – Depok"
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Harga Sewa (Rupiah/bulan)</span>
              </label>
              <input
                type="number"
                required
                min={100000}
                step={10000}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2300000"
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
              />
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 block">
                {price ? `Rp ${(Number(price) / 1000000).toFixed(1)} Juta / bulan` : ''}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Luas Tanah (m²)</span>
              </label>
              <input
                type="number"
                required
                min={1}
                step={1}
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                placeholder="88"
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
              />
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 block">
                {landArea ? `LT ${landArea} m²` : ''}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Deskripsi / Tagline Properti</span>
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi hunian, keunggulan cluster islami, fasilitas, dll."
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Informasi Lingkungan Cluster</span>
            </label>
            <textarea
              rows={2}
              value={clusterInfo}
              onChange={(e) => setClusterInfo(e.target.value)}
              placeholder="Cluster sudah 95% terhuni, lingkungan nyaman dan aktif..."
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
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
