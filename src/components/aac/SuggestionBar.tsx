import { useMemo } from 'react';
import type { AACSymbol } from '@/data/aacData';
import { symbols } from '@/data/aacData';

interface SuggestionBarProps {
  lastWord: AACSymbol | null;
  language: 'english' | 'hindi';
  onSelect: (symbol: AACSymbol) => void;
}

// Word-type based follow-up suggestions
const suggestionMap: Record<string, string[]> = {
  // After pronouns → verbs
  pronoun: ['want', 'need', 'like', 'go', 'eat'],
  // After verbs → nouns
  verb: ['apple', 'water', 'ball', 'home', 'food'],
  // After nouns → descriptors / verbs
  noun: ['more', 'please', 'big', 'good', 'want'],
  // After descriptors → nouns
  descriptor: ['apple', 'ball', 'water', 'food', 'toy'],
  // After feelings → because / descriptors
  feeling: ['happy', 'sad', 'more', 'help', 'please'],
};

const defaultWords = ['eat', 'drink', 'go', 'play', 'more'];

function findSymbolByEn(word: string): AACSymbol | undefined {
  for (const cat of Object.keys(symbols)) {
    if (cat === 'keyboard') continue;
    const found = symbols[cat].find(s => s.en.toLowerCase() === word.toLowerCase());
    if (found) return found;
  }
  return undefined;
}

export default function SuggestionBar({ lastWord, language, onSelect }: SuggestionBarProps) {
  const suggestions = useMemo(() => {
    let wordList = defaultWords;

    if (lastWord) {
      // Determine category of last word
      const en = lastWord.en.toLowerCase();
      const wt = lastWord.wordType;

      if (wt && suggestionMap[wt]) {
        wordList = suggestionMap[wt];
      } else if (['i', 'he', 'she', 'you', 'we', 'they', 'it'].includes(en)) {
        wordList = suggestionMap.pronoun!;
      } else if (['want', 'need', 'like', 'go', 'eat', 'drink', 'play', 'run', 'sit', 'stand'].includes(en)) {
        wordList = suggestionMap.verb!;
      }
    }

    return wordList
      .map(w => findSymbolByEn(w))
      .filter((s): s is AACSymbol => s !== undefined)
      .slice(0, 5);
  }, [lastWord]);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-accent/30 border-b-2 border-border overflow-x-auto">
      <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
        {language === 'english' ? '💡 Next:' : '💡 अगला:'}
      </span>
      {suggestions.map((symbol, i) => {
        const text = language === 'english' ? symbol.en : symbol.hi;
        return (
          <button
            key={`${symbol.en}-${i}`}
            onClick={() => onSelect(symbol)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border-2 border-primary/40 rounded-full font-bold text-sm text-foreground hover:bg-primary/10 hover:border-primary transition-all whitespace-nowrap shadow-sm"
          >
            <span className="text-lg">{symbol.emoji}</span>
            {text}
          </button>
        );
      })}
    </div>
  );
}
