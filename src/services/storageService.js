import { supabase } from '../supabaseClient';

/**
 * Resize & compress a dataURL/image to a Blob (JPEG).
 * @param {HTMLImageElement|HTMLCanvasElement|string} source - dataURL string or Image/Canvas
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @param {number} quality - 0..1 for JPEG quality
 * @returns {Promise<Blob>}
 */
export async function compressToBlob(source, maxWidth = 800, maxHeight = 800, quality = 0.8) {
  // create image element if source is dataURL
  let img;
  if (typeof source === 'string') {
    img = new Image();
    img.src = source;
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });
  } else if (source instanceof HTMLImageElement) {
    img = source;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const [origW, origH] = [img ? img.width : source.width, img ? img.height : source.height];
  let [width, height] = [origW, origH];

  // scale to fit max dimensions
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img || source, 0, 0, width, height);

  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
}

/**
 * Upload a Blob to Supabase Storage under a deterministic path and return public URL.
 * @param {Blob} blob
 * @param {string} bucket - storage bucket name (create in Supabase -> Storage)
 * @param {string} folder - optional folder prefix, e.g., 'cats'
 * @param {string} filename - optional filename; if omitted we generate a uuid + .jpg
 */
export async function uploadBlobToStorage(blob, bucket = 'drawings', folder = 'cats', filename) {
  if (!blob) throw new Error('No blob provided');
  const ext = 'jpg';
  if (!filename) {
    const uid = crypto.randomUUID?.() || Date.now().toString(36);
    filename = `${uid}.${ext}`;
  }
  const path = `${folder}/${filename}`;

  // ensure bucket exists and is configured (public/read policies)
  const { data, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: blob.type, upsert: false });

  if (uploadError) throw uploadError;

  // Get public URL (for a public bucket)
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: publicUrlData.publicUrl };
}