import { supabase } from '../supabaseClient';

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
export const saveCat = async (catName, imageData) => {
  // Validation
  if (!catName?.trim()) {
    return { success: false, error: 'Please name your cat!' };
  }
  if (!imageData) {
    return { success: false, error: 'Please draw a cat first!' };
  }

  try {
    const { data, error } = await supabase
      .from('cats')
      .insert([{ 
        name: catName.trim(), 
        image_data: imageData, 
        stars: 0 
      }])
      .select();

    if (error) {
      console.error('Insert error:', error);
      return { success: false, error: 'Error saving your cat to the cloud!' };
    }
    
    if (!data || data.length === 0) {
      return { success: false, error: 'No data returned from server' };
    }

    return { success: true, data: data[0], error: null };
  } catch (err) {
    console.error('Network error:', err);
    return { success: false, error: 'Network error: Unable to save cat' };
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