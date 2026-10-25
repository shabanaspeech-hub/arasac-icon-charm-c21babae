import { useMemo, useState } from 'react';
import { englishKeyboard, hindiKeyboard, symbols } from '@/data/aacData';

interface KeyboardProps {
  language: 'english' | 'hindi';
  onAddWord: (word: string) => void;
}

const STARTERS_EN = ['I', 'want', 'more', 'help', 'go', 'yes', 'no', 'please'];
const STARTERS_HI = ['मैं', 'चाहिए', 'और', 'मदद', 'जाना', 'हाँ', 'नहीं'];

export default function Keyboard({ language, onAddWord }: KeyboardProps) {
  const [buffer, setBuffer] = useState('');
  const [shiftActive, setShiftActive] = useState(false);
  const layout = language === 'english' ? englishKeyboard : hindiKeyboard;

  const vocab = useMemo(() => {
    const set = new Set<string>();
    Object.values(symbols).forEach(list => list.forEach((s: any) => {
      const w = (language === 'english' ? s.en : s.hi) as string | undefined;
      if (w) set.add(w);
    }));
    return Array.from(set);
  }, [language]);

  const currentToken = buffer.split(' ').pop() || '';
  const predictions = useMemo(() => {
    const q = currentToken.toLowerCase();
    if (!q) return language === 'english' ? STARTERS_EN : STARTERS_HI;
    const starts = vocab.filter(w => w.toLowerCase().startsWith(q));
    const contains = vocab.filter(w => !w.toLowerCase().startsWith(q) && w.toLowerCase().includes(q));
    return [...starts.sort((a, b) => a.length - b.length), ...contains].slice(0, 8);
  }, [currentToken, vocab, language]);

  const pickPrediction = (word: string) => {
    const before = buffer.split(' ').slice(0, -1).join(' ');
    const full = (before ? before + ' ' : '') + word;
    onAddWord(full.trim());
    setBuffer('');
  };

  const typeKey = (key: string) => {
    setBuffer(prev => prev + key);
    if (shiftActive && language === 'english') setShiftActive(false);
  };

  const handleSubmit = () => {
    if (buffer.trim()) {
      onAddWord(buffer.trim());
      setBuffer('');
    }
  };

  return (
    <div className="p-4 bg-muted/50 space-y-3">
      <input
        type="text"
        value={buffer}
        onChange={e => setBuffer(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder={language === 'english' ? 'Type here...' : 'यहाँ टाइप करें...'}
        className="w-full p-3 text-lg border-[3px] border-info rounded-lg bg-card text-foreground focus:outline-none focus:border-primary"
      />

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Word predictions">
        {predictions.length === 0 ? (
          <span className="text-sm text-muted-foreground px-2 py-2">{language === 'english' ? 'No predictions' : 'कोई सुझाव नहीं'}</span>
        ) : predictions.map(p => (
          <button key={p} onClick={() => pickPrediction(p)} className="shrink-0 px-4 py-2.5 rounded-full bg-card border-2 border-primary/40 font-bold text-foreground hover:bg-primary hover:text-primary-foreground active:scale-95 transition">
            {p}
          </button>
        ))}
      </div>
      
      
      <div className="space-y-1.5">
        {layout.map((row, ri) => (
          <div key={ri} className="flex gap-1.5 justify-center">
            {row.map((key, ki) => {
              if (key === 'SPACE') {
                return (
                  <button key={ki} onClick={() => typeKey(' ')} className="px-8 py-3 min-w-[150px] bg-card border-2 border-border rounded-lg font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                    Space
                  </button>
                );
              }
              if (key === 'ENTER') {
                return (
                  <button key={ki} onClick={handleSubmit} className="px-6 py-3 min-w-[80px] bg-warning text-warning-foreground border-2 border-warning rounded-lg font-bold hover:brightness-95 transition-all">
                    Enter
                  </button>
                );
              }
              if (key === 'SHIFT') {
                return (
                  <button key={ki} onClick={() => setShiftActive(!shiftActive)} className={`px-4 py-3 min-w-[70px] rounded-lg font-bold border-2 transition-colors ${shiftActive ? 'bg-success text-success-foreground border-success' : 'bg-muted text-foreground border-border'}`}>
                    ⇧
                  </button>
                );
              }
              if (key === '⌫') {
                return (
                  <button key={ki} onClick={() => setBuffer(b => b.slice(0, -1))} className="px-4 py-3 min-w-[60px] bg-warning text-warning-foreground border-2 border-warning rounded-lg font-bold hover:brightness-95 transition-all">
                    ⌫
                  </button>
                );
              }
              const display = shiftActive && language === 'english' ? key : language === 'english' ? key.toLowerCase() : key;
              return (
                <button key={ki} onClick={() => typeKey(display)} className="px-3 py-3 min-w-[40px] bg-card border-2 border-border rounded-lg font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95">
                  {display}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
