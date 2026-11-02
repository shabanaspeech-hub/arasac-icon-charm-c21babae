import { useCallback, useEffect, useState } from 'react';

// Free tier: Basic Needs, Core Words, Typing, Favorites. Everything else needs Pro.
export const FREE_CATEGORIES = ['core', 'keyboard'];
export const PRO_UNLOCK_CODES = ['VOXAFIA-PRO-2026'];
const KEY = 'voxafia-pro';

export function isValidProCode(code: string): boolean {
  return PRO_UNLOCK_CODES.includes(code.trim().toUpperCase());
}

export function isCategoryFree(key: string): boolean {
  return FREE_CATEGORIES.includes(key);
}

export function usePro() {
  const [isPro, setIsPro] = useState(() => localStorage.getItem(KEY) === '1');
  useEffect(() => { localStorage.setItem(KEY, isPro ? '1' : '0'); }, [isPro]);
  const unlock = useCallback((code: string) => {
    if (isValidProCode(code)) { setIsPro(true); return true; }
    return false;
  }, []);
  return { isPro, setIsPro, unlock };
}
