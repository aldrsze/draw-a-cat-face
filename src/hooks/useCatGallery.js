import { useState, useEffect, useCallback } from 'react';
import * as catService from '../services/catService';

export const useCatGallery = () => {
  const [galleryCats, setGalleryCats] = useState([]);

  // Load gallery data on first render.
  useEffect(() => {
    initializeGallery();
  }, []);

  const initializeGallery = async () => {
    // Skip gallery loading if Supabase is unavailable.
    const connResult = await catService.testConnection();

    if (connResult.success) {
      // Fetch the most recent cat list.
      const catsResult = await catService.getAllCats();
      if (catsResult.success) {
        setGalleryCats(catsResult.data);
      }
    }
  };

  const saveCat = useCallback(async (catName, imageData) => {
    const result = await catService.saveCat(catName, imageData);
    
    if (result.success) {
      // Prepend the newly saved cat for immediate feedback.
      setGalleryCats(prev => [result.data, ...prev]);
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  }, []);

  const starCat = useCallback(async (catId) => {
    const result = await catService.starCat(catId);
    
    if (result.success) {
      if (typeof result.newStarCount === 'number') {
        // Update the cached star count in place.
        setGalleryCats(prev =>
          prev.map(cat =>
            cat.id === catId ? { ...cat, stars: result.newStarCount } : cat
          )
        );
      } else {
        // Refresh the gallery if the RPC response is incomplete.
        const refetch = await catService.getAllCats();
        if (refetch.success) setGalleryCats(refetch.data);
      }
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  }, []);

  return {
    galleryCats,
    saveCat,
    starCat,
  };
};