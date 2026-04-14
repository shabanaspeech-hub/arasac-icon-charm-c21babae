import { useState, useCallback } from 'react';
import { Volume2, Delete, Trash2, Mic, Palette, Search } from 'lucide-react';
import spectraLogo from '@/assets/spectra-logo.png';
import { symbols, categories, quickPhrases, type AACSymbol, type CategoryKey } from '@/data/aacData';
import { useSpeech } from '@/hooks/useSpeech';
import SymbolCard from './SymbolCard';
import SentenceBar from './SentenceBar';
import Keyboard from './Keyboard';
import SuggestionBar from './SuggestionBar';
import VoiceSettingsDialog from './VoiceSettingsDialog';

const wordColors: Record<string, string> = {
  core: '🟨', noun: '🟦', verb: '🟩', descriptor: '🟪',
  preposition: '🟧', question: '🟫', feeling: '🟥', social: '⬜'
};

export default function AACApp() {
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');
  const [currentCategory, setCurrentCategory] = useState<string>('core');
  const [sentence, setSentence] = useState<AACSymbol[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorCodingEnabled, setColorCodingEnabled] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const { voiceSettings, setVoiceSettings, speak } = useSpeech();

  const addToSentence = useCallback((symbol: AACSymbol) => {
    const text = language === 'english' ? symbol.en : symbol.hi;
    speak(text, language);
    setSentence(prev => [...prev, symbol]);
  }, [language, speak]);

  const removeWord = useCallback((index: number) => {
    setSentence(prev => prev.filter((_, i) => i !== index));
  }, []);

  const speakSentence = useCallback(() => {
    if (sentence.length === 0) return;
    const text = sentence.map(s => language === 'english' ? s.en : s.hi).join(' ');
    speak(text, language);
  }, [sentence, language, speak]);

  const addPhrase = useCallback((phrase: string) => {
    speak(phrase, language);
    setSentence(prev => [...prev, { emoji: '💬', en: phrase, hi: phrase, isPhrase: true }]);
  }, [language, speak]);

  const addTypedWord = useCallback((word: string) => {
    speak(word, language);
    setSentence(prev => [...prev, { emoji: '💬', en: word, hi: word, isTyped: true }]);
  }, [language, speak]);

  // Get filtered symbols
  const getDisplaySymbols = () => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const allMatches: AACSymbol[] = [];
      Object.keys(symbols).forEach(cat => {
        if (cat === 'keyboard') return;
        symbols[cat].forEach(s => {
          if (s.en.toLowerCase().includes(query) || s.hi.toLowerCase().includes(query)) {
            allMatches.push(s);
          }
        });
      });
      return allMatches;
    }
    return symbols[currentCategory] || [];
  };

  const displaySymbols = getDisplaySymbols();
  const phrases = language === 'english' ? quickPhrases.en : quickPhrases.hi;

  // Stats
  let totalWords = 0;
  let coreWords = 0;
  Object.keys(symbols).forEach(cat => {
    if (cat !== 'keyboard') {
      totalWords += symbols[cat].length;
      coreWords += symbols[cat].filter(s => s.core).length;
    }
  });

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-6xl mx-auto bg-card rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="aac-gradient text-primary-foreground p-4">
          <div className="flex items-center justify-center gap-3">
            <img src={spectraLogo} alt="Spectra Speech" className="w-12 h-12 rounded-full bg-white/90 p-1 shadow-lg" />
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-extrabold">AAC Communication App</h1>
              <p className="text-xs opacity-90 mt-1">Developed by Shabana Tariq - Speech Language Therapist</p>
            </div>
          </div>
          <div className="bg-primary-foreground/20 p-2 mt-3 rounded-lg text-xs font-semibold text-center">
            📚 Total Words: {totalWords} | ⭐ Core Words: {coreWords} | 📁 Categories: {Object.keys(categories).length - 1}
          </div>
        </header>

        {/* Language Toggle */}
        <div className="flex justify-center gap-3 p-3 bg-secondary border-b-2 border-border">
          <button
            onClick={() => setLanguage('english')}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${language === 'english' ? 'aac-gradient text-primary-foreground scale-105 shadow-md' : 'bg-card text-primary shadow-sm'}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hindi')}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${language === 'hindi' ? 'aac-gradient text-primary-foreground scale-105 shadow-md' : 'bg-card text-primary shadow-sm'}`}
          >
            हिंदी (Hindi)
          </button>
        </div>

        {/* Quick Phrases */}
        <div className="bg-warning/15 p-3 border-b-[3px] border-warning overflow-x-auto">
          <h3 className="text-xs font-bold text-warning-foreground mb-2">
            ⚡ {language === 'english' ? 'Quick Phrases' : 'त्वरित वाक्यांश'}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {phrases.map((phrase, i) => (
              <button
                key={i}
                onClick={() => addPhrase(phrase)}
                className="px-3 py-1.5 bg-warning text-warning-foreground rounded-lg font-bold text-xs hover:brightness-95 transition-all hover:scale-105"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Sentence Bar */}
        <SentenceBar sentence={sentence} language={language} onRemoveWord={removeWord} />

        {/* Smart Suggestions */}
        <SuggestionBar
          lastWord={sentence.length > 0 ? sentence[sentence.length - 1] : null}
          language={language}
          onSelect={addToSentence}
        />

        {/* Controls */}
        <div className="flex justify-center gap-2 p-3 bg-secondary flex-wrap">
          <button onClick={speakSentence} className="flex items-center gap-1.5 px-4 py-2 bg-success text-success-foreground rounded-lg font-bold text-sm hover:brightness-95 transition-all">
            <Volume2 size={16} /> Speak
          </button>
          <button onClick={() => setSentence(prev => prev.slice(0, -1))} className="flex items-center gap-1.5 px-4 py-2 bg-warning text-warning-foreground rounded-lg font-bold text-sm hover:brightness-95 transition-all">
            <Delete size={16} /> Delete
          </button>
          <button onClick={() => setSentence([])} className="flex items-center gap-1.5 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-bold text-sm hover:brightness-95 transition-all">
            <Trash2 size={16} /> Clear
          </button>
          <button onClick={() => setVoiceModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-info text-info-foreground rounded-lg font-bold text-sm hover:brightness-95 transition-all">
            <Mic size={16} /> Voice
          </button>
          <button onClick={() => setColorCodingEnabled(!colorCodingEnabled)} className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-bold text-sm hover:brightness-95 transition-all">
            <Palette size={16} /> {colorCodingEnabled ? 'Hide Colors' : 'Show Colors'}
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-secondary border-b-2 border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'english' ? '🔍 Search words...' : '🔍 शब्द खोजें...'}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-border rounded-lg text-sm bg-card text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Color Legend */}
        {colorCodingEnabled && (
          <div className="p-2 px-4 bg-secondary border-b-2 border-border text-xs flex flex-wrap gap-3">
            <strong>Color Code:</strong>
            {Object.entries(wordColors).map(([type, icon]) => (
              <span key={type}>{icon} {type.charAt(0).toUpperCase() + type.slice(1)}</span>
            ))}
          </div>
        )}

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 p-3 bg-secondary border-b-2 border-border">
          {Object.entries(categories).map(([key, val]) => {
            const label = language === 'english' ? val.en : val.hi;
            const isActive = key === currentCategory;
            let btnClass = 'bg-card text-foreground shadow-sm';
            if (key === 'core') btnClass = isActive ? 'bg-success/80 text-success-foreground' : 'bg-success text-success-foreground';
            else if (key === 'keyboard') btnClass = isActive ? 'bg-info/80 text-info-foreground' : 'bg-info text-info-foreground';
            else if (isActive) btnClass = 'aac-gradient text-primary-foreground';
            
            return (
              <button
                key={key}
                onClick={() => { setCurrentCategory(key); setSearchQuery(''); }}
                className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${btnClass}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {currentCategory === 'keyboard' ? (
          <Keyboard language={language} onAddWord={addTypedWord} />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 p-4 max-h-[500px] overflow-y-auto">
            {displaySymbols.length > 0 ? (
              displaySymbols.map((symbol, i) => (
                <SymbolCard
                  key={`${symbol.en}-${i}`}
                  symbol={symbol}
                  language={language}
                  colorCodingEnabled={colorCodingEnabled}
                  onClick={() => addToSentence(symbol)}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-8">
                {language === 'english' ? 'No symbols found' : 'कोई प्रतीक नहीं मिला'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Voice Settings */}
      <VoiceSettingsDialog
        open={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        settings={voiceSettings}
        onSettingsChange={setVoiceSettings}
        onTest={() => speak(language === 'english' ? 'Hello, this is a test' : 'नमस्ते, यह एक परीक्षण है', language)}
      />
    </div>
  );
}
