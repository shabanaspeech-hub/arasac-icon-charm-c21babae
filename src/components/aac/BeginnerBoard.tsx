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

// Beginner home: folder strip on top, 16 basic-need words filling the rest of
// the screen (4x4 on every device) so nothing needs scrolling.
export default function BeginnerBoard({ language, onSelect, folders }: Props) {
  return (
    <div className="h-full min-h-0 flex flex-col gap-2">
      <aside
        aria-label={language === 'english' ? 'Folders' : 'फ़ोल्डर'}
        className="shrink-0 w-full flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {folders.map((f) => (
          <button
            key={f.key}
            onClick={f.onClick}
            aria-current={f.active ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 p-1.5 shrink-0 w-[76px] rounded-2xl border-2 h-[68px] transition-all active:scale-95 ${
              f.active ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary'
            }`}
          >
            <CategoryPictogram categoryKey={f.key} name={f.name} className="!w-8 !h-8" />
            <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{f.name}</span>
          </button>
        ))}
      </aside>

      <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-4 gap-2 w-full">
        {BEGINNER_WORDS.map((w) => (
          <VisualSuggestionCard
            key={w.en}
            text={language === 'english' ? w.en : w.hi}
            picture={w.en}
            size="md"
            onTap={() => onSelect(w)}
          />
        ))}
      </div>
    </div>
  );
}
