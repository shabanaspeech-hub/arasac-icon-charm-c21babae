import { useState, useEffect, useCallback } from 'react';

export interface FavoriteEntry {
  key: string; // unique id: `sym:<en>` for built-in symbols, `custom:<id>` for custom items
}

const STORAGE_KEY = 'spectra-favorites';

function load(): FavoriteEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback((key: string) => favorites.some(f => f.key === key), [favorites]);

  const toggleFavorite = useCallback((key: string) => {
    setFavorites(prev => prev.some(f => f.key === key) ? prev.filter(f => f.key !== key) : [...prev, { key }]);
  }, []);

  const removeFavorite = useCallback((key: string) => {
    setFavorites(prev => prev.filter(f => f.key !== key));
  }, []);

  const moveFavorite = useCallback((key: string, direction: -1 | 1) => {
    setFavorites(prev => {
      const idx = prev.findIndex(f => f.key === key);
      if (idx === -1) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite, moveFavorite };
}

// Helper to create a long-press handler that works for mouse & touch
export function makeLongPressHandlers(onLongPress: () => void, ms = 500) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let triggered = false;
  const start = () => {
    triggered = false;
    timer = setTimeout(() => {
      triggered = true;
      onLongPress();
    }, ms);
  };
  const cancel = () => {
    if (timer) { clearTimeout(timer); timer = null; }
  };
  return {
    handlers: {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchStart: start,
      onTouchEnd: cancel,
      onTouchCancel: cancel,
    },
    wasLongPress: () => triggered,
  };
}
