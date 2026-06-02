import { useState } from 'react';
import { Plus, Star, Volume2 } from 'lucide-react';
import { getArasaacImageUrl, useArasaacPictogram } from '@/hooks/useArasaac';

// Emoji fallback for common AAC words
const EMOJI_MAP: Record<string, string> = {
  ball: '⚽', bubbles: '🫧', swing: '🛝', outside: '🌳', with: '🤝',
  together: '👫', turn: '🔄', fun: '🎉', friend: '🧑‍🤝‍🧑',
  food: '🍽️', more: '➕', apple: '🍎', water: '💧', hungry: '🍽️',
  snack: '🍿', lunch: '🥪', tasty: '😋', finished: '✅', done: '✅',
  milk: '🥛', juice: '🧃', cup: '🥤', thirsty: '😮‍💨', cold: '❄️', warm: '☀️', empty: '🫙',
  happy: '😊', sad: '😢', mad: '😠', tired: '😴', scared: '😨',
  because: '➡️', frustrated: '😤', excited: '🤩', calm: '😌',
  home: '🏠', park: '🌳', car: '🚗', school: '🏫',
  later: '⏰', now: '⏱️', after: '⏭️',
  want: '🙋', help: '🆘', stop: '✋', please: '🙏',
  play: '🎮', eat: '🍴', drink: '🥤', go: '🚶',
  i: '👤', you: '👉', me: '🙋', it: '👉',
  yes: '✅', no: '❌', like: '❤️',
};

function pickKeyword(text: string): string {
  const words = text.toLowerCase().replace(/[.,!?'"]/g, '').split(/\s+/).filter(Boolean);
  // skip pronouns/short fillers
  const skip = new Set(['i', 'a', 'an', 'the', 'is', 'am', 'to', 'me', 'you', 'it', 'we', 'do', 'can', 'my', 'your']);
  const meaningful = words.find(w => !skip.has(w) && w.length > 2);
  return meaningful || words[0] || text;
}

function getEmoji(text: string): string {
  const words = text.toLowerCase().replace(/[.,!?'"]/g, '').split(/\s+/);
  for (const w of words) {
    if (EMOJI_MAP[w]) return EMOJI_MAP[w];
  }
  return '💬';
}

interface VisualCardProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  onTap: () => void;
  onAdd?: () => void;
  onFav?: () => void;
}

export function VisualSuggestionCard({ text, size = 'md', onTap, onAdd, onFav }: VisualCardProps) {
  const keyword = pickKeyword(text);
  const { data: pictogramId } = useArasaacPictogram(keyword);
  const [imgError, setImgError] = useState(false);
  const emoji = getEmoji(text);

  const heights = { sm: 'min-h-[110px]', md: 'min-h-[140px]', lg: 'min-h-[160px]' };

  return (
    <div className="relative">
      <button
        onClick={onTap}
        className={`group w-full ${heights[size]} flex flex-col items-center justify-center p-2 rounded-xl border-[3px] border-primary/40 bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all`}
      >
        <Volume2 size={12} className="absolute top-1.5 left-1.5 text-primary opacity-60" />
        <div className="flex-1 w-full flex items-center justify-center min-h-0 mb-1">
          {pictogramId && !imgError ? (
            <img
              src={getArasaacImageUrl(pictogramId)}
              alt={text}
              draggable={false}
              loading="lazy"
              onError={() => setImgError(true)}
              className="max-w-full max-h-[80px] object-contain pointer-events-none"
            />
          ) : (
            <span className="text-5xl">{emoji}</span>
          )}
        </div>
        <span className="text-xs sm:text-sm font-bold text-foreground text-center leading-tight uppercase">
          {text}
        </span>
      </button>
      {(onAdd || onFav) && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          {onFav && (
            <button onClick={onFav} title="Favorite" className="p-1.5 bg-warning text-warning-foreground rounded-full shadow-md hover:scale-110 transition-transform">
              <Star size={12} />
            </button>
          )}
          {onAdd && (
            <button onClick={onAdd} title="Add to board" className="p-1.5 bg-success text-success-foreground rounded-full shadow-md hover:scale-110 transition-transform">
              <Plus size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface SentenceStripProps {
  text: string;
  onTapWord: (word: string) => void;
  onTapStrip: () => void;
  onAdd?: () => void;
  onFav?: () => void;
}

export function VisualSentenceStrip({ text, onTapWord, onTapStrip, onAdd, onFav }: SentenceStripProps) {
  const words = text.replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);
  return (
    <div className="relative bg-card border-[3px] border-primary/40 rounded-xl p-2 hover:border-primary transition-all">
      <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1">
        {words.map((w, i) => (
          <MiniWordCard key={`${w}-${i}`} word={w} onTap={() => onTapWord(w)} />
        ))}
      </div>
      <button
        onClick={onTapStrip}
        className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs uppercase rounded-lg"
      >
        <Volume2 size={14} /> Speak Sentence
      </button>
      {(onAdd || onFav) && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          {onFav && (
            <button onClick={onFav} title="Favorite" className="p-1.5 bg-warning text-warning-foreground rounded-full shadow-md hover:scale-110 transition-transform">
              <Star size={12} />
            </button>
          )}
          {onAdd && (
            <button onClick={onAdd} title="Add to board" className="p-1.5 bg-success text-success-foreground rounded-full shadow-md hover:scale-110 transition-transform">
              <Plus size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MiniWordCard({ word, onTap }: { word: string; onTap: () => void }) {
  const { data: pictogramId } = useArasaacPictogram(word);
  const [imgError, setImgError] = useState(false);
  const emoji = getEmoji(word);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onTap(); }}
      className="flex flex-col items-center justify-end shrink-0 w-16 sm:w-20 p-1.5 rounded-lg border-2 border-border bg-secondary/40 hover:bg-secondary active:scale-95 transition-all"
    >
      <div className="flex-1 flex items-center justify-center mb-1 h-12">
        {pictogramId && !imgError ? (
          <img
            src={getArasaacImageUrl(pictogramId)}
            alt={word}
            draggable={false}
            loading="lazy"
            onError={() => setImgError(true)}
            className="max-w-full max-h-full object-contain pointer-events-none"
          />
        ) : (
          <span className="text-3xl">{emoji}</span>
        )}
      </div>
      <span className="text-[10px] sm:text-xs font-bold uppercase text-foreground text-center leading-tight">{word}</span>
    </button>
  );
}
