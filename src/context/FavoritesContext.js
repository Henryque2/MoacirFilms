import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as storage from '../storage';

const FavoritesContext = createContext(null);

const FAVORITES_KEY = '@cineverse_favorites';

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loaded, setLoaded] = useState(Platform.OS === 'web');

  useEffect(() => {
    const load = async () => {
      try {
        const favs = await storage.getItem(FAVORITES_KEY);
        if (favs) setFavorites(favs);
      } catch {}
      setLoaded(true);
    };
    load();
  }, []);

  const toggleFavorite = useCallback((movie) => {
    setFavorites((prev) => {
      const exists = prev.find((m) => m.id === movie.id);
      const next = exists ? prev.filter((m) => m.id !== movie.id) : [...prev, movie];
      storage.setItem(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (movieId) => favorites.some((m) => m.id === movieId),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loaded }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};
