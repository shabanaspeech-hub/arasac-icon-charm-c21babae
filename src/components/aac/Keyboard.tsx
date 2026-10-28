import { useMemo, useState } from 'react';
import { Delete, CornerDownLeft, ArrowBigUp } from 'lucide-react';
import { symbols } from '@/data/aacData';
import { useArasaacPictogram, getArasaacImageUrl } from '@/hooks/useArasaac';

interface KeyboardProps {
  language: 'english' | 'hindi';
  onAddWord: (word: string) => void;
}

const STARTERS_EN = ['I', 'want', 'more', 'help', 'go', 'yes', 'no', 'please'];
const STARTERS_HI = ['मैं', 'चाहिए', 'और', 'मदद', 'जाना', 'हाँ', 'नहीं'];

const NEXT_EN: Record<string, string[]> = {
  i: ['want', 'like', 'am', 'feel', 'need', 'see', 'can'],
  want: ['more', 'water', 'to', 'food', 'play', 'mom', 'help'],
  to: ['go', 'eat', 'play', 'drink', 'sleep', 'see'],
  more: ['please', 'water', 'food', 'play', 'juice'],
  go: ['home', 'outside', 'school', 'park', 'washroom'],
  am: ['happy', 'sad', 'hungry', 'tired', 'thirsty'],
  feel: ['happy', 'sad', 'sick', 'angry', 'tired'],
  like: ['this', 'you', 'ball', 'food', 'music'],
  need: ['help', 'water', 'washroom', 'break'],
  can: ['I', 'you', 'we', 'have'],
  you: ['want', 'like', 'are', 'can'],
  the: ['ball', 'book', 'car', 'dog', 'door'],
  eat: ['apple', 'food', 'rice', 'cake', 'more'],
  drink: ['water', 'milk', 'juice'],
  play: ['ball', 'outside', 'game', 'with'],
  please: ['help', 'stop', 'more', 'go'],
};
const NEXT_HI: Record<string, string[]> = {
  'मैं': ['चाहता', 'खुश', 'जाना', 'खाना'],
  'मुझे': ['चाहिए', 'पानी', 'खाना', 'मदद'],
  'और': ['पानी', 'खाना', 'खेलना'],
};

const SPOKEN: Record<string, string> = {
  '*': 'star', '#': 'hash', '+': 'plus', '-': 'minus', '=': 'equals', '/': 'slash',
  '@': 'at', '!': 'exclamation', '?': 'question', '.': 'dot', ',': 'comma', ':': 'colon',
  '(': 'open bracket', ')': 'close bracket', '%': 'percent', '&': 'and', '$': 'dollar',
  "'": 'apostrophe', '"': 'quote', '_': 'underscore', ';': 'semicolon', '₹': 'rupee',
};

const EN_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'BKSP'],
];
const HI_ROWS = [
  ['१', '२', '३', '४', '५', '६', '७', '८', '९', '०'],
  ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'],
  ['क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ'],
  ['ड', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ'],
  ['म', 'य', 'र', 'ल', 'व', 'श', 'स', 'ह', 'ा', 'BKSP'],
];
const SYM_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['*', '#', '+', '-', '=', '/', '%', '&', '@', '₹'],
  ['!', '?', '.', ',', ':', ';', '(', ')', "'", 'BKSP'],
];

const keyBase =
  'h-10 sm:h-12 md:h-14 rounded-xl bg-[hsl(var(--key-bg))] text-[hsl(var(--key-fg))] shadow-[0_2px_0_hsl(var(--key-shadow))] font-extrabold text-lg sm:text-2xl flex items-center justify-center active:translate-y-[2px] active:shadow-none transition select-none min-w-0';

function sayKey(text: string, language: 'english' | 'hindi') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(SPOKEN[text] ?? text);
  u.lang = language === 'english' ? 'en-US' : 'hi-IN';
  u.rate = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function PredictionChip({ word, onTap }: { word: string; onTap: () => void }) {
  const { data: id } = useArasaacPictogram(word);
  return (
    <button onClick={onTap}
      className="shrink-0 flex items-center gap-1.5 h-11 pl-1.5 pr-3 rounded-full bg-card border border-border shadow-sm font-bold text-sm sm:text-base hover:bg-secondary active:scale-95 transition">
      {id ? <img src={getArasaacImageUrl(id)} alt="" className="w-8 h-8 object-contain" loading="lazy" />
          : <span className="w-8 h-8 rounded-full bg-secondary" />}
      {word}
    </button>
  );
}

export default function Keyboard({ language, onAddWord }: KeyboardProps) {
  const [buffer, setBuffer] = useState('');
  const [lastWord, setLastWord] = useState('');
  const [shift, setShift] = useState(false);
  const [symMode, setSymMode] = useState(false);
  const rows = symMode ? SYM_ROWS : language === 'english' ? EN_ROWS : HI_ROWS;

  const vocab = useMemo(() => {
    const set = new Set<string>();
    Object.values(symbols).forEach(list => list.forEach((s: any) => {
      const w = (language === 'english' ? s.en : s.hi) as string | undefined;
      if (w) set.add(w);
    }));
    return Array.from(set);
  }, [language]);

  const words = buffer.split(' ');
  const token = words[words.length - 1] || '';
  const prevWord = (words.length > 1 ? words[words.length - 2] : lastWord).toLowerCase();

  const predictions = useMemo(() => {
    const q = token.toLowerCase();
    if (!q) {
      const next = (language === 'english' ? NEXT_EN : NEXT_HI)[prevWord];
      return next ?? (language === 'english' ? STARTERS_EN : STARTERS_HI);
    }
    const starts = vocab.filter(w => w.toLowerCase().startsWith(q)).sort((a, b) => a.length - b.length);
    const contains = vocab.filter(w => !w.toLowerCase().startsWith(q) && w.toLowerCase().includes(q));
    return Array.from(new Set([...starts, ...contains])).slice(0, 8);
  }, [token, prevWord, vocab, language]);

  const pick = (word: string) => {
    const before = words.slice(0, -1).join(' ');
    onAddWord(((before ? before + ' ' : '') + word).trim());
    setLastWord(word);
    setBuffer('');
    sayKey(word, language);
  };
  const type = (k: string) => {
    const d = shift ? k.toUpperCase() : k;
    setBuffer(p => p + d);
    if (shift) setShift(false);
    sayKey(d, language);
  };
  const submit = () => {
    const t = buffer.trim();
    if (t) { onAddWord(t); setLastWord(t.split(' ').pop() || ''); setBuffer(''); }
  };

  return (
    <div className="keyboard-theme p-2 sm:p-3 space-y-2 rounded-2xl w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 h-11 sm:h-12">
        <span className="flex-1 text-lg sm:text-xl font-bold truncate">{buffer || <span className="text-muted-foreground font-normal text-base">{language === 'english' ? 'Type a word…' : 'शब्द टाइप करें…'}</span>}</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="Word predictions">
        {predictions.map(p => <PredictionChip key={p} word={p} onTap={() => pick(p)} />)}
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-1 sm:gap-2">
            {row.map((key, ki) => {
              if (key === 'SHIFT') return <button key={ki} onClick={() => setShift(!shift)} className={`${keyBase} flex-[1.5] ${shift ? 'ring-2 ring-primary' : ''}`} aria-label="Shift"><ArrowBigUp /></button>;
              if (key === 'BKSP') return <button key={ki} onClick={() => setBuffer(b => b.slice(0, -1))} className={`${keyBase} flex-[1.5]`} aria-label="Backspace"><Delete /></button>;
              const d = shift ? key.toUpperCase() : key;
              return <button key={ki} onClick={() => type(key)} className={`${keyBase} flex-1`}>{d}</button>;
            })}
          </div>
        ))}
        <div className="flex gap-1 sm:gap-2">
          <button onClick={() => setSymMode(!symMode)} className={`${keyBase} flex-[1.5] text-base`}>{symMode ? (language === 'english' ? 'ABC' : 'अ') : '?123'}</button>
          <button onClick={() => type(',')} className={`${keyBase} flex-1`}>,</button>
          <button onClick={() => { setBuffer(p => p + ' '); }} className={`${keyBase} flex-[5] text-base`}>{language === 'english' ? 'space' : 'स्पेस'}</button>
          <button onClick={() => type('.')} className={`${keyBase} flex-1`}>.</button>
          <button onClick={submit} className={`${keyBase} flex-[1.5]`} aria-label="Enter"><CornerDownLeft /></button>
        </div>
      </div>
    </div>
  );
}
