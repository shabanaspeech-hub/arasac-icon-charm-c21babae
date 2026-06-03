// Communication Assistant engine.
// V2: Context-specific dynamic suggestions. For any selected word the engine
// produces three buckets:
//   - relatedWords: vocabulary closely tied to the word (descriptor+word, action+word, variants)
//   - currentLevel: short 2-word combinations the child can produce now
//   - expandedLanguage: full sentences modeling next-level grammar
// Designed so an AI provider can replace `generateSuggestions` later without
// touching UI consumers.

import type { ChildProfile } from '@/hooks/useChildProfile';

export interface AssistantResult {
  trigger: string;
  relatedWords: string[];
  currentLevel: string[];
  expandedLanguage: string[];
}

// Curated overrides for common nouns/verbs/descriptors. When present these
// take priority over the generic templates below.
const OVERRIDES: Record<string, Partial<AssistantResult>> = {
  ball:    { relatedWords: ['Big Ball', 'Red Ball', 'Throw Ball', 'Kick Ball', 'My Ball'] },
  apple:   { relatedWords: ['Red Apple', 'Green Apple', 'Eat Apple', 'More Apple', 'Cut Apple'] },
  car:     { relatedWords: ['Big Car', 'Red Car', 'Fast Car', 'My Car', 'Toy Car'] },
  water:   { relatedWords: ['Cold Water', 'Hot Water', 'More Water', 'Drink Water', 'My Water'] },
  milk:    { relatedWords: ['Cold Milk', 'Warm Milk', 'More Milk', 'Drink Milk', 'My Milk'] },
  juice:   { relatedWords: ['Apple Juice', 'Cold Juice', 'More Juice', 'Drink Juice', 'My Juice'] },
  play:    { relatedWords: ['Ball', 'Bubbles', 'Swing', 'Outside', 'With Me'] },
  eat:     { relatedWords: ['Apple', 'Snack', 'Lunch', 'More Food', 'Hungry'] },
  drink:   { relatedWords: ['Water', 'Milk', 'Juice', 'More', 'Thirsty'] },
  go:      { relatedWords: ['Outside', 'Home', 'Park', 'Car', 'School'] },
  sleep:   { relatedWords: ['Bed', 'Tired', 'Pillow', 'Nap', 'Goodnight'] },
  happy:   { relatedWords: ['Smile', 'Fun', 'Laugh', 'Play', 'Hug'] },
  sad:     { relatedWords: ['Cry', 'Hug', 'Hurt', 'Miss You', 'Help Me'] },
  big:     { relatedWords: ['Big Ball', 'Big Car', 'Big House', 'Bigger', 'Biggest'] },
  small:   { relatedWords: ['Small Ball', 'Small Car', 'Tiny', 'Little', 'Smaller'] },
  hot:     { relatedWords: ['Hot Food', 'Hot Water', 'Hot Tea', 'Too Hot', 'Warm'] },
  cold:    { relatedWords: ['Cold Water', 'Cold Milk', 'Too Cold', 'Ice', 'Cool'] },
  mom:     { relatedWords: ['Love Mom', 'Hug Mom', 'Mom Help', 'Where Mom', 'Mom Come'] },
  dad:     { relatedWords: ['Love Dad', 'Hug Dad', 'Dad Help', 'Where Dad', 'Dad Come'] },
  home:    { relatedWords: ['Go Home', 'My Home', 'At Home', 'Come Home', 'Stay Home'] },
  help:    { relatedWords: ['Help Me', 'Help Please', 'Need Help', 'Help Mom', 'Help Now'] },
  more:    { relatedWords: ['More Food', 'More Water', 'More Play', 'More Please', 'A Lot More'] },
  pain:    { relatedWords: ['Hurt', 'Owie', 'Tummy Pain', 'Head Pain', 'Boo Boo'] },
  washroom:{ relatedWords: ['Potty', 'Pee', 'Poop', 'Wash Hands', 'Need Toilet'] },
  bubbles: { relatedWords: ['More Bubbles', 'Big Bubbles', 'Pop Bubbles', 'Blow Bubbles', 'Fun'] },
};

// Words that work well as descriptors prefix.
const DESCRIPTORS = ['big', 'small', 'red', 'blue', 'hot', 'cold', 'soft', 'fast'];
const ACTIONS = ['want', 'eat', 'play', 'see', 'have', 'give', 'make', 'open'];
const NEEDS_ARTICLE = (w: string) => !['water','milk','juice','food','help','more','play','sleep','pain'].includes(w.toLowerCase());

function titleCase(s: string): string {
  return s.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w).join(' ');
}

function uniq(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of list) {
    const k = x.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(x); }
  }
  return out;
}

function buildRelatedWords(word: string): string[] {
  const w = word.toLowerCase();
  const t = titleCase(w);
  const out = [
    `Big ${t}`,
    `My ${t}`,
    `More ${t}`,
    `Want ${t}`,
    `${t} Please`,
  ];
  return out;
}

function buildCurrent(word: string): string[] {
  const t = titleCase(word);
  return uniq([
    `Want ${t}`,
    `More ${t}`,
    `My ${t}`,
    `${t} Please`,
  ]);
}

function buildExpanded(word: string): string[] {
  const t = titleCase(word);
  const lower = word.toLowerCase();
  const article = NEEDS_ARTICLE(lower) ? (/^[aeiou]/i.test(lower) ? 'an ' : 'a ') : '';
  return uniq([
    `I want ${article}${lower}.`,
    `Can I have ${article}${lower} please?`,
    `I like ${article}${lower}.`,
    `Give me ${article}${lower}.`,
  ]);
}

function scaleForProfile(result: AssistantResult, profile: ChildProfile): AssistantResult {
  if (profile.aacLevel <= 2) {
    return {
      ...result,
      relatedWords: result.relatedWords.slice(0, 4),
      currentLevel: result.currentLevel.slice(0, 3),
      expandedLanguage: result.expandedLanguage.slice(0, 2),
    };
  }
  return {
    ...result,
    relatedWords: result.relatedWords.slice(0, 6),
    currentLevel: result.currentLevel.slice(0, 4),
    expandedLanguage: result.expandedLanguage.slice(0, 4),
  };
}

export function generateSuggestions(trigger: string, profile: ChildProfile): AssistantResult {
  const key = trigger.toLowerCase().trim();
  if (!key) {
    return { trigger, relatedWords: [], currentLevel: [], expandedLanguage: [] };
  }
  const override = OVERRIDES[key] || {};
  const related = override.relatedWords ?? buildRelatedWords(key);
  const current = override.currentLevel ?? buildCurrent(key);
  const expanded = override.expandedLanguage ?? buildExpanded(key);

  return scaleForProfile({
    trigger,
    relatedWords: uniq(related),
    currentLevel: uniq(current),
    expandedLanguage: uniq(expanded),
  }, profile);
}

// Parent/therapist free-text -> suggestions about the most meaningful noun.
export function generateFromNeed(need: string, profile: ChildProfile): AssistantResult {
  const lower = need.toLowerCase().replace(/[.,!?]/g, '');
  const words = lower.split(/\s+/).filter(Boolean);
  const skip = new Set(['i','a','an','the','my','your','want','wants','to','for','with','some','please','can','could','would']);
  const trigger = words.find(w => !skip.has(w) && w.length > 2) || words[0] || 'help';
  return generateSuggestions(trigger, profile);
}
