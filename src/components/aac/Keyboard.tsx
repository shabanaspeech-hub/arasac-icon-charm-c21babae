import { useMemo, useState } from 'react';
import { Delete, CornerDownLeft, ArrowBigUp } from 'lucide-react';
import { englishKeyboard, hindiKeyboard, symbols } from '@/data/aacData';
import { VisualSuggestionCard } from './VisualSuggestionCard';

interface KeyboardProps {
  language: 'english' | 'hindi';
  onAddWord: (word: string) => void;
}

const STARTERS_EN = ['I', 'want', 'more', 'help', 'go', 'yes', 'no', 'please'];
const STARTERS_HI = ['मैं', 'चाहिए', 'और', 'मदद', 'जाना', 'हाँ', 'नहीं'];

const keyBase =
  'h-12 sm:h-14 md:h-16 rounded-xl bg-[hsl(var(--key-bg))] text-[hsl(var(--key-fg))] shadow-[0_2px_0_hsl(var(--key-shadow))] font-extrabold text-xl sm:text-2xl md:text-3xl flex items-center justify-center active:translate-y-[2px] active:shadow-none transition select-none';

export default function Keyboard({ language, onAddWord }: KeyboardProps) {
  const [buffer, setBuffer] = useState('');
  const [shift, setShift] = useState(false);
  const layout = language === 'english' ? englishKeyboard : hindiKeyboard;

  const vocab = useMemo(() => {
    const set = new Set<string>();
    Object.values(symbols).forEach(list => list.forEach((s: any) => {
      const w = (language === 'english' ? s.en : s.hi) as string | undefined;
      if (w) set.add(w);
    }));
    return Array.from(set);
  }, [language]);

  const token = buffer.split(' ').pop() || '';
  const predictions = useMemo(() => {
    const q = token.toLowerCase();
    if (!q) return language === 'english' ? STARTERS_EN : STARTERS_HI;
    const starts = vocab.filter(w => w.toLowerCase().startsWith(q)).sort((a, b) => a.length - b.length);
    const contains = vocab.filter(w => !w.toLowerCase().startsWith(q) && w.toLowerCase().includes(q));
    return [...starts, ...contains].slice(0, 6);
  }, [token, vocab, language]);

  const pick = (word: string) => {
    const before = buffer.split(' ').slice(0, -1).join(' ');
    onAddWord(((before ? before + ' ' : '') + word).trim());
    setBuffer('');
  };
  const type = (k: string) => { setBuffer(p => p + k); if (shift) setShift(false); };
  const submit = () => { if (buffer.trim()) { onAddWord(buffer.trim()); setBuffer(''); } };

  return (
    <div className="keyboard-theme p-2 sm:p-3 space-y-2 rounded-2xl max-w-5xl mx-auto">
      <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 h-12">
        <span className="flex-1 text-xl font-bold truncate">{buffer || <span className="text-muted-foreground font-normal text-base">{language === 'english' ? 'Type a word…' : 'शब्द टाइप करें…'}</span>}</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" aria-label="Word predictions">
        {predictions.map(p => (
          <VisualSuggestionCard key={p} text={p} size="sm" onTap={() => pick(p)} />
        ))}
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        {layout.map((row, ri) => (
          <div key={ri} className="flex gap-1.5 sm:gap-2">
            {row.map((key, ki) => {
              if (key === 'SPACE') return <button key={ki} onClick={() => type(' ')} className={`${keyBase} flex-[5] text-base`}>{language === 'english' ? 'space' : 'स्पेस'}</button>;
              if (key === 'ENTER') return <button key={ki} onClick={submit} className={`${keyBase} flex-[2]`} aria-label="Enter"><CornerDownLeft /></button>;
              if (key === 'SHIFT') return <button key={ki} onClick={() => setShift(!shift)} className={`${keyBase} flex-[1.5] ${shift ? 'ring-2 ring-primary' : ''}`} aria-label="Shift"><ArrowBigUp /></button>;
              if (key === '⌫') return <button key={ki} onClick={() => setBuffer(b => b.slice(0, -1))} className={`${keyBase} flex-[1.5]`} aria-label="Backspace"><Delete /></button>;
              const d = language === 'english' ? (shift ? key.toUpperCase() : key.toLowerCase()) : key;
              return <button key={ki} onClick={() => type(d)} className={`${keyBase} flex-1 min-w-0`}>{d}</button>;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
