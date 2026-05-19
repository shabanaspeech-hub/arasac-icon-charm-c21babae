import { useState, useEffect, useCallback } from 'react';

export const GRID_OPTIONS = [4, 6, 8, 12, 15, 18] as const;
export type GridSize = typeof GRID_OPTIONS[number];

const STORAGE_KEY = 'spectra-grid-size';
const DEFAULT_SIZE: GridSize = 12;

export const GRID_COL_CLASSES: Record<GridSize, string> = {
  4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6',
  8: 'grid-cols-2 sm:grid-cols-4 md:grid-cols-4',
  12: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6',
  15: 'grid-cols-3 sm:grid-cols-5 md:grid-cols-5',
  18: 'grid-cols-3 sm:grid-cols-6 md:grid-cols-6',
};

export function useGridSize() {
  const [gridSize, setGridSizeState] = useState<GridSize>(() => {
    if (typeof window === 'undefined') return DEFAULT_SIZE;
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    return (GRID_OPTIONS as readonly number[]).includes(stored) ? (stored as GridSize) : DEFAULT_SIZE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(gridSize));
  }, [gridSize]);

  const setGridSize = useCallback((size: GridSize) => setGridSizeState(size), []);

  return { gridSize, setGridSize, gridColClass: GRID_COL_CLASSES[gridSize] };
}
