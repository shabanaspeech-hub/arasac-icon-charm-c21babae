import { useState } from 'react';
import type { AACSymbol } from '@/data/aacData';
import { getArasaacImageUrl, useArasaacPictogram } from '@/hooks/useArasaac';

interface SentenceBarProps {
  sentence: AACSymbol[];
  language: 'english' | 'hindi';
  onRemoveWord: (index: number) => void;
}

const clean = (w: string) => w.toLowerCase().replace(/[.,!?'"’]/g, '').trim();

// A single picture for one English word, looked up on ARASAAC.
function WordPicture({ word, size }: { word: string; size: string }) {
  const { data: id, isLoading } = useArasaacPictogram(clean(word) || word);
  const [err, setErr] = useState(false);
  if (id && !err) {
    return <img src={getArasaacImageUrl(id)} alt="" aria-hidden draggable={false} onError={() => setErr(true)} className={`${size} object-contain pointer-events-none`} />;
  }
  return <span className={`${size} rounded-md bg-secondary ${isLoading ? 'animate-pulse' : ''}`} aria-hidden />;
}

// One tile per thing the child added. A phrase ("I want to play") shows a
// picture for every word, so the bar is always a real picture sentence.
function SentenceTile({ symbol, label, onRemove }: { symbol: AACSymbol; label: string; onRemove: () => void }) {
  const words = symbol.en.split(/\s+/).filter(w => clean(w));
  return (
    <button
      onClick={onRemove}
      title={label}
      className="inline-flex flex-col items-center bg-primary/5 px-1.5 py-1 rounded-lg border border-primary/40 transition-all hover:bg-primary/10 min-w-[60px] shrink-0"
    >
      {symbol.img ? (
        <img src={symbol.img} alt="" aria-hidden className="w-10 h-10 object-cover rounded pointer-events-none" draggable={false} />
      ) : (
        <span className="flex gap-0.5">
          {words.slice(0, 6).map((w, i) => <WordPicture key={i} word={w} size={words.length > 1 ? 'w-8 h-8' : 'w-10 h-10'} />)}
        </span>
      )}
      <span className="text-xs font-bold text-foreground text-center leading-tight mt-0.5">{label}</span>
    </button>
  );
}

export default function SentenceBar({ sentence, language, onRemoveWord }: SentenceBarProps) {
  if (sentence.length === 0) {
    return (
      <div className="bg-card px-4 py-3 min-h-[76px] flex items-center">
        <p className="text-muted-foreground italic text-sm">
          {language === 'english' ? 'Tap pictures or type to build a sentence...' : 'वाक्य बनाने के लिए चित्रों पर टैप करें...'}
        </p>
      </div>
    );
  }
  return (
    <div className="bg-card p-2 min-h-[76px] flex items-center gap-2 overflow-x-auto">
      {sentence.map((symbol, index) => (
        <SentenceTile
          key={`${symbol.en}-${index}`}
          symbol={symbol}
          label={language === 'english' ? symbol.en : symbol.hi}
          onRemove={() => onRemoveWord(index)}
        />
      ))}
    </div>
  );
}
