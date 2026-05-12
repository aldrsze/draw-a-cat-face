import { useState, useEffect, useCallback } from 'react';
import * as catService from '../services/catService';

export const useCatGallery = () => {
  const [galleryCats, setGalleryCats] = useState([]);

  // Initialize: test connection and fetch cats
  useEffect(() => {
    initializeGallery();
  }, []);

  const initializeGallery = async () => {
    // Test connection first
    const connResult = await catService.testConnection();

    if (connResult.success) {
      // Fetch cats
      const catsResult = await catService.getAllCats();
      if (catsResult.success) {
        setGalleryCats(catsResult.data);
      }
    }
  };

  const saveCat = useCallback(async (catName, imageData) => {
    const result = await catService.saveCat(catName, imageData);
    
    if (result.success) {
      // Add new cat to beginning of gallery
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
        // Update cat in gallery
        setGalleryCats(prev =>
          prev.map(cat =>
            cat.id === catId ? { ...cat, stars: result.newStarCount } : cat
          )
        );
      } else {
        // fallback: refresh single item or full gallery to sync state
        // Here we refresh the whole gallery (cheaper to implement)
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