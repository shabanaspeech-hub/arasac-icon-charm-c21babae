import { useCallback, useState, useEffect } from 'react';

export interface AssistantStats {
  viewed: number;
  selected: number;
  wordsAdded: number;
  phrasesAdded: number;
  sentencesAdded: number;
  history: { ts: string; kind: 'view' | 'select' | 'add'; label: string }[];
}

const KEY = 'spectra-assistant-stats';

const DEFAULT: AssistantStats = {
  viewed: 0, selected: 0, wordsAdded: 0, phrasesAdded: 0, sentencesAdded: 0, history: [],
};

function load(): AssistantStats {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch { return DEFAULT; }
}

export function useAssistantTracker() {
  const [stats, setStats] = useState<AssistantStats>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(stats));
  }, [stats]);

  const track = useCallback((kind: 'view' | 'select' | 'add', label: string, addedType?: 'word' | 'phrase' | 'sentence') => {
    setStats(prev => {
      const next: AssistantStats = { ...prev, history: [...prev.history.slice(-99), { ts: new Date().toISOString(), kind, label }] };
      if (kind === 'view') next.viewed += 1;
      if (kind === 'select') next.selected += 1;
      if (kind === 'add') {
        if (addedType === 'word') next.wordsAdded += 1;
        if (addedType === 'phrase') next.phrasesAdded += 1;
        if (addedType === 'sentence') next.sentencesAdded += 1;
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => setStats(DEFAULT), []);

  return { stats, track, reset };
}
