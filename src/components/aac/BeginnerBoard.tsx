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

// Beginner home: basic-need words front and centre, with every folder as a
// picture card beside the board (below it on phones) so a child can jump
// anywhere in one tap — no scrolling ribbon needed.
export default function BeginnerBoard({ language, onSelect, folders }: Props) {
  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base" aria-hidden>🌟</span>
        <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
          {language === 'english' ? "Beginner — Basic Needs" : "शुरुआती — बुनियादी ज़रूरतें"}
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Basic need words */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 flex-1 min-w-0 w-full">
          {BEGINNER_WORDS.map((w) => {
            const text = language === 'english' ? w.en : w.hi;
            return (
              <VisualSuggestionCard
                key={w.en}
                text={text}
                size="md"
                onTap={() => onSelect(w)}
              />
            );
          })}
        </div>

        {/* Folder cards — the way to anywhere in the app */}
        <aside
          aria-label={language === 'english' ? 'Folders' : 'फ़ोल्डर'}
          className="w-full lg:w-[220px] shrink-0 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2"
        >
          {folders.map((f) => (
            <button
              key={f.key}
              onClick={f.onClick}
              aria-current={f.active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border-[3px] min-h-[84px] transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md ${
                f.active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-primary'
              }`}
            >
              <CategoryPictogram categoryKey={f.key} name={f.name} className="!w-9 !h-9" />
              <span className="text-[11px] font-bold text-center leading-tight">{f.name}</span>
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
}
