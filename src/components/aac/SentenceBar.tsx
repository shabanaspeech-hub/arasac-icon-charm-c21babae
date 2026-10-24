import type { AACSymbol } from '@/data/aacData';

interface SentenceBarProps {
  sentence: AACSymbol[];
  language: 'english' | 'hindi';
  onRemoveWord: (index: number) => void;
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
    <div className="bg-card p-2 min-h-[76px] flex items-center gap-2 flex-wrap overflow-x-auto">
      {sentence.map((symbol, index) => {
        const text = language === 'english' ? symbol.en : symbol.hi;
        return (
          <button
            key={index}
            onClick={() => onRemoveWord(index)}
            className="inline-flex flex-col items-center bg-primary/5 p-2 rounded-lg border border-primary/40 cursor-pointer transition-all hover:bg-primary/10 hover:-translate-y-0.5 min-w-[70px]"
          >
            <span className="text-2xl mb-0.5">{symbol.emoji}</span>
            <span className="text-xs font-bold text-foreground">{text}</span>
          </button>
        );
      })}
    </div>
  );
}
