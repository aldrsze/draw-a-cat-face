import { useState, useEffect, useCallback } from 'react';
import * as catService from '../services/catService';

export const useCatGallery = () => {
  const [galleryCats, setGalleryCats] = useState([]);
  const [dbStatus, setDbStatus] = useState('Checking connection...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize: test connection and fetch cats
  useEffect(() => {
    initializeGallery();
  }, []);

  const initializeGallery = async () => {
    setLoading(true);
    setError(null);

    // Test connection first
    const connResult = await catService.testConnection();
    setDbStatus(connResult.message);

    if (connResult.success) {
      // Fetch cats
      const catsResult = await catService.getAllCats();
      if (catsResult.success) {
        setGalleryCats(catsResult.data);
      } else {
        setError(catsResult.error);
        setGalleryCats([]);
      }
    } else {
      setError(connResult.message);
      setGalleryCats([]);
    }

    setLoading(false);
  };

  const saveCat = useCallback(async (catName, imageData) => {
    setError(null);
    const result = await catService.saveCat(catName, imageData);
    
    if (result.success) {
      // Add new cat to beginning of gallery
      setGalleryCats(prev => [result.data, ...prev]);
      return { success: true, data: result.data };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  }, []);

  const starCat = useCallback(async (catId) => {
    setError(null);
    const result = await catService.starCat(catId);
    
    if (result.success) {
      // Update cat in gallery
      setGalleryCats(prev =>
        prev.map(cat =>
          cat.id === catId ? { ...cat, stars: result.newStarCount } : cat
        )
      );
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  }, []);

  const refreshGallery = useCallback(async () => {
    setLoading(true);
    const result = await catService.getAllCats();
    if (result.success) {
      setGalleryCats(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  return {
    // State
    galleryCats,
    dbStatus,
    loading,
    error,
    // Methods
    saveCat,
    starCat,
    refreshGallery,
  };
};