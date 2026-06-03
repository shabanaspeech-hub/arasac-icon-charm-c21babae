import { VisualSuggestionCard } from './VisualSuggestionCard';

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

interface Props {
  language: 'english' | 'hindi';
  onSelect: (word: BeginnerWord) => void;
}

export default function BeginnerBoard({ language, onSelect }: Props) {
  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🌟</span>
        <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
          {language === 'english' ? "Beginner — Basic Needs" : "शुरुआती — बुनियादी ज़रूरतें"}
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
    </div>
  );
}
