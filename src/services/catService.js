import { supabase } from '../supabaseClient';
import { compressToBlob, uploadBlobToStorage } from './storageService';

// Test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('cats')
      .select('id')
      .limit(1);
    
    if (error) {
      return { success: false, message: `Connection Error: ${error.message}` };
    }
    return { success: true, message: 'Connected to Supabase' };
  } catch (err) {
    return { success: false, message: 'Failed to reach database server.' };
  }
};

// Fetch all cats
export const getAllCats = async () => {
  try {
    const { data, error } = await supabase
      .from('cats')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fetch error:', error);
      return { success: false, data: [], error: error.message };
    }
    return { success: true, data: data || [], error: null };
  } catch (err) {
    console.error('Network error:', err);
    return { success: false, data: [], error: err.message };
  }
};

// Save new cat
export const saveCat = async (catName, imageDataUrl) => {
  if (!catName?.trim()) return { success: false, error: 'Please name your cat!' };
  if (!imageDataUrl) return { success: false, error: 'Please draw a cat first!' };
  if (!imageDataUrl.startsWith('data:image/')) return { success: false, error: 'Invalid image data' };

  // Client-side quick size check on base64 length
  if (imageDataUrl.length > 220000) {
    return { success: false, error: 'Image too large. Please draw a smaller image.' };
  }

  try {
    // compress & convert to Blob (resize to 800x800 max, quality 0.8)
    const blob = await compressToBlob(imageDataUrl, 800, 800, 0.8);

    // additional check on blob size
    if (blob.size > 200 * 1024) {
      // Try tighter compression or reject
      // For now, return helpful error
      return { success: false, error: 'Compressed image too large (>200KB).' };
    }

    // upload to storage
    const { path, publicUrl } = await uploadBlobToStorage(blob, 'drawings', 'cats');

    // insert metadata row with path/publicUrl (instead of huge base64)
    const { data, error } = await supabase
      .from('cats')
      .insert([
        {
          name: catName.trim(),
          image_path: path,
          image_url: publicUrl,
          stars: 0,
        },
      ])
      .select();

    if (error) {
      console.error('Insert error:', error);
      return { success: false, error: 'Error saving your cat to the cloud!' };
    }
    return { success: true, data: data[0], error: null };
  } catch (err) {
    console.error('Upload error:', err);
    return { success: false, error: (err && err.message) || 'Network error: Unable to save cat' };
  }
};

// Star a cat
export const starCat = async (catId) => {
  if (!catId) {
    return { success: false, error: 'Invalid cat ID' };
  }

  try {
    const { data, error } = await supabase.rpc('increment_cat_stars', {
      cat_id: catId,
    });

    if (error) {
      console.error('RPC error:', error);
      return { success: false, error: 'Error starring cat' };
    }

    // supabase.rpc returns the scalar integer as `data` (or [value] in some responses).
    const newStarCount =
      data && typeof data === 'number'
        ? data
        : Array.isArray(data) && data.length > 0
        ? data[0]
        : null;

    if (newStarCount === null) {
      return { success: false, error: 'No new star count returned' };
    }

    return { success: true, newStarCount, error: null };
  } catch (err) {
    console.error('Network error:', err);
    return { success: false, error: 'Network error: Unable to star cat' };
  }
};