import { useState, useMemo } from 'react';
import { Grid3x3, X } from 'lucide-react';
import type { AACSymbol } from '@/data/aacData';
import { symbols, categories } from '@/data/aacData';

interface CoreWordsBarProps {
  language: 'english' | 'hindi';
  onSelect: (symbol: AACSymbol) => void;
}

const coreWords: AACSymbol[] = [
  { emoji: '❤️', en: 'Want', hi: 'चाहना', core: true, wordType: 'verb' },
  { emoji: '➕', en: 'More', hi: 'और', core: true, wordType: 'descriptor' },
  { emoji: '▶️', en: 'Go', hi: 'जाओ', core: true, wordType: 'verb' },
  { emoji: '🛑', en: 'Stop', hi: 'रुको', core: true, wordType: 'negation' },
  { emoji: '🙋', en: 'Help', hi: 'मदद', core: true, wordType: 'verb' },
  { emoji: '👍', en: 'Yes', hi: 'हाँ', core: true, wordType: 'social' },
  { emoji: '👎', en: 'No', hi: 'नहीं', core: true, wordType: 'negation' },
  { emoji: '🙂', en: 'Like', hi: 'पसंद', core: true, wordType: 'verb' },
  { emoji: '🍽️', en: 'Eat', hi: 'खाना', core: true, wordType: 'verb' },
  { emoji: '🥤', en: 'Drink', hi: 'पीना', core: true, wordType: 'verb' },
];

export default function CoreWordsBar({ language, onSelect }: CoreWordsBarProps) {
  const [open, setOpen] = useState(false);

  // All core words across all categories
  const allCore = useMemo(() => {
    const groups: { catKey: string; catLabel: string; items: AACSymbol[] }[] = [];
    Object.keys(symbols).forEach((cat) => {
      if (cat === 'keyboard') return;
      const items = symbols[cat].filter((s) => s.core);
      if (items.length === 0) return;
      const catLabel =
        language === 'english'
          ? categories[cat as keyof typeof categories]?.en ?? cat
          : categories[cat as keyof typeof categories]?.hi ?? cat;
      groups.push({ catKey: cat, catLabel, items });
    });
    return groups;
  }, [language]);

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-3 bg-warning/10 border-b-2 border-warning/30 overflow-x-auto">
        <span className="text-sm font-extrabold text-warning-foreground whitespace-nowrap mr-1">
          ⭐ {language === 'english' ? 'Core' : 'मुख्य'}
        </span>

        {coreWords.map((word) => {
          const text = language === 'english' ? word.en : word.hi;
          return (
            <button
              key={`core-${word.en}`}
              onClick={() => onSelect(word)}
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-2 min-w-[68px] bg-white text-foreground rounded-xl font-bold text-xs whitespace-nowrap shadow-sm border-2 border-warning/40 hover:border-warning hover:shadow-md active:scale-95 transition-all"
            >
              <span className="text-3xl leading-none" aria-hidden="true">
                {word.emoji}
              </span>
              <span className="mt-1">{text}</span>
            </button>
          );
        })}

        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 px-2 py-2 min-w-[68px] bg-primary text-primary-foreground rounded-xl font-bold text-xs whitespace-nowrap shadow-sm hover:brightness-95 active:scale-95 transition-all"
          title={language === 'english' ? 'All core words' : 'सभी मुख्य शब्द'}
        >
          <Grid3x3 size={26} />
          <span className="mt-1">{language === 'english' ? 'All Core' : 'सभी'}</span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-2 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-warning/10">
              <h2 className="font-extrabold text-foreground">
                ⭐ {language === 'english' ? 'All Core Words by Category' : 'श्रेणी अनुसार सभी मुख्य शब्द'}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-muted"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-5">
              {allCore.map((group) => (
                <section key={group.catKey}>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    {group.catLabel}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {group.items.map((s) => {
                      const text = language === 'english' ? s.en : s.hi;
                      return (
                        <button
                          key={`${group.catKey}-${s.en}`}
                          onClick={() => {
                            onSelect(s);
                            setOpen(false);
                          }}
                          className="flex flex-col items-center justify-center gap-1 p-2 bg-white rounded-xl border-2 border-warning/40 hover:border-warning shadow-sm active:scale-95 transition-all"
                        >
                          <span className="text-3xl leading-none" aria-hidden="true">
                            {s.emoji}
                          </span>
                          <span className="text-xs font-bold text-foreground text-center">
                            {text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
