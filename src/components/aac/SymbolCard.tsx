import { useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { getArasaacImageUrl, useArasaacPictogram } from '@/hooks/useArasaac';
import type { AACSymbol, WordType } from '@/data/aacData';

interface SymbolCardProps {
  symbol: AACSymbol;
  language: 'english' | 'hindi';
  onClick: () => void;
  onLongPress?: () => void;
  isFavorite?: boolean;
}


const colorClassMap: Record<string, string> = {
  core: 'aac-card-core',
  noun: 'aac-card-noun',
  verb: 'aac-card-verb',
  descriptor: 'aac-card-descriptor',
  preposition: 'aac-card-preposition',
  question: 'aac-card-question',
  negation: 'aac-card-negation',
  feeling: 'aac-card-feeling',
  social: 'aac-card-social',
  misc: 'aac-card-misc',
};

export default function SymbolCard({ symbol, language, onClick, onLongPress, isFavorite }: SymbolCardProps) {
  const text = language === 'english' ? symbol.en : symbol.hi;
  const translation = language === 'english' ? symbol.hi : symbol.en;
  const { data: pictogramId, isLoading } = useArasaacPictogram(symbol.en);
  const [imgError, setImgError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);

  const startPress = () => {
    if (!onLongPress) return;
    longPressedRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      onLongPress();
    }, 500);
  };
  const cancelPress = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };
  const handleClick = () => {
    if (longPressedRef.current) { longPressedRef.current = false; return; }
    onClick();
  };

  const cardClass = symbol.wordType
    ? (colorClassMap[symbol.wordType] || 'border-border bg-card')
    : 'border-border bg-card';

  return (
    <button
      onClick={handleClick}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchCancel={cancelPress}
      onContextMenu={(e) => { e.preventDefault(); }}
      className={`relative flex flex-col items-center justify-center p-2 rounded-xl border-[3px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 animate-pop-in w-full h-full min-h-[110px] ${cardClass}`}
    >
      {isFavorite && (
        <Star size={16} className="absolute top-1.5 right-1.5 fill-warning text-warning" />
      )}

      {symbol.core && (
        <span className="absolute top-1 left-1 bg-success text-success-foreground text-[10px] px-1.5 py-0.5 rounded font-bold">
          CORE
        </span>
      )}

      <div className="flex-1 w-full flex items-center justify-center min-h-0 mb-1">
        {pictogramId && !imgError ? (
          <img
            src={getArasaacImageUrl(pictogramId, { skin: symbol.wordType === 'feeling' || symbol.wordType === 'social' })}
            alt={symbol.en}
            className="max-w-full max-h-full object-contain pointer-events-none"
            onError={() => setImgError(true)}
            loading="lazy"
            draggable={false}
          />
        ) : isLoading ? (
          <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
        ) : (
          <span className="text-5xl sm:text-6xl">{symbol.emoji}</span>
        )}
      </div>

      <span className="text-sm sm:text-base font-bold text-foreground text-center leading-tight">{text}</span>
      <span className="text-[11px] text-muted-foreground text-center">{translation}</span>
    </button>
  );
}
