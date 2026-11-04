import { VisualSuggestionCard } from './VisualSuggestionCard';
import CategoryPictogram from './CategoryPictogram';

export interface BeginnerWord {
  en: string;
  hi: string;
}

export const BEGINNER_WORDS: BeginnerWord[] = [
  { en: 'Eat',      hi: 'खाना' },
  { en: 'Drink',    hi: 'पीना' },
  { en: 'Sleep',    hi: 'सोना' },
  { en: 'Play',     hi: 'खेलना' },
  { en: 'Pain',     hi: 'दर्द' },
  { en: 'Mom',      hi: 'माँ' },
  { en: 'Dad',      hi: 'पापा' },
  { en: 'Home',     hi: 'घर' },
  { en: 'Yes',      hi: 'हाँ' },
  { en: 'No',       hi: 'नहीं' },
  { en: 'Washroom', hi: 'शौचालय' },
  { en: 'Help',     hi: 'मदद' },
  { en: 'More',     hi: 'और' },
  { en: 'Go',       hi: 'जाओ' },
  { en: 'Happy',    hi: 'खुश' },
  { en: 'Sad',      hi: 'उदास' },
];

export interface BeginnerFolder {
  key: string;
  name: string;
  active: boolean;
  onClick: () => void;
}

interface Props {
  language: 'english' | 'hindi';
  onSelect: (word: BeginnerWord) => void;
  folders: BeginnerFolder[];
}

// Avaz-style home: basic-need words first, then every category as a big
// folder card in the same grid, all cards the same size.
export default function BeginnerBoard({ language, onSelect, folders }: Props) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 auto-rows-[minmax(110px,1fr)] sm:auto-rows-[minmax(130px,1fr)] gap-1.5 sm:gap-2 w-full">
      {BEGINNER_WORDS.map((w) => (
        <VisualSuggestionCard
          key={w.en}
          text={language === 'english' ? w.en : w.hi}
          picture={w.en}
          size="md"
          onTap={() => onSelect(w)}
        />
      ))}
      {folders.map((f) => (
        <button
          key={f.key}
          onClick={f.onClick}
          className="relative flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl border-2 border-success/50 bg-success/15 hover:border-success active:scale-95 transition-all"
        >
          <span aria-hidden className="absolute -top-0.5 left-3 w-10 h-2 rounded-t-md bg-success/60" />
          <CategoryPictogram categoryKey={f.key} name={f.name} className="!w-16 !h-16 sm:!w-20 sm:!h-20" />
          <span className="text-xs sm:text-sm font-extrabold uppercase text-center leading-tight w-full truncate">{f.name}</span>
        </button>
      ))}
    </div>
  );
}
