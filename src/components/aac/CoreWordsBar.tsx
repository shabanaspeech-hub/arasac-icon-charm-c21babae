import type { AACSymbol } from '@/data/aacData';

interface CoreWordsBarProps {
  language: 'english' | 'hindi';
  onSelect: (symbol: AACSymbol) => void;
}

const coreWords: AACSymbol[] = [
  { emoji: '❤️', en: 'Want', hi: 'चाहना', core: true, wordType: 'verb' },
  { emoji: '🔴', en: 'More', hi: 'और', core: true, wordType: 'descriptor' },
  { emoji: '▶️', en: 'Go', hi: 'जाओ', core: true, wordType: 'verb' },
  { emoji: '🛑', en: 'Stop', hi: 'रुको', core: true, wordType: 'negation' },
  { emoji: '🤝', en: 'Help', hi: 'मदद', core: true, wordType: 'verb' },
  { emoji: '✅', en: 'Yes', hi: 'हाँ', core: true, wordType: 'social' },
  { emoji: '❌', en: 'No', hi: 'नहीं', core: true, wordType: 'negation' },
];

export default function CoreWordsBar({ language, onSelect }: CoreWordsBarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 border-b-2 border-warning/30 overflow-x-auto">
      <span className="text-xs font-bold text-warning-foreground whitespace-nowrap">⭐ Core:</span>
      {coreWords.map((word, i) => {
        const text = language === 'english' ? word.en : word.hi;
        return (
          <button
            key={`core-${word.en}-${i}`}
            onClick={() => onSelect(word)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-warning/80 text-warning-foreground rounded-full font-bold text-sm whitespace-nowrap shadow-sm hover:brightness-95 active:scale-95 transition-all"
          >
            <span>{word.emoji}</span> {text}
          </button>
        );
      })}
    </div>
  );
}
