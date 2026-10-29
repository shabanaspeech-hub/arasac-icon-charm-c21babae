import { useState, useCallback } from 'react';
import { makeUtterance } from '@/lib/voice';

export interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
}

export function useSpeech() {
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 0.9,
    pitch: 1,
    volume: 1,
  });

  const speak = useCallback((text: string, language: 'english' | 'hindi') => {
    const utterance = makeUtterance(text, language);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [voiceSettings]);

  return { voiceSettings, setVoiceSettings, speak };
}
