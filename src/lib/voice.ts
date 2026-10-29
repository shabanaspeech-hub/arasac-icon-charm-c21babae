// Picks a real device voice for the language. Without an explicit Hindi
// voice, many browsers (iPad/iPhone, Windows) use the English voice and stay silent.
let cache: SpeechSynthesisVoice[] = [];

function load() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  cache = window.speechSynthesis.getVoices();
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  load();
  window.speechSynthesis.addEventListener?.('voiceschanged', load);
}

export function pickVoice(language: 'english' | 'hindi'): SpeechSynthesisVoice | null {
  if (!cache.length) load();
  if (language === 'hindi') {
    return (
      cache.find(v => v.lang.toLowerCase().replace('_', '-') === 'hi-in') ||
      cache.find(v => v.lang.toLowerCase().startsWith('hi')) ||
      cache.find(v => /hindi|हिन्दी|lekha|hemant|kalpana|swara|madhur/i.test(v.name)) ||
      null
    );
  }
  return cache.find(v => v.lang === 'en-US') || cache.find(v => v.lang.startsWith('en')) || null;
}

export function makeUtterance(text: string, language: 'english' | 'hindi') {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = language === 'english' ? 'en-US' : 'hi-IN';
  const v = pickVoice(language);
  if (v) { u.voice = v; u.lang = v.lang; }
  return u;
}
