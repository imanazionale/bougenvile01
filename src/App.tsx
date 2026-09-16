import React, { useState, useRef, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import {
  Download,
  Eye,
  FileText,
  Home,
  Camera,
  Check,
  AlertCircle,
  X,
  Lock,
  LogOut,
  ShieldCheck,
  Building,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { ColorThemeId, PhotoLayout, PropertyPhotos, MediaItem, PropertyData, GallerySlotInfo } from './types';
import { PROPERTY_DATA, COLOR_THEMES } from './data';
import { getNextGallerySlot, getSlotBadge } from './lib/gallerySlots';
import { formatUploadErrorMessage, formatFileSize } from './lib/imageOptimizer';
import { AdPoster } from './components/AdPoster';
import { AdCustomizerControls } from './components/AdCustomizerControls';
import { SocialPreviewModal } from './components/SocialPreviewModal';
import { CopyCaptionModal } from './components/CopyCaptionModal';
import { PropertyGallerySection } from './components/PropertyGallerySection';
import { MediaLightbox } from './components/MediaLightbox';
import { AdminAuthModal } from './components/AdminAuthModal';
import { EditPropertyModal } from './components/EditPropertyModal';
import { EditCaptionModal } from './components/EditCaptionModal';
import { ThemeModeSelector } from './components/ThemeModeSelector';
import { useTheme } from './lib/themeContext';
import {
  supabase,
  fetchPropertyInfo,
  ensurePropertyRecord,
  fetchPropertyMedia,
  uploadMediaFile,
  replaceMediaFile,
  deleteMediaFile,
  reorderMediaItems,
  signOutAdmin,
} from './lib/supabase';

export default function App() {
  const [currentThemeId, setCurrentThemeId] = useState<ColorThemeId>('warm-sand');
  const [photoLayout, setPhotoLayout] = useState<PhotoLayout>('hybrid-inset');
  const [showGuides, setShowGuides] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCaptionOpen, setIsCaptionOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Property Data State (persisted in Supabase "properties" table)
  const [propertyData, setPropertyData] = useState<PropertyData>(PROPERTY_DATA);

  // Admin Auth State (Supabase Auth)
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authActionReason, setAuthActionReason] = useState<string | undefined>(undefined);

  // Admin Edit Modals
  const [editPropertyModalOpen, setEditPropertyModalOpen] = useState(false);
  const [editCaptionModalOpen, setEditCaptionModalOpen] = useState(false);
  const [captionEditItem, setCaptionEditItem] = useState<MediaItem | null>(null);

  // Upload progress state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');

  // Gallery state & Lightbox modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Real photos state (Exterior Hero, Mezzanine Interior, Cluster Street)
  const [photos, setPhotos] = useState<PropertyPhotos>({
    heroExterior: undefined,
    mezzanineInterior: undefined,
    clusterStreet: undefined,
  });

  // Media list state (persisted in Supabase "property_media" table & "property-media" bucket)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Show auto-dismissing toast notifications
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  // Helper to open Admin Auth Modal with contextual message
  const requireAdmin = (reason: string): boolean => {
    if (adminUser) return true;
    setAuthActionReason(reason);
    setAuthModalOpen(true);
    return false;
  };

  // 1. Listen to Supabase Auth State and load persistent data on mount
  useEffect(() => {
    // Check current auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      setAdminUser(user);
      if (user) {
        ensurePropertyRecord({
          title: propertyData.title,
          location: propertyData.location,
          land_area: propertyData.land_area_numeric || 88,
          price: propertyData.price_numeric || 2300000,
          description: propertyData.description,
        })
          .then((rec) => {
            if (rec && rec.id) {
              setPropertyData((prev) => ({ ...prev, id: rec.id }));
            }
          })
          .catch((err) => console.warn('Could not auto-ensure property record:', err));
      }
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setAdminUser(user);
      if (user) {
        ensurePropertyRecord({
          title: propertyData.title,
          location: propertyData.location,
          land_area: propertyData.land_area_numeric || 88,
          price: propertyData.price_numeric || 2300000,
          description: propertyData.description,
        })
          .then((rec) => {
            if (rec && rec.id) {
              setPropertyData((prev) => ({ ...prev, id: rec.id }));
            }
          })
          .catch((err) => console.warn('Could not auto-ensure property record on auth change:', err));
      }
    });

    // Load persistent data from Supabase backend
    let isMounted = true;
    const loadSupabaseData = async () => {
      try {
        // Fetch property information from "properties" table
        const propRow = await fetchPropertyInfo();
        let actualPropId: number | undefined = undefined;

        if (propRow && isMounted) {
          actualPropId = propRow.id;
          const numericPrice = Number(propRow.price);
          const numericLand = Number(propRow.land_area);
          const priceFormatted = `Rp ${(numericPrice / 1000000).toLocaleString('id-ID', {
            maximumFractionDigits: 1,
          })} Juta`;

          setPropertyData((prev) => ({
            ...prev,
            id: propRow.id,
            title: propRow.title || prev.title,
            location: propRow.location || prev.location,
            land_area_numeric: numericLand,
            landArea: `LT ${numericLand} m²`,
            price_numeric: numericPrice,
            price: priceFormatted,
            priceFull: `${priceFormatted} / bulan`,
            description: propRow.description || prev.description,
            tagline: propRow.description || prev.tagline,
          }));
        }

        // Fetch gallery media metadata from "property_media" table using actual database id
        const supabaseMedia = await fetchPropertyMedia(actualPropId);
        if (isMounted) {
          if (supabaseMedia && supabaseMedia.length > 0) {
            setMediaItems(supabaseMedia);

            // Find primary photos from Supabase media list (0-based sort_order)
            const exteriorItem =
              supabaseMedia.find((m) => m.sort_order === 0) ||
              supabaseMedia.find(
                (m) =>
                  m.sort_order === 1 ||
                  m.category === 'exterior' ||
                  (m.caption && m.caption.toLowerCase().includes('depan'))
              );
            const mezzanineItem =
              supabaseMedia.find((m) => m.sort_order === 1) ||
              supabaseMedia.find(
                (m) =>
                  m.sort_order === 2 ||
                  m.category === 'mezzanine' ||
                  (m.caption && m.caption.toLowerCase().includes('mezanine'))
              );
            const clusterItem =
              supabaseMedia.find((m) => m.sort_order === 2) ||
              supabaseMedia.find(
                (m) =>
                  m.sort_order === 3 ||
                  m.category === 'cluster' ||
                  (m.caption &&
                    (m.caption.toLowerCase().includes('cluster') || m.caption.toLowerCase().includes('jalan')))
              );

            setPhotos({
              heroExterior: exteriorItem?.url || undefined,
              mezzanineInterior: mezzanineItem?.url || undefined,
              clusterStreet: clusterItem?.url || undefined,
            });
          } else {
            // When all media are deleted, start fresh with no records
            setMediaItems([]);
            setPhotos({
              heroExterior: undefined,
              mezzanineInterior: undefined,
              clusterStreet: undefined,
            });
          }
        }
      } catch (err) {
        console.warn('Error fetching initial Supabase data:', err);
      }
    };

    loadSupabaseData();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleThemeChange = (id: ColorThemeId) => {
    setCurrentThemeId(id);
  };

  const handleLayoutChange = (layout: PhotoLayout) => {
    setPhotoLayout(layout);
  };

  // Upload single photo for heroExterior, mezzanineInterior, or clusterStreet to Supabase
  const handlePhotoUpload = async (
    type: 'heroExterior' | 'mezzanineInterior' | 'clusterStreet',
    file: File
  ) => {
    if (!requireAdmin('Silakan login sebagai Admin terlebih dahulu untuk mengunggah foto properti.')) {
      return;
    }

    // Verify session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      setAdminUser(null);
      setAuthActionReason('Sesi login admin Anda telah berakhir. Silakan login kembali untuk mengunggah foto.');
      setAuthModalOpen(true);
      showToast('error', 'Sesi login telah berakhir. Silakan login kembali sebagai Admin.');
      return;
    }

    setIsUploading(true);
    setUploadProgressText(`Mengunggah foto ${type} ke Supabase Storage...`);

    try {
      // Find the existing property from the "properties" table or ensure it exists, getting the real database "id"
      const propRecord = await ensurePropertyRecord({
        title: propertyData.title,
        location: propertyData.location,
        land_area: propertyData.land_area_numeric || 88,
        price: propertyData.price_numeric || 2300000,
        description: propertyData.description,
      });

      const actualPropertyId = propRecord.id;
      if (propertyData.id !== actualPropertyId) {
        setPropertyData((prev) => ({ ...prev, id: actualPropertyId }));
      }

      const sortOrder = type === 'heroExterior' ? 0 : type === 'mezzanineInterior' ? 1 : 2;
      const caption =
        type === 'heroExterior'
          ? 'Tampak Depan Rumah & Carport'
          : type === 'mezzanineInterior'
          ? 'Area Mezanine 1/2 Lantai & Tangga'
          : 'Lingkungan & Jalanan Cluster Asri';

      const { item, error } = await uploadMediaFile(
        file,
        actualPropertyId,
        sortOrder,
        caption,
        {
          title: propertyData.title,
          location: propertyData.location,
          land_area: propertyData.land_area_numeric || 88,
          price: propertyData.price_numeric || 2300000,
          description: propertyData.description,
        }
      );

      if (error || !item) {
        throw error || new Error('Gagal mengunggah file ke Supabase.');
      }

      // Update photos state
      setPhotos((prev) => ({ ...prev, [type]: item.url }));

      // Update or prepend to media items
      setMediaItems((prev) => {
        const filtered = prev.filter(
          (m) =>
            m.sort_order !== sortOrder &&
            m.category !== (type === 'heroExterior' ? 'exterior' : type === 'mezzanineInterior' ? 'mezzanine' : 'cluster')
        );
        const updated = [...filtered, item].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        return updated;
      });

      const label =
        type === 'heroExterior'
          ? 'tampak depan'
          : type === 'mezzanineInterior'
          ? 'area mezanine'
          : 'kondisi jalanan cluster';

      showToast('success', `Foto ${label} berhasil diunggah dan tersimpan permanen di Supabase!`);
    } catch (err: any) {
      console.error('Photo upload error:', err);
      const errMsg = formatUploadErrorMessage(err, file);
      if (
        errMsg.toLowerCase().includes('row-level security') ||
        errMsg.toLowerCase().includes('unauthorized') ||
        errMsg.toLowerCase().includes('jwt') ||
        errMsg.toLowerCase().includes('403') ||
        errMsg.toLowerCase().includes('401')
      ) {
        setAdminUser(null);
        setAuthActionReason('Sesi login admin Anda telah kedaluwarsa. Silakan login kembali.');
        setAuthModalOpen(true);
        showToast('error', 'Sesi login telah kedaluwarsa. Silakan login ulang sebagai Admin.');
      } else {
        showToast('error', `Gagal mengunggah foto: ${errMsg}`);
      }
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  // Upload file specifically to a target gallery slot (e.g. from the dynamic placeholder card)
  const handleUploadNextSlot = async (file: File, slotInfo: GallerySlotInfo) => {
    if (!requireAdmin(`Silakan login sebagai Admin terlebih dahulu untuk mengunggah ${slotInfo.label}.`)) {
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      setAdminUser(null);
      setAuthActionReason('Sesi login admin Anda telah berakhir. Silakan login kembali untuk mengunggah foto/video.');
      setAuthModalOpen(true);
      showToast('error', 'Sesi login telah berakhir. Silakan login kembali sebagai Admin.');
      return;
    }

    setIsUploading(true);
    setUploadProgressText(`Mengunggah berkas ${slotInfo.label} ke Supabase Storage...`);

    try {
      const propRecord = await ensurePropertyRecord({
        title: propertyData.title,
        location: propertyData.location,
        land_area: propertyData.land_area_numeric || 88,
        price: propertyData.price_numeric || 2300000,
        description: propertyData.description,
      });

      const actualPropertyId = propRecord.id;
      if (propertyData.id !== actualPropertyId) {
        setPropertyData((prev) => ({ ...prev, id: actualPropertyId }));
      }

      const isVideo = file.type.startsWith('video/');
      let uploadCaption = slotInfo.caption;
      if (slotInfo.sort_order === 3 && !isVideo) {
        uploadCaption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Dokumentasi Properti #4';
      } else if (slotInfo.sort_order >= 4) {
        uploadCaption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || slotInfo.caption;
      }

      const { item, error } = await uploadMediaFile(
        file,
        actualPropertyId,
        slotInfo.sort_order,
        uploadCaption,
        {
          title: propertyData.title,
          location: propertyData.location,
          land_area: propertyData.land_area_numeric || 88,
          price: propertyData.price_numeric || 2300000,
          description: propertyData.description,
        }
      );

      if (error || !item) {
        throw error || new Error('Gagal mengunggah berkas ke Supabase.');
      }

      setMediaItems((prev) => {
        const filtered = prev.filter((m) => m.sort_order !== slotInfo.sort_order);
        return [...filtered, item].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      });

      if (slotInfo.sort_order === 0) {
        setPhotos((prev) => ({ ...prev, heroExterior: item.url }));
      } else if (slotInfo.sort_order === 1) {
        setPhotos((prev) => ({ ...prev, mezzanineInterior: item.url }));
      } else if (slotInfo.sort_order === 2) {
        setPhotos((prev) => ({ ...prev, clusterStreet: item.url }));
      }

      showToast('success', `${slotInfo.badge} berhasil diunggah dan tersimpan di database Supabase!`);
    } catch (err: any) {
      console.error('Next slot upload error:', err);
      const errMsg = formatUploadErrorMessage(err, file);
      if (
        errMsg.toLowerCase().includes('row-level security') ||
        errMsg.toLowerCase().includes('unauthorized') ||
        errMsg.toLowerCase().includes('jwt') ||
        errMsg.toLowerCase().includes('403') ||
        errMsg.toLowerCase().includes('401')
      ) {
        setAdminUser(null);
        setAuthActionReason('Sesi login admin Anda telah kedaluwarsa. Silakan login kembali.');
        setAuthModalOpen(true);
        showToast('error', 'Sesi login telah kedaluwarsa. Silakan login kembali sebagai Admin.');
      } else {
        showToast('error', `Gagal mengunggah berkas: ${errMsg}`);
      }
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  // Upload batch images or videos into gallery (Supabase Storage bucket "property-media" + "property_media" table)
  const handleAddMediaFiles = async (fileList: FileList) => {
    if (!requireAdmin('Silakan login sebagai Admin terlebih dahulu untuk mengunggah media.')) {
      return;
    }

    // Verify session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      setAdminUser(null);
      setAuthActionReason('Sesi login admin Anda telah kedaluwarsa. Silakan login kembali untuk mengunggah foto/video.');
      setAuthModalOpen(true);
      showToast('error', 'Sesi login admin telah kedaluwarsa. Silakan login kembali.');
      return;
    }

    if (!fileList || fileList.length === 0) {
      showToast('error', 'Silakan pilih berkas foto atau video terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    const total = fileList.length;
    let uploadedCount = 0;
    const uploadErrors: string[] = [];

    try {
      // Find the existing property from the "properties" table or ensure it exists, getting the real database "id"
      const propRecord = await ensurePropertyRecord({
        title: propertyData.title,
        location: propertyData.location,
        land_area: propertyData.land_area_numeric || 88,
        price: propertyData.price_numeric || 2300000,
        description: propertyData.description,
      });

      const actualPropertyId = propRecord.id;
      if (propertyData.id !== actualPropertyId) {
        setPropertyData((prev) => ({ ...prev, id: actualPropertyId }));
      }

      const newItems: MediaItem[] = [];
      const maxSortOrder = mediaItems.reduce((max, item) => Math.max(max, item.sort_order || 0), 0);

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fileExt = (file.name.split('.').pop() || '').toLowerCase();
        const isKnownVideo =
          file.type.startsWith('video/') ||
          ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v', '3gp'].includes(fileExt);
        const isKnownImage =
          file.type.startsWith('image/') ||
          ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'heic', 'heif'].includes(fileExt);

        if (!isKnownVideo && !isKnownImage) {
          uploadErrors.push(`"${file.name}": format berkas tidak didukung (harus gambar atau video)`);
          continue;
        }

        setUploadProgressText(`Mengunggah file ${i + 1} dari ${total}: ${file.name}...`);

        // Dynamically determine the next gallery slot based on existing records + items queued in this batch
        const targetSlot = getNextGallerySlot([...mediaItems, ...newItems]);
        const nextSortOrder = targetSlot.sort_order;

        let defaultCaption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (nextSortOrder === 0) {
          defaultCaption = 'Tampak Depan Rumah & Carport';
        } else if (nextSortOrder === 1) {
          defaultCaption = 'Area Mezanine 1/2 Lantai & Tangga';
        } else if (nextSortOrder === 2) {
          defaultCaption = 'Lingkungan & Jalanan Cluster Asri';
        } else if (nextSortOrder === 3 && isKnownVideo) {
          defaultCaption = 'Video Walkthrough Hunian';
        }

        const { item, error } = await uploadMediaFile(
          file,
          actualPropertyId,
          nextSortOrder,
          defaultCaption,
          {
            title: propertyData.title,
            location: propertyData.location,
            land_area: propertyData.land_area_numeric || 88,
            price: propertyData.price_numeric || 2300000,
            description: propertyData.description,
          }
        );

        if (error) {
          const errMsg = formatUploadErrorMessage(error, file);
          console.error(`Error uploading ${file.name}:`, error);
          uploadErrors.push(`"${file.name}": ${errMsg}`);
        } else if (item) {
          newItems.push(item);
          uploadedCount++;
          // Sync hero/mezzanine/cluster showcase photos if assigned to slots 0-2
          if (item.sort_order === 0) {
            setPhotos((prev) => ({ ...prev, heroExterior: item.url }));
          } else if (item.sort_order === 1) {
            setPhotos((prev) => ({ ...prev, mezzanineInterior: item.url }));
          } else if (item.sort_order === 2) {
            setPhotos((prev) => ({ ...prev, clusterStreet: item.url }));
          }
        }
      }

      if (newItems.length > 0) {
        setMediaItems((prev) => [...prev, ...newItems]);
        if (uploadErrors.length === 0) {
          showToast(
            'success',
            `${uploadedCount} media berhasil diunggah ke Supabase Storage bucket "property-media"!`
          );
        } else {
          showToast(
            'error',
            `${uploadedCount} media berhasil diunggah, namun ${uploadErrors.length} file gagal: ${uploadErrors[0]}`
          );
        }
      } else {
        const firstErr = uploadErrors[0] || '';
        const isAuthOrRls =
          firstErr.toLowerCase().includes('row-level security') ||
          firstErr.toLowerCase().includes('unauthorized') ||
          firstErr.toLowerCase().includes('jwt') ||
          firstErr.toLowerCase().includes('accessdenied') ||
          firstErr.toLowerCase().includes('403') ||
          firstErr.toLowerCase().includes('401');

        if (isAuthOrRls) {
          setAdminUser(null);
          setAuthActionReason('Sesi login admin Anda telah kedaluwarsa atau izin penyimpanan ditolak. Silakan login kembali.');
          setAuthModalOpen(true);
          showToast(
            'error',
            'Sesi login telah kedaluwarsa atau izin ditolak. Silakan login kembali sebagai Admin.'
          );
        } else {
          showToast(
            'error',
            firstErr ? `Gagal mengunggah: ${firstErr}` : 'Tidak ada media yang berhasil diunggah. Pastikan format berkas didukung.'
          );
        }
      }
    } catch (err: any) {
      console.error('Batch upload error:', err);
      showToast('error', err.message || 'Terjadi kesalahan saat mengunggah media.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  // Delete media item from Supabase
  const handleRemoveMedia = async (item: MediaItem) => {
    if (!requireAdmin('Silakan login sebagai Admin terlebih dahulu untuk menghapus media.')) {
      return;
    }

    if (item.supabaseId) {
      const { success, error } = await deleteMediaFile(item.supabaseId, item.file_path);
      if (error) {
        showToast('error', error.message || 'Gagal menghapus media dari Supabase.');
        return;
      }
    }

    setMediaItems((prev) => {
      const remaining = prev.filter((m) => m.id !== item.id);
      return remaining;
    });

    // Clear corresponding preview photo if deleted item was slot 0, 1, or 2
    if (item.sort_order === 0 || item.category === 'exterior') {
      setPhotos((prev) => ({ ...prev, heroExterior: undefined }));
    }
    if (item.sort_order === 1 || item.category === 'mezzanine') {
      setPhotos((prev) => ({ ...prev, mezzanineInterior: undefined }));
    }
    if (item.sort_order === 2 || item.category === 'cluster') {
      setPhotos((prev) => ({ ...prev, clusterStreet: undefined }));
    }

    showToast('success', 'Media berhasil dihapus dari Supabase.');
  };

  // Reorder gallery items
  const handleReorderMedia = async (currentIndex: number, direction: 'left' | 'right') => {
    if (!requireAdmin('Silakan login sebagai Admin terlebih dahulu untuk mengatur urutan galeri.')) {
      return;
    }

    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= mediaItems.length) return;

    const updated = [...mediaItems];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);

    // Update sort_order numbers dynamically (0-based: 0, 1, 2, 3...)
    const reordered = updated.map((item, idx) => {
      const order = idx;
      return {
        ...item,
        sort_order: order,
        badge: getSlotBadge(order, item.caption, item.type === 'video'),
      };
    });

    setMediaItems(reordered);

    // Sync showcase photos to match the new slot 0, 1, and 2
    const ext = reordered.find((m) => m.sort_order === 0);
    const mez = reordered.find((m) => m.sort_order === 1);
    const clu = reordered.find((m) => m.sort_order === 2);
    setPhotos({
      heroExterior: ext?.url,
      mezzanineInterior: mez?.url,
      clusterStreet: clu?.url,
    });

    // Persist new sort_order to Supabase
    const dbPayload = reordered
      .filter((m) => m.supabaseId)
      .map((m) => ({ id: m.supabaseId!, sort_order: m.sort_order! }));

    if (dbPayload.length > 0) {
      const { error } = await reorderMediaItems(dbPayload);
      if (error) {
        showToast('error', 'Gagal memperbarui urutan di Supabase: ' + error.message);
      } else {
        showToast('success', 'Urutan galeri berhasil disimpan di Supabase!');
      }
    }
  };

  // Trigger caption editing
  const handleEditCaption = (item: MediaItem) => {
    if (!requireAdmin('Silakan login sebagai Admin terlebih dahulu untuk mengedit keterangan.')) {
      return;
    }
    setCaptionEditItem(item);
    setEditCaptionModalOpen(true);
  };

  // Replace photo or video in gallery (updating same row in property_media and replacing storage file)
  const handleReplaceMedia = async (targetItem: MediaItem, newFile: File) => {
    if (!requireAdmin('Silakan login sebagai Admin terlebih dahulu untuk mengganti foto/video.')) {
      return;
    }

    // Verify session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      setAdminUser(null);
      setAuthActionReason('Sesi login admin Anda telah berakhir. Silakan login kembali untuk mengganti foto/video.');
      setAuthModalOpen(true);
      showToast('error', 'Sesi login telah berakhir. Silakan login kembali sebagai Admin.');
      return;
    }

    setIsUploading(true);
    setUploadProgressText('Mengunggah file pengganti ke Supabase Storage...');

    try {
      let updatedItem: MediaItem | null = null;

      if (targetItem.supabaseId) {
        // Update the SAME row in property_media, upload new file to Storage, and remove old file from Storage
        const { item, error } = await replaceMediaFile(
          targetItem.supabaseId,
          newFile,
          targetItem.file_path,
          targetItem.property_id || propertyData.id
        );
        if (error || !item) {
          throw error || new Error('Gagal mengganti file media di Supabase.');
        }
        updatedItem = item;
      } else {
        // If it was a default placeholder item without supabaseId yet, persist it as a row with the same sort_order and caption
        const propRecord = await ensurePropertyRecord({
          title: propertyData.title,
          location: propertyData.location,
          land_area: propertyData.land_area_numeric || 88,
          price: propertyData.price_numeric || 2300000,
          description: propertyData.description,
        });

        const { item, error } = await uploadMediaFile(
          newFile,
          propRecord.id,
          targetItem.sort_order ?? 0,
          targetItem.caption || targetItem.title
        );
        if (error || !item) {
          throw error || new Error('Gagal mengunggah file pengganti ke Supabase.');
        }
        updatedItem = item;
      }

      // Preserve the EXACT gallery position, id reference, and sort_order in UI state
      setMediaItems((prev) =>
        prev.map((m) => (m.id === targetItem.id ? updatedItem! : m))
      );

      // If the replaced item is one of the hero/mezzanine/cluster showcase slots, sync preview photos state
      if (updatedItem.sort_order === 0 || targetItem.category === 'exterior') {
        setPhotos((prev) => ({ ...prev, heroExterior: updatedItem!.url }));
      } else if (updatedItem.sort_order === 1 || targetItem.category === 'mezzanine') {
        setPhotos((prev) => ({ ...prev, mezzanineInterior: updatedItem!.url }));
      } else if (updatedItem.sort_order === 2 || targetItem.category === 'cluster') {
        setPhotos((prev) => ({ ...prev, clusterStreet: updatedItem!.url }));
      }

      showToast('success', 'Foto/video berhasil diganti dan diperbarui di database Supabase!');
    } catch (err: any) {
      console.error('Replace media error:', err);
      const errMsg = formatUploadErrorMessage(err, newFile);
      if (
        errMsg.toLowerCase().includes('row-level security') ||
        errMsg.toLowerCase().includes('unauthorized') ||
        errMsg.toLowerCase().includes('jwt') ||
        errMsg.toLowerCase().includes('403') ||
        errMsg.toLowerCase().includes('401')
      ) {
        setAdminUser(null);
        setAuthActionReason('Sesi login admin Anda telah kedaluwarsa. Silakan login kembali.');
        setAuthModalOpen(true);
        showToast('error', 'Sesi login telah kedaluwarsa. Silakan login ulang sebagai Admin.');
      } else {
        showToast('error', `Gagal mengganti foto/video: ${errMsg}`);
      }
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  // Reset photos back to initial defaults
  const handleResetPhotos = () => {
    if (!requireAdmin('Silakan login sebagai Admin terlebih dahulu untuk mereset foto.')) {
      return;
    }
    setPhotos({
      heroExterior: '/20260905_131958.jpg',
      mezzanineInterior: '/20260905_130239.jpg',
      clusterStreet: undefined,
    });
    showToast('success', 'Foto tampilan dikembalikan ke foto bawaan.');
  };

  // Admin Logout
  const handleLogout = async () => {
    await signOutAdmin();
    setAdminUser(null);
    showToast('success', 'Anda telah keluar dari mode Admin.');
  };

  const posterRef = useRef<HTMLDivElement>(null);
  const currentTheme = COLOR_THEMES[currentThemeId] || COLOR_THEMES['warm-sand'];

  // High-Resolution 4:5 PNG Export
  const handleExportPng = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);

    try {
      const previousGuides = showGuides;
      if (previousGuides) setShowGuides(false);

      await new Promise((r) => setTimeout(r, 120));

      const dataUrl = await htmlToImage.toPng(posterRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        skipFonts: true,
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
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0E1013] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#121418]/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800/80 px-4 sm:px-6 py-3 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-amber-900/30 shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white tracking-wide truncate">
                  Desain Promosi Rumah Kontrakan
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Depok
                </span>
                {adminUser && (
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Admin Mode</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                Format Portrait 4:5 • Terintegrasi Supabase Backend
              </p>
            </div>
          </div>

          {/* Action Buttons & Admin Auth State */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Time-Based Light / Dark Mode Selector (Pagi-Sore Terang, Malam Gelap) */}
            <ThemeModeSelector />

            {/* Admin Actions or Login Trigger */}
            {adminUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditPropertyModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/30 transition cursor-pointer shadow-xs dark:shadow-none"
                  title="Edit data properti di Supabase"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Edit Info Properti</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 hover:bg-rose-500/15 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-300 border border-neutral-200 dark:border-neutral-800 text-xs font-medium transition cursor-pointer shadow-xs dark:shadow-none"
                  title="Keluar dari mode admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthActionReason(undefined);
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-neutral-300 dark:border-neutral-700 transition cursor-pointer shadow-xs dark:shadow-none"
                title="Login sebagai Admin untuk mengunggah & mengedit data"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition cursor-pointer shadow-xs dark:shadow-none"
              title="Lihat simulasi postingan di Instagram & Facebook"
            >
              <Eye className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="hidden sm:inline">Simulasi Feed</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCaptionOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition cursor-pointer shadow-xs dark:shadow-none"
              title="Buka teks iklan siap pakai"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Teks Iklan</span>
            </button>

            <button
              type="button"
              onClick={handleExportPng}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
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
            <div className="w-full max-w-[480px] sm:max-w-[500px] flex items-center justify-between mb-3 px-1 text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">Ukuran Asli 4:5</span>
                <span className="text-[11px] bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-700 dark:text-neutral-400 font-mono">
                  1080 × 1350 px
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-amber-600 dark:text-amber-400/90 font-medium">
                  {showGuides ? 'Safe Zone Aktif' : 'Pratinjau Bersih'}
                </span>
              </div>
            </div>

            {/* Render Poster */}
            <div className="w-full flex justify-center overflow-x-auto pb-4">
              <AdPoster
                ref={posterRef}
                data={propertyData}
                theme={currentTheme}
                photoLayout={photoLayout}
                photos={photos}
                showGuides={showGuides}
                onPhotoUpload={(type, file) => handlePhotoUpload(type, file)}
                isInteractive={true}
              />
            </div>

            {/* Quick Caption helper bar */}
            <div className="w-full max-w-[480px] sm:max-w-[500px] mt-2 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800/80 px-3.5 py-2 rounded-xl shadow-xs dark:shadow-none">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>Foto asli tersimpan di Supabase Storage bucket <strong>property-media</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setIsCaptionOpen(true)}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium hover:underline cursor-pointer shrink-0 ml-2"
              >
                Lihat Teks Iklan &rarr;
              </button>
            </div>
          </div>

          {/* RIGHT: CONTROLS, THEME & SPECS */}
          <div className="lg:col-span-5 space-y-4">
            <AdCustomizerControls
              currentThemeId={currentThemeId}
              onThemeChange={handleThemeChange}
              photoLayout={photoLayout}
              onLayoutChange={handleLayoutChange}
              showGuides={showGuides}
              onToggleGuides={() => setShowGuides(!showGuides)}
              onExportPng={handleExportPng}
              isExporting={isExporting}
              onOpenPreview={() => setIsPreviewOpen(true)}
              onOpenCaption={() => setIsCaptionOpen(true)}
              photos={photos}
              onPhotoUpload={handlePhotoUpload}
              onResetPhotos={handleResetPhotos}
              priceFull={propertyData.priceFull}
              isAdmin={!!adminUser}
              onRequestAdminLogin={(reason) => {
                setAuthActionReason(reason);
                setAuthModalOpen(true);
              }}
              onOpenEditProperty={() => setEditPropertyModalOpen(true)}
            />

            {/* Contact quick view */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800/70 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between shadow-xs dark:shadow-none">
              <div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-300 block">WhatsApp Kontak Pemilik:</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Siap pasang di bio & caption postingan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-800 dark:text-amber-300 font-mono font-bold bg-amber-50 dark:bg-neutral-800 border border-amber-200 dark:border-neutral-700 px-2.5 py-0.5 rounded">
                  {propertyData.contactNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= GALERI RUMAH (HORIZONTAL CAROUSEL & SUPABASE MEDIA) ================= */}
        <PropertyGallerySection
          mediaList={mediaItems}
          isAdmin={!!adminUser}
          onRequestAdminLogin={(reason) => {
            setAuthActionReason(reason);
            setAuthModalOpen(true);
          }}
          onOpenLightbox={(index) => {
            setLightboxIndex(index);
            setLightboxOpen(true);
          }}
          onAddMediaFiles={handleAddMediaFiles}
          onRemoveMedia={handleRemoveMedia}
          onUploadClusterPhoto={(file) => handlePhotoUpload('clusterStreet', file)}
          onUploadNextSlot={handleUploadNextSlot}
          onReorderMedia={handleReorderMedia}
          onEditCaption={handleEditCaption}
          onReplaceMedia={handleReplaceMedia}
          isUploading={isUploading}
          uploadProgressText={uploadProgressText}
        />
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          {toast.type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-neutral-800 dark:text-neutral-200 flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 p-0.5 rounded transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ================= MODALS ================= */}
      {/* Admin Supabase Auth Modal */}
      <AdminAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionReason={authActionReason}
        defaultEmail="Nurimaniman22@gmail.com"
        onAuthSuccess={(email) => {
          showToast('success', `Berhasil login sebagai Admin (${email})!`);
        }}
      />

      {/* Admin Edit Property Info Modal (Supabase "properties" table) */}
      <EditPropertyModal
        isOpen={editPropertyModalOpen}
        onClose={() => setEditPropertyModalOpen(false)}
        propertyData={propertyData}
        onSaveSuccess={(updated) => {
          setPropertyData(updated);
          showToast('success', 'Informasi properti berhasil diperbarui di Supabase!');
        }}
      />

      {/* Admin Edit Caption Modal (Supabase "property_media" table) */}
      <EditCaptionModal
        isOpen={editCaptionModalOpen}
        onClose={() => {
          setEditCaptionModalOpen(false);
          setCaptionEditItem(null);
        }}
        mediaItem={captionEditItem}
        onSaveSuccess={(updated) => {
          setMediaItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          showToast('success', 'Keterangan media berhasil disimpan di Supabase!');
        }}
      />

      {/* Social Media Preview Modal */}
      <SocialPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={propertyData}
        theme={currentTheme}
        photoLayout={photoLayout}
        photos={photos}
      />

      {/* Copy Caption Modal */}
      <CopyCaptionModal
        isOpen={isCaptionOpen}
        onClose={() => setIsCaptionOpen(false)}
        data={propertyData}
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
