import { createClient, User, Session } from '@supabase/supabase-js';
import { MediaItem, PropertyData } from '../types';
import { getSlotBadge, getSlotCategory } from './gallerySlots';
import { compressImageFile, formatUploadErrorMessage, isImageFile } from './imageOptimizer';

/**
 * Supabase client configuration
 * Uses environment variables configured in AI Studio / Vite
 */
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://eqjzljlfszumqvicrdgr.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_genKDJZtiwhDXxVnnq1DuQ_TO1uyEzm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Interface representing rows in the "properties" table
 */
export interface SupabasePropertyRow {
  id: number;
  title: string;
  location: string;
  land_area: number;
  price: number;
  description: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface representing rows in the "property_media" table
 */
export interface SupabasePropertyMediaRow {
  id: number;
  property_id: number;
  file_path: string;
  media_type: 'photo' | 'video';
  sort_order: number;
  caption: string | null;
  created_at?: string;
}

/**
 * Generate public URL from Supabase Storage for displaying media.
 * Bucket name: "property-media"
 */
export function getStoragePublicUrl(filePath: string): string {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('/')) {
    return filePath;
  }
  const { data } = supabase.storage.from('property-media').getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Fetch property information from "properties" table
 */
export async function fetchPropertyInfo(): Promise<SupabasePropertyRow | null> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching property from Supabase:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Exception in fetchPropertyInfo:', err);
    return null;
  }
}

/**
 * Ensures that a property record exists in the "properties" table.
 * Queries the existing property from "properties" table and returns its real database record.
 * If none exists, creates the initial property record and returns it.
 * Always guarantees a real database "id" to avoid foreign key violations.
 */
export async function ensurePropertyRecord(
  fallbackData?: Partial<{
    title: string;
    location: string;
    land_area: number;
    price: number;
    description: string;
  }>
): Promise<SupabasePropertyRow> {
  // 1. Query for existing property in "properties" table
  const { data: existing, error: fetchErr } = await supabase
    .from('properties')
    .select('*')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing && existing.id) {
    return existing;
  }

  if (fetchErr && fetchErr.code !== 'PGRST116') {
    console.warn('Warning querying properties table:', fetchErr);
  }

  // 2. If no record exists, insert the property record
  const payload = {
    title: fallbackData?.title?.trim() || 'RUMAH DIKONTRAKKAN',
    location: fallbackData?.location?.trim() || 'Taman Jaya, Cipayung – Depok',
    land_area: Number(fallbackData?.land_area) || 88,
    price: Number(fallbackData?.price) || 2300000,
    description:
      fallbackData?.description?.trim() ||
      'Hunian Asri & Nyaman untuk Keluarga di Cluster Islami Taman Jaya, Cipayung, Depok',
  };

  const { data: created, error: insertErr } = await supabase
    .from('properties')
    .insert(payload)
    .select()
    .single();

  if (insertErr) {
    console.error('Error inserting initial property record:', insertErr);
    throw new Error(`Gagal membuat record properti di database: ${insertErr.message}`);
  }

  if (!created || !created.id) {
    throw new Error('Supabase tidak mengembalikan ID properti yang valid.');
  }

  return created;
}

/**
 * Save / update property information in "properties" table (admin only)
 */
export async function savePropertyInfo(
  propertyData: {
    title: string;
    location: string;
    land_area: number;
    price: number;
    description: string;
  },
  existingId?: number
): Promise<{ data: SupabasePropertyRow | null; error: Error | null }> {
  try {
    const payload = {
      title: propertyData.title.trim() || 'RUMAH DIKONTRAKKAN',
      location: propertyData.location.trim() || 'Taman Jaya, Cipayung – Depok',
      land_area: Number(propertyData.land_area) || 88,
      price: Number(propertyData.price) || 2300000,
      description: propertyData.description.trim() || 'Hunian Asri & Nyaman untuk Keluarga',
    };

    let targetId = existingId;
    if (!targetId) {
      const existing = await fetchPropertyInfo();
      if (existing && existing.id) {
        targetId = existing.id;
      }
    }

    if (targetId) {
      const { data, error } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', targetId)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } else {
      const { data, error } = await supabase
        .from('properties')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    }
  } catch (err: any) {
    console.error('Error saving property info:', err);
    return { data: null, error: err };
  }
}

/**
 * Fetch all gallery media metadata from "property_media" table
 * and generate public URLs from Supabase Storage.
 */
export async function fetchPropertyMedia(propertyId?: number): Promise<MediaItem[]> {
  try {
    let query = supabase
      .from('property_media')
      .select('*')
      .order('sort_order', { ascending: true });

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching property_media from Supabase:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    const hasZeroOrder = data.some((r: any) => r.sort_order === 0);
    const minOrder = data.reduce((min: number, r: any) => Math.min(min, r.sort_order ?? 0), 9999);
    const isLegacyOneBased = !hasZeroOrder && minOrder === 1;

    return data.map((row: SupabasePropertyMediaRow, index: number) => {
      const publicUrl = getStoragePublicUrl(row.file_path);
      const isVideo = row.media_type === 'video';
      const caption = row.caption || '';
      const sortOrder = isLegacyOneBased ? (row.sort_order ?? index + 1) - 1 : (row.sort_order ?? index);

      const category = getSlotCategory(sortOrder, isVideo, caption);

      let defaultTitle = isVideo ? 'Video Walkthrough Hunian' : 'Foto Dokumentasi Properti';
      if (sortOrder === 0) defaultTitle = 'Tampak Depan Rumah & Carport';
      else if (sortOrder === 1) defaultTitle = 'Area Mezanine 1/2 Lantai & Tangga';
      else if (sortOrder === 2) defaultTitle = 'Lingkungan & Jalanan Cluster Asri';
      else if (sortOrder === 3) defaultTitle = isVideo ? 'Video Walkthrough Hunian' : (caption || 'Dokumentasi Properti #4');
      else defaultTitle = caption || `Dokumentasi Properti #${sortOrder + 1}`;

      const badge = getSlotBadge(sortOrder, caption, isVideo);

      return {
        id: String(row.id),
        supabaseId: row.id,
        property_id: row.property_id,
        file_path: row.file_path,
        type: row.media_type,
        url: publicUrl,
        title: caption || defaultTitle,
        category,
        badge,
        description:
          caption ||
          (isVideo ? 'Video dokumentasi asli hunian cluster.' : 'Foto dokumentasi asli properti.'),
        caption: caption,
        sort_order: sortOrder,
        isUploadedByUser: true,
      };
    });
  } catch (err) {
    console.warn('Exception in fetchPropertyMedia:', err);
    return [];
  }
}

function resolveMediaInfo(file: File) {
  const fileExt = (file.name.split('.').pop() || '').toLowerCase();
  const isVideo =
    file.type.startsWith('video/') ||
    ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v', '3gp'].includes(fileExt);
  const resolvedExt = fileExt || (isVideo ? 'mp4' : 'jpg');

  let contentType = file.type;
  if (!contentType || contentType === 'application/octet-stream') {
    if (isVideo) {
      contentType = resolvedExt === 'mov' ? 'video/quicktime' : 'video/mp4';
    } else {
      contentType =
        resolvedExt === 'png'
          ? 'image/png'
          : resolvedExt === 'webp'
          ? 'image/webp'
          : resolvedExt === 'gif'
          ? 'image/gif'
          : resolvedExt === 'svg'
          ? 'image/svg+xml'
          : 'image/jpeg';
    }
  }

  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const fileName = `${Date.now()}_${randomSuffix}_${cleanBaseName || 'media'}.${resolvedExt}`;

  return { isVideo, ext: resolvedExt, contentType, fileName };
}

/**
 * Upload image or video to Supabase Storage bucket "property-media"
 * and insert metadata into "property_media" table.
 *
 * Guarantees that the property record exists in the "properties" table
 * and uses its real database "id" to prevent foreign key violations.
 */
export async function uploadMediaFile(
  file: File,
  providedPropertyId?: number,
  sortOrder: number = 1,
  caption?: string,
  fallbackPropertyData?: Partial<SupabasePropertyRow>
): Promise<{ item: MediaItem | null; error: Error | null; actualPropertyId?: number }> {
  try {
    // 1. Ensure the property record exists and resolve the real database properties.id
    let realPropertyId: number;

    if (providedPropertyId) {
      const { data: verifyRow } = await supabase
        .from('properties')
        .select('id')
        .eq('id', providedPropertyId)
        .maybeSingle();

      if (verifyRow && verifyRow.id) {
        realPropertyId = verifyRow.id;
      } else {
        const propertyRow = await ensurePropertyRecord(fallbackPropertyData);
        realPropertyId = propertyRow.id;
      }
    } else {
      const propertyRow = await ensurePropertyRecord(fallbackPropertyData);
      realPropertyId = propertyRow.id;
    }

    // Auto-compress high-resolution images client-side to prevent "exceeded maximum allowed size" errors
    let uploadFile = file;
    if (isImageFile(file)) {
      try {
        uploadFile = await compressImageFile(file);
      } catch (cErr) {
        console.warn('Image auto-compression skipped, using original file:', cErr);
      }
    }

    const { isVideo, contentType, fileName } = resolveMediaInfo(uploadFile);
    const filePath = `properties/${realPropertyId}/${fileName}`;

    // 2. Upload file to Supabase Storage bucket "property-media"
    const { error: uploadErr } = await supabase.storage
      .from('property-media')
      .upload(filePath, uploadFile, {
        cacheControl: '3600',
        upsert: true,
        contentType,
      });

    if (uploadErr) {
      console.error('Error in uploadMediaFile:', uploadErr);
      const friendlyMessage = formatUploadErrorMessage(uploadErr, uploadFile);
      const customErr = new Error(friendlyMessage);
      (customErr as any).originalError = uploadErr;
      throw customErr;
    }

    const finalCaption = caption || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    // 3. Insert metadata into "property_media" table with the actual properties.id
    const { data: row, error: dbErr } = await supabase
      .from('property_media')
      .insert({
        property_id: realPropertyId,
        file_path: filePath,
        media_type: isVideo ? 'video' : 'photo',
        sort_order: sortOrder,
        caption: finalCaption,
      })
      .select()
      .single();

    if (dbErr) {
      // Rollback storage upload if DB insert fails
      await supabase.storage.from('property-media').remove([filePath]);
      throw dbErr;
    }

    const publicUrl = getStoragePublicUrl(filePath);

    const category = getSlotCategory(row.sort_order, isVideo, row.caption || finalCaption);
    const badge = getSlotBadge(row.sort_order, row.caption || finalCaption, isVideo);

    const item: MediaItem = {
      id: String(row.id),
      supabaseId: row.id,
      property_id: row.property_id,
      file_path: row.file_path,
      type: row.media_type,
      url: publicUrl,
      title: row.caption || finalCaption,
      category,
      badge,
      description: row.caption || 'Dokumentasi asli properti.',
      caption: row.caption,
      sort_order: row.sort_order,
      isUploadedByUser: true,
    };

    return { item, error: null, actualPropertyId: realPropertyId };
  } catch (err: any) {
    console.error('Error in uploadMediaFile:', err);
    return { item: null, error: err };
  }
}

/**
 * Delete media from "property_media" database table and Supabase Storage bucket "property-media"
 */
export async function deleteMediaFile(
  mediaId: number,
  filePath?: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // 1. Delete from database
    const { error: dbErr } = await supabase
      .from('property_media')
      .delete()
      .eq('id', mediaId);

    if (dbErr) throw dbErr;

    // 2. Delete from storage if file_path is available
    if (filePath && !filePath.startsWith('http') && !filePath.startsWith('/')) {
      const { error: stErr } = await supabase.storage
        .from('property-media')
        .remove([filePath]);
      if (stErr) console.warn('Warning removing file from storage:', stErr);
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error in deleteMediaFile:', err);
    return { success: false, error: err };
  }
}

/**
 * Reorder gallery items by updating "sort_order" in "property_media" table
 */
export async function reorderMediaItems(
  orderedItems: { id: number; sort_order: number }[]
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const updatePromises = orderedItems.map((item) =>
      supabase
        .from('property_media')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
    );

    const results = await Promise.all(updatePromises);
    const firstErr = results.find((r) => r.error)?.error;
    if (firstErr) throw firstErr;

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error in reorderMediaItems:', err);
    return { success: false, error: err };
  }
}

/**
 * Update media caption in "property_media" table
 */
export async function updateMediaCaption(
  mediaId: number,
  caption: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('property_media')
      .update({ caption: caption.trim() })
      .eq('id', mediaId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error in updateMediaCaption:', err);
    return { success: false, error: err };
  }
}

/**
 * Replace photo or video for an existing property_media row:
 * 1. Uploads new file to Supabase Storage ("property-media" bucket).
 * 2. Updates the existing row in "property_media" table with new file_path and media_type.
 * 3. Removes the previous file from Supabase Storage after successful update.
 * 4. Preserves the same id, sort_order, caption, and property_id. Does NOT create a new row.
 */
export async function replaceMediaFile(
  mediaId: number,
  newFile: File,
  oldFilePath?: string,
  providedPropertyId?: number
): Promise<{ item: MediaItem | null; error: Error | null }> {
  try {
    // 1. Fetch current row to verify existence and get real property_id and current metadata
    const { data: existingRow, error: fetchErr } = await supabase
      .from('property_media')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (fetchErr || !existingRow) {
      throw fetchErr || new Error(`Media dengan ID ${mediaId} tidak ditemukan di database.`);
    }

    const realPropertyId = existingRow.property_id || providedPropertyId || 1;

    // Auto-compress high-resolution images client-side to prevent "exceeded maximum allowed size" errors
    let uploadFile = newFile;
    if (isImageFile(newFile)) {
      try {
        uploadFile = await compressImageFile(newFile);
      } catch (cErr) {
        console.warn('Image auto-compression skipped in replaceMediaFile:', cErr);
      }
    }

    const { isVideo, contentType, fileName } = resolveMediaInfo(uploadFile);
    const newFilePath = `properties/${realPropertyId}/${fileName}`;

    // 2. Upload new file to Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from('property-media')
      .upload(newFilePath, uploadFile, {
        cacheControl: '3600',
        upsert: true,
        contentType,
      });

    if (uploadErr) {
      console.error('Error in replaceMediaFile:', uploadErr);
      const friendlyMessage = formatUploadErrorMessage(uploadErr, uploadFile);
      const customErr = new Error(friendlyMessage);
      (customErr as any).originalError = uploadErr;
      throw customErr;
    }

    // 3. Update existing row in property_media (same id, sort_order, caption preserved)
    const { data: updatedRow, error: updateErr } = await supabase
      .from('property_media')
      .update({
        file_path: newFilePath,
        media_type: isVideo ? 'video' : 'photo',
      })
      .eq('id', mediaId)
      .select()
      .single();

    if (updateErr) {
      // Rollback newly uploaded file if database update fails
      await supabase.storage.from('property-media').remove([newFilePath]);
      throw updateErr;
    }

    // 4. Delete old file from Storage if different and not a static/fallback URL
    const previousPath = oldFilePath || existingRow.file_path;
    if (
      previousPath &&
      previousPath !== newFilePath &&
      !previousPath.startsWith('http') &&
      !previousPath.startsWith('/')
    ) {
      const { error: deleteOldErr } = await supabase.storage
        .from('property-media')
        .remove([previousPath]);
      if (deleteOldErr) {
        console.warn('Warning deleting previous file from storage:', deleteOldErr);
      }
    }

    const publicUrl = getStoragePublicUrl(newFilePath);
    const caption = updatedRow.caption || existingRow.caption || '';

    const category = getSlotCategory(updatedRow.sort_order, isVideo, caption);
    const badge = getSlotBadge(updatedRow.sort_order, caption, isVideo);

    const updatedItem: MediaItem = {
      id: String(updatedRow.id),
      supabaseId: updatedRow.id,
      property_id: updatedRow.property_id,
      file_path: updatedRow.file_path,
      type: updatedRow.media_type,
      url: publicUrl,
      title: caption || (isVideo ? 'Video Walkthrough' : 'Foto Properti'),
      category,
      badge,
      description: caption || (isVideo ? 'Video dokumentasi asli hunian.' : 'Foto dokumentasi asli.'),
      caption: caption,
      sort_order: updatedRow.sort_order,
      isUploadedByUser: true,
    };

    return { item: updatedItem, error: null };
  } catch (err: any) {
    console.error('Error in replaceMediaFile:', err);
    return { item: null, error: err };
  }
}

/**
 * Supabase Auth helpers
 */
export async function signInAdmin(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
}

export async function signUpAdmin(email: string, password: string) {
  return await supabase.auth.signUp({
    email: email.trim(),
    password,
  });
}

export async function signOutAdmin() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}
