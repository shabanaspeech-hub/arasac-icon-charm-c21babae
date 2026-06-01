import { useState, useEffect, useCallback } from 'react';

export interface ChildProfile {
  name: string;
  chronologicalAge: number; // years
  expressiveAge: number; // years
  receptiveAge: number; // years
  aacLevel: 1 | 2 | 3 | 4 | 5; // 1=single words ... 5=complex sentences
  vocabulary: string[]; // current known words
  goals: string[];
  assistantEnabled: boolean;
}

const STORAGE_KEY = 'spectra-child-profile';

const DEFAULT_PROFILE: ChildProfile = {
  name: 'Child',
  chronologicalAge: 4,
  expressiveAge: 2,
  receptiveAge: 3,
  aacLevel: 2,
  vocabulary: ['want', 'more', 'help', 'go', 'stop', 'play', 'eat', 'drink'],
  goals: ['Combine 2 words', 'Use core verbs spontaneously'],
  assistantEnabled: true,
};

function load(): ChildProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function useChildProfile() {
  const [profile, setProfileState] = useState<ChildProfile>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const setProfile = useCallback((updates: Partial<ChildProfile>) => {
    setProfileState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleAssistant = useCallback(() => {
    setProfileState(prev => ({ ...prev, assistantEnabled: !prev.assistantEnabled }));
  }, []);

  return { profile, setProfile, toggleAssistant };
}
