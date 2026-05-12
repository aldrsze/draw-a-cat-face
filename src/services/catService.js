import { supabase } from '../supabaseClient';
import { compressToBlob, uploadBlobToStorage } from './storageService';
import {
  rateLimiters,
  validateInput,
  spamDetector,
  safeErrorMessage,
  requestThrottler,
  sessionManager,
} from '../utils/securityHelpers';

// ===== HELPER: Detect if image is mostly blank (user didn't draw) =====
const isBlankDrawing = async (imageDataUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Count non-white pixels (white = 255,255,255,255)
      let nonWhitePixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // If pixel is not white or transparent, count it
        if (!(r === 255 && g === 255 && b === 255 && a === 255)) {
          nonWhitePixels++;
        }
      }
      
      // If <5% of pixels are non-white, consider it blank
      const totalPixels = canvas.width * canvas.height;
      const nonWhitePercent = (nonWhitePixels / totalPixels) * 100;
      
      resolve(nonWhitePercent < 5); // True if mostly blank
    };
    img.onerror = () => resolve(true); // Treat error as blank
    img.src = imageDataUrl;
  });
};

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
  const sessionKey = sessionManager.sessionId;

  // ===== SECURITY: Rate Limiting for Fetches =====
  if (!rateLimiters.fetchCats.isAllowed(sessionKey)) {
    return { success: false, data: [], error: 'Too many requests. Please wait.' };
  }

  try {
    sessionManager.recordActivity();
    const { data, error } = await supabase
      .from('cats')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fetch error:', error);
      return { success: false, data: [], error: safeErrorMessage(error, 'Fetching') };
    }
    return { success: true, data: data || [], error: null };
  } catch (err) {
    console.error('Network error:', err);
    return { success: false, data: [], error: safeErrorMessage(err, 'Network') };
  }
};

// Save new cat
export const saveCat = async (catName, imageDataUrl) => {
  const sessionKey = sessionManager.sessionId;

  // ===== SECURITY: Rate Limiting =====
  if (!rateLimiters.saveCat.isAllowed(sessionKey)) {
    const remaining = rateLimiters.saveCat.getRemainingRequests(sessionKey);
    return {
      success: false,
      error: `Too many uploads. Try again in a minute. (${remaining} remaining)`,
    };
  }

  // ===== SECURITY: Input Validation =====
  const nameValidation = validateInput.catName(catName);
  if (!nameValidation.valid) {
    return { success: false, error: nameValidation.error };
  }

  const imageSizeValidation = validateInput.imageSize(imageDataUrl, 220000);
  if (!imageSizeValidation.valid) {
    return { success: false, error: imageSizeValidation.error };
  }

  const imageFormatValidation = validateInput.imageFormat(imageDataUrl);
  if (!imageFormatValidation.valid) {
    return { success: false, error: imageFormatValidation.error };
  }

  // ===== SECURITY: Check if drawing is blank (user didn't actually draw) =====
  const isBlank = await isBlankDrawing(imageDataUrl);
  if (isBlank) {
    return { success: false, error: 'Posang walang mukha?' };
  }

  // ===== SECURITY: Spam Detection =====
  const spamCheck = spamDetector.isSpam(catName, sessionKey);
  if (spamCheck.isSpam) {
    return { success: false, error: spamCheck.reason };
  }

  // ===== SECURITY: Prevent Concurrent Uploads =====
  if (requestThrottler.isActive(`saveCat_${sessionKey}`)) {
    return { success: false, error: 'Upload already in progress. Please wait.' };
  }

  try {
    return await requestThrottler.throttle(`saveCat_${sessionKey}`, async () => {
      sessionManager.recordActivity();

      // compress & convert to Blob
      const blob = await compressToBlob(imageDataUrl, 800, 800, 0.8);

      // additional check on blob size
      if (blob.size > 200 * 1024) {
        return {
          success: false,
          error: 'Compressed image too large (>200KB). Please draw a smaller image.',
        };
      }

      // upload to storage
      const { path, publicUrl } = await uploadBlobToStorage(blob, 'drawings', 'cats');

      // insert metadata row
      const { data, error } = await supabase
        .from('cats')
        .insert([
          {
            name: nameValidation.value,
            image_path: path,
            image_url: publicUrl,
            stars: 0,
          },
        ])
        .select();

      if (error) {
        console.error('Insert error:', error);
        return { success: false, error: safeErrorMessage(error, 'Saving cat') };
      }

      // Record successful submission for spam detection
      spamDetector.recordSubmission(catName, sessionKey);

      return { success: true, data: data[0], error: null };
    });
  } catch (err) {
    console.error('Upload error:', err);
    return { success: false, error: safeErrorMessage(err, 'Upload') };
  }
};

// Star a cat
export const starCat = async (catId) => {
  const sessionKey = sessionManager.sessionId;

  // ===== SECURITY: Rate Limiting =====
  if (!rateLimiters.starCat.isAllowed(sessionKey)) {
    const remaining = rateLimiters.starCat.getRemainingRequests(sessionKey);
    return {
      success: false,
      error: `Too many star clicks. Try again in a minute. (${remaining} remaining)`,
    };
  }

  // ===== SECURITY: Validate Cat ID =====
  const idValidation = validateInput.catId(catId);
  if (!idValidation.valid) {
    return { success: false, error: idValidation.error };
  }

  try {
    sessionManager.recordActivity();

    const { data, error } = await supabase.rpc('increment_cat_stars', {
      cat_id: idValidation.value,
    });

    if (error) {
      console.error('RPC error:', error);
      return { success: false, error: safeErrorMessage(error, 'Starring cat') };
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
    return { success: false, error: safeErrorMessage(err, 'Starring') };
  }
};