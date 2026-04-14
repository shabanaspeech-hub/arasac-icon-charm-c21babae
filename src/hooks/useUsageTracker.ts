import { useCallback } from 'react';

export interface WordUsageEntry {
  word: string;
  count: number;
  lastUsed: string; // ISO timestamp
  sessions: { period: 'morning' | 'afternoon' | 'evening' | 'night'; count: number }[];
}

const STORAGE_KEY = 'aac-usage-data';

function getTimePeriod(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours();
  if (h < 6) return 'night';
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function loadUsage(): Record<string, WordUsageEntry> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveUsage(data: Record<string, WordUsageEntry>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useUsageTracker() {
  const trackWord = useCallback((word: string) => {
    const data = loadUsage();
    const key = word.toLowerCase();
    const period = getTimePeriod();
    const entry = data[key] || { word: key, count: 0, lastUsed: '', sessions: [] };

    entry.count += 1;
    entry.lastUsed = new Date().toISOString();

    const sessionEntry = entry.sessions.find(s => s.period === period);
    if (sessionEntry) sessionEntry.count += 1;
    else entry.sessions.push({ period, count: 1 });

    data[key] = entry;
    saveUsage(data);
  }, []);

  const getTopWords = useCallback((limit = 10): WordUsageEntry[] => {
    const data = loadUsage();
    return Object.values(data).sort((a, b) => b.count - a.count).slice(0, limit);
  }, []);

  const getAllUsage = useCallback((): Record<string, WordUsageEntry> => loadUsage(), []);

  const clearUsage = useCallback(() => localStorage.removeItem(STORAGE_KEY), []);

  return { trackWord, getTopWords, getAllUsage, clearUsage };
}
