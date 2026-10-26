import { useState } from 'react';
import type { AACSymbol } from '@/data/aacData';
import { getArasaacImageUrl, useArasaacPictogram } from '@/hooks/useArasaac';
import { pickKeyword } from './VisualSuggestionCard';

interface SentenceBarProps {
  sentence: AACSymbol[];
  language: 'english' | 'hindi';
  onRemoveWord: (index: number) => void;
}

// One word tile in the sentence bar. Shows the real ARASAAC symbol for the
// word (or the item's own photo for custom items); emoji only as fallback so
// a picture always accompanies the word — even for typed words and phrases.
function SentenceWordTile({ label, emoji, img, onRemove }: { label: string; emoji: string; img?: string; onRemove: () => void }) {
  const keyword = pickKeyword(label);
  const { data: pictogramId } = useArasaacPictogram(keyword);
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onRemove}
      title={label}
      className="inline-flex flex-col items-center bg-primary/5 p-1.5 rounded-lg border border-primary/40 cursor-pointer transition-all hover:bg-primary/10 hover:-translate-y-0.5 min-w-[64px]"
    >
      {img ? (
        <img src={img} alt="" aria-hidden className="w-9 h-9 object-cover rounded pointer-events-none" draggable={false} />
      ) : pictogramId && !imgError ? (
        <img
          src={getArasaacImageUrl(pictogramId)}
          alt=""
          aria-hidden
          draggable={false}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-9 h-9 object-contain pointer-events-none"
        />
      ) : (
        <span className="text-2xl leading-none" aria-hidden>{emoji}</span>
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
          {language === 'english'
            ? 'Tap symbols or type to build a sentence...'
            : 'वाक्य बनाने के लिए प्रतीकों पर टैप करें...'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card p-2 min-h-[76px] flex items-center gap-2 flex-wrap">
      {sentence.map((symbol, index) => {
        const text = language === 'english' ? symbol.en : symbol.hi;
        return (
          <SentenceWordTile
            key={`${symbol.en}-${index}`}
            label={text}
            emoji={symbol.emoji}
            img={symbol.img}
            onRemove={() => onRemoveWord(index)}
          />
        );
      })}
    </div>
  );
}
