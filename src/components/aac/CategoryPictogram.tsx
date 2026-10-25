import { useArasaacPictogram, getArasaacImageUrl } from '@/hooks/useArasaac';

// Curated ARASAAC search keyword per category — pictures a child recognises instantly.
const KEYWORDS: Record<string, string> = {
  '__beginner': 'eat',      // Basic Needs
  '__fav': 'heart',         // Favorites
  core: 'talk',             // Core Words
  pronouns: 'people',
  adjectives: 'big',
  feelings: 'happy',
  food: 'apple',
  people: 'family',
  actions: 'run',
  places: 'house',
  body: 'hand',
  needs: 'help',
  animals: 'dog',
  colors: 'rainbow',
  numbers: 'number',
  school: 'school',
  toys: 'ball',
  keyboard: 'computer',
};

// Emoji shown only while loading or if ARASAAC has no match.
const FALLBACK: Record<string, string> = {
  '__beginner': '🌟',
  '__fav': '⭐',
  core: '⭐',
  pronouns: '👥',
  adjectives: '📝',
  feelings: '😊',
  food: '🍽️',
  people: '👨‍👩‍👧',
  actions: '🏃',
  places: '📍',
  body: '🧑',
  needs: '🆘',
  animals: '🐾',
  colors: '🎨',
  numbers: '🔢',
  school: '🏫',
  toys: '🧸',
  keyboard: '⌨️',
};

interface CategoryPictogramProps {
  categoryKey: string;
  /** Category name used for lookup when no curated keyword exists (e.g. custom folders). */
  name?: string;
  className?: string;
}

function keywordFor(key: string, name?: string): string {
  const curated = KEYWORDS[key];
  if (curated) return curated;
  if (name) {
    // strip leading emoji/punctuation from folder labels like "📷 Photos"
    const cleaned = name.replace(/^[^\w\u0900-\u097F]+\s*/u, '').trim().toLowerCase();
    if (cleaned) return cleaned.split(/\s+/)[0];
  }
  return key;
}

export default function CategoryPictogram({ categoryKey, name, className = '' }: CategoryPictogramProps) {
  const keyword = keywordFor(categoryKey, name);
  const { data: pictogramId } = useArasaacPictogram(keyword);

  if (pictogramId) {
    return (
      <img
        src={getArasaacImageUrl(pictogramId)}
        alt=""
        aria-hidden
        draggable={false}
        loading="lazy"
        className={`w-6 h-6 object-contain pointer-events-none shrink-0 ${className}`}
      />
    );
  }

  return (
    <span aria-hidden className={`text-lg leading-none shrink-0 ${className}`}>
      {FALLBACK[categoryKey] ?? '📁'}
    </span>
  );
}
