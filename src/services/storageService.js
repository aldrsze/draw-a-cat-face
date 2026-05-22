import { supabase } from '../supabaseClient';

/**
 * Resize and compress an image source into a JPEG blob.
 */
export async function compressToBlob(source, maxWidth = 800, maxHeight = 800, quality = 0.8) {
  // Convert string input into a loadable image element.
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

  // Preserve aspect ratio while fitting the target bounds.
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
 * Upload a blob to Supabase Storage and return its public URL.
 */
export async function uploadBlobToStorage(blob, bucket = 'drawings', folder = 'cats', filename) {
  if (!blob) throw new Error('No blob provided');
  const ext = 'jpg';
  if (!filename) {
    const uid = crypto.randomUUID?.() || Date.now().toString(36);
    filename = `${uid}.${ext}`;
  }
  const path = `${folder}/${filename}`;

  // Upload to the configured public bucket.
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: blob.type, upsert: false });

  if (uploadError) throw uploadError;

  // Resolve the public URL for the uploaded asset.
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: publicUrlData.publicUrl };
}