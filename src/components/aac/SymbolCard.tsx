import { useState } from 'react';
import { getArasaacImageUrl, useArasaacPictogram } from '@/hooks/useArasaac';
import type { AACSymbol, WordType } from '@/data/aacData';

interface SymbolCardProps {
  symbol: AACSymbol;
  language: 'english' | 'hindi';
  onClick: () => void;
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

export default function SymbolCard({ symbol, language, onClick }: SymbolCardProps) {
  const text = language === 'english' ? symbol.en : symbol.hi;
  const translation = language === 'english' ? symbol.hi : symbol.en;
  const { data: pictogramId, isLoading } = useArasaacPictogram(symbol.en);
  const [imgError, setImgError] = useState(false);

  const cardClass = symbol.wordType
    ? (colorClassMap[symbol.wordType] || 'border-border bg-card')
    : 'border-border bg-card';

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center p-3 rounded-xl border-[3px] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 animate-pop-in ${cardClass}`}
    >
      {symbol.core && (
        <span className="absolute top-1 left-1 bg-success text-success-foreground text-[10px] px-1.5 py-0.5 rounded font-bold">
          CORE
        </span>
      )}

      <div className="w-16 h-16 flex items-center justify-center mb-1">
        {pictogramId && !imgError ? (
          <img
            src={getArasaacImageUrl(pictogramId, { skin: symbol.wordType === 'feeling' || symbol.wordType === 'social' })}
            alt={symbol.en}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : isLoading ? (
          <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
        ) : (
          <span className="text-4xl">{symbol.emoji}</span>
        )}
      </div>

      <span className="text-sm font-bold text-foreground text-center leading-tight">{text}</span>
      <span className="text-[11px] text-muted-foreground text-center">{translation}</span>
    </button>
  );
}
