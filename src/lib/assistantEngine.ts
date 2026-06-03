// Communication Assistant engine.
// V3: Category-aware context-specific suggestions. The engine classifies the
// trigger word (person, emotion, state, action, place, food/drink, object)
// and only emits phrases/sentences that make sense for that category. This
// avoids nonsense combinations like "More Mom" or "Want Sad Please".
//
// Three buckets returned per trigger:
//   - relatedWords:     vocabulary closely tied to the word
//   - currentLevel:     short 2-3 word combinations the child can produce now
//   - expandedLanguage: full sentences modeling next-level grammar
//
// Designed so an AI provider can replace `generateSuggestions` later without
// touching UI consumers.

import type { ChildProfile } from '@/hooks/useChildProfile';

export interface AssistantResult {
  trigger: string;
  relatedWords: string[];
  currentLevel: string[];
  expandedLanguage: string[];
}

type Category = 'person' | 'emotion' | 'state' | 'action' | 'place' | 'food' | 'drink' | 'object' | 'affirm' | 'request' | 'body';

const CATEGORY_MAP: Record<string, Category> = {
  mom: 'person', dad: 'person', mommy: 'person', daddy: 'person', baby: 'person',
  brother: 'person', sister: 'person', friend: 'person', teacher: 'person',
  happy: 'emotion', sad: 'emotion', mad: 'emotion', angry: 'emotion', scared: 'emotion', excited: 'emotion',
  tired: 'state', sleepy: 'state', hungry: 'state', thirsty: 'state', sick: 'state', cold: 'state', hot: 'state',
  eat: 'action', drink: 'action', play: 'action', go: 'action', sleep: 'action', run: 'action', jump: 'action',
  help: 'request', more: 'request', stop: 'request', want: 'request',
  yes: 'affirm', no: 'affirm', ok: 'affirm',
  home: 'place', park: 'place', school: 'place', washroom: 'place', bathroom: 'place', outside: 'place', bed: 'place',
  water: 'drink', milk: 'drink', juice: 'drink', tea: 'drink',
  apple: 'food', banana: 'food', bread: 'food', snack: 'food', food: 'food', lunch: 'food',
  pain: 'body', hurt: 'body', tummy: 'body', head: 'body',
  ball: 'object', car: 'object', toy: 'object', book: 'object', bubbles: 'object',
};

function classify(word: string): Category {
  return CATEGORY_MAP[word.toLowerCase()] || 'object';
}

// Curated overrides for common words (full set when meaningful).
const OVERRIDES: Record<string, Partial<AssistantResult>> = {
  ball: {
    relatedWords: ['Big Ball', 'Red Ball', 'Throw Ball', 'Kick Ball', 'My Ball'],
    currentLevel: ['Want Ball', 'My Ball', 'Throw Ball', 'Play Ball'],
    expandedLanguage: ['I want the ball.', 'Can I have the ball please?', 'Let’s play with the ball.'],
  },
  apple: {
    relatedWords: ['Red Apple', 'Green Apple', 'Eat Apple', 'More Apple', 'Cut Apple'],
    currentLevel: ['Want Apple', 'More Apple', 'Eat Apple'],
    expandedLanguage: ['I want an apple.', 'Can I have an apple please?', 'I like apples.'],
  },
  car: {
    relatedWords: ['Big Car', 'Red Car', 'Fast Car', 'My Car', 'Toy Car'],
    currentLevel: ['My Car', 'Big Car', 'Want Car'],
    expandedLanguage: ['I want the car.', 'Look at my car.', 'Let’s drive the car.'],
  },
  water: {
    relatedWords: ['Cold Water', 'Hot Water', 'More Water', 'Drink Water'],
    currentLevel: ['Want Water', 'More Water', 'Cold Water'],
    expandedLanguage: ['I want water please.', 'Can I have some water?', 'I am thirsty.'],
  },
  milk: {
    relatedWords: ['Cold Milk', 'Warm Milk', 'More Milk', 'Drink Milk'],
    currentLevel: ['Want Milk', 'More Milk', 'Warm Milk'],
    expandedLanguage: ['I want milk please.', 'Can I have some milk?', 'I like warm milk.'],
  },
  juice: {
    relatedWords: ['Apple Juice', 'Cold Juice', 'More Juice', 'Drink Juice'],
    currentLevel: ['Want Juice', 'More Juice', 'Cold Juice'],
    expandedLanguage: ['I want juice please.', 'Can I have apple juice?', 'I like cold juice.'],
  },
  play: {
    relatedWords: ['Ball', 'Bubbles', 'Swing', 'Outside', 'With Me'],
    currentLevel: ['Want Play', 'Play Outside', 'Play With Me', 'Play Ball'],
    expandedLanguage: ['I want to play.', 'Can we play outside?', 'Will you play with me?'],
  },
  eat: {
    relatedWords: ['Apple', 'Snack', 'Lunch', 'Food', 'Hungry'],
    currentLevel: ['Want Eat', 'Eat More', 'Eat Apple', 'I Hungry'],
    expandedLanguage: ['I want to eat.', 'I am hungry.', 'Can I have a snack please?'],
  },
  drink: {
    relatedWords: ['Water', 'Milk', 'Juice', 'Thirsty', 'Cup'],
    currentLevel: ['Want Drink', 'Drink Water', 'Drink Milk', 'I Thirsty'],
    expandedLanguage: ['I want a drink.', 'I am thirsty.', 'Can I have some water please?'],
  },
  go: {
    relatedWords: ['Outside', 'Home', 'Park', 'Car', 'School'],
    currentLevel: ['Go Outside', 'Go Home', 'Go Park', 'Want Go'],
    expandedLanguage: ['I want to go outside.', 'Can we go to the park?', 'Let’s go home now.'],
  },
  sleep: {
    relatedWords: ['Bed', 'Tired', 'Pillow', 'Nap', 'Goodnight'],
    currentLevel: ['Want Sleep', 'I Tired', 'Go Bed'],
    expandedLanguage: ['I want to sleep.', 'I am tired.', 'Time for bed.'],
  },
  happy: {
    relatedWords: ['Smile', 'Fun', 'Laugh', 'Play', 'Hug'],
    currentLevel: ['I Happy', 'So Happy', 'Happy Now'],
    expandedLanguage: ['I am happy.', 'I feel happy today.', 'This makes me happy.'],
  },
  sad: {
    relatedWords: ['Cry', 'Hug', 'Hurt', 'Miss You', 'Help Me'],
    currentLevel: ['I Sad', 'Feel Sad', 'Need Hug'],
    expandedLanguage: ['I am sad.', 'I feel sad right now.', 'Can I have a hug please?'],
  },
  mad: {
    relatedWords: ['Angry', 'Stop', 'Quiet', 'Break', 'Hug'],
    currentLevel: ['I Mad', 'So Mad', 'Need Break'],
    expandedLanguage: ['I am mad.', 'I need a break.', 'Please stop, I am upset.'],
  },
  scared: {
    relatedWords: ['Hug', 'Mom', 'Dad', 'Hide', 'Stop'],
    currentLevel: ['I Scared', 'Hold Me', 'Want Mom'],
    expandedLanguage: ['I am scared.', 'Can you hold me?', 'I feel scared right now.'],
  },
  tired: {
    relatedWords: ['Sleep', 'Bed', 'Rest', 'Nap', 'Sit'],
    currentLevel: ['I Tired', 'Want Rest', 'Need Sleep'],
    expandedLanguage: ['I am tired.', 'I want to rest.', 'Can I take a nap?'],
  },
  hot: {
    relatedWords: ['Hot Food', 'Hot Water', 'Too Hot', 'Warm', 'Fan'],
    currentLevel: ['Too Hot', 'I Hot', 'Hot Food'],
    expandedLanguage: ['I am hot.', 'This is too hot.', 'Can I have something cool?'],
  },
  cold: {
    relatedWords: ['Cold Water', 'Cold Milk', 'Too Cold', 'Ice', 'Blanket'],
    currentLevel: ['Too Cold', 'I Cold', 'Want Blanket'],
    expandedLanguage: ['I am cold.', 'It is too cold.', 'Can I have a blanket please?'],
  },
  mom: {
    relatedWords: ['Hug Mom', 'Love Mom', 'Mom Help', 'Where Mom', 'Mom Come'],
    currentLevel: ['Want Mom', 'Hug Mom', 'Mom Help', 'Where Mom'],
    expandedLanguage: ['I want my mom.', 'Mom, can you help me please?', 'I love you, Mom.', 'Where is mom?'],
  },
  dad: {
    relatedWords: ['Hug Dad', 'Love Dad', 'Dad Help', 'Where Dad', 'Dad Come'],
    currentLevel: ['Want Dad', 'Hug Dad', 'Dad Help', 'Where Dad'],
    expandedLanguage: ['I want my dad.', 'Dad, can you help me please?', 'I love you, Dad.', 'Where is dad?'],
  },
  home: {
    relatedWords: ['Go Home', 'My Home', 'At Home', 'Come Home', 'Stay Home'],
    currentLevel: ['Go Home', 'Want Home', 'My Home'],
    expandedLanguage: ['I want to go home.', 'Let’s go home now.', 'I am at home.'],
  },
  help: {
    relatedWords: ['Help Me', 'Help Please', 'Need Help', 'Help Mom', 'Help Now'],
    currentLevel: ['Help Me', 'Need Help', 'Help Please'],
    expandedLanguage: ['I need help please.', 'Can you help me?', 'Please help me with this.'],
  },
  more: {
    relatedWords: ['More Food', 'More Water', 'More Play', 'More Please', 'A Lot More'],
    currentLevel: ['More Please', 'Want More', 'A Little More'],
    expandedLanguage: ['I want more please.', 'Can I have more?', 'A little more please.'],
  },
  pain: {
    relatedWords: ['Hurt', 'Owie', 'Tummy Pain', 'Head Pain', 'Boo Boo'],
    currentLevel: ['It Hurts', 'I Hurt', 'Help Me'],
    expandedLanguage: ['I have pain.', 'It hurts here.', 'Mom, I am hurting please help.'],
  },
  washroom: {
    relatedWords: ['Potty', 'Pee', 'Poop', 'Wash Hands', 'Toilet'],
    currentLevel: ['Need Potty', 'Go Washroom', 'Wash Hands'],
    expandedLanguage: ['I need the washroom.', 'I have to go potty.', 'Can I wash my hands?'],
  },
  bubbles: {
    relatedWords: ['More Bubbles', 'Big Bubbles', 'Pop Bubbles', 'Blow Bubbles', 'Fun'],
    currentLevel: ['More Bubbles', 'Pop Bubbles', 'Big Bubbles'],
    expandedLanguage: ['I want more bubbles.', 'Can you blow bubbles?', 'Let’s pop the bubbles.'],
  },
  yes: {
    relatedWords: ['Okay', 'Sure', 'I Do', 'Want It', 'Please'],
    currentLevel: ['Yes Please', 'Yes I Do', 'Yes More'],
    expandedLanguage: ['Yes please.', 'Yes, I want that.', 'Yes, I would like more.'],
  },
  no: {
    relatedWords: ['Stop', 'Done', 'All Done', 'Not Now', 'Don’t Like'],
    currentLevel: ['No Thanks', 'All Done', 'Not Now'],
    expandedLanguage: ['No thank you.', 'No, I am all done.', 'No, I don’t want that.'],
  },
};

const PEOPLE = new Set(['mom','dad','mommy','daddy','baby','brother','sister','friend','teacher']);
const ARTICLE_SKIP = new Set(['water','milk','juice','food','help','more','play','sleep','pain','rice','bread','candy']);

function titleCase(s: string): string {
  return s.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w).join(' ');
}

function uniq(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of list) {
    const k = x.toLowerCase();
    if (k && !seen.has(k)) { seen.add(k); out.push(x); }
  }
  return out;
}

function article(word: string): string {
  const lower = word.toLowerCase();
  if (ARTICLE_SKIP.has(lower)) return '';
  return /^[aeiou]/i.test(lower) ? 'an ' : 'a ';
}

// ---- Category-specific generators (used when no override fills a bucket) ----

function genByCategory(word: string, cat: Category): {
  related: string[]; current: string[]; expanded: string[];
} {
  const t = titleCase(word);
  const lower = word.toLowerCase();

  switch (cat) {
    case 'person':
      return {
        related: [`Hug ${t}`, `Love ${t}`, `${t} Help`, `Where ${t}`, `${t} Come`],
        current: [`Want ${t}`, `Hug ${t}`, `${t} Help`],
        expanded: [`I want ${lower}.`, `${t}, can you help me?`, `I love you, ${t}.`],
      };
    case 'emotion':
    case 'state':
      return {
        related: [`I ${t}`, `So ${t}`, `Feel ${t}`, `Very ${t}`],
        current: [`I ${t}`, `Feel ${t}`, `So ${t}`],
        expanded: [`I am ${lower}.`, `I feel ${lower} right now.`, `I am very ${lower}.`],
      };
    case 'action':
      return {
        related: [`Want ${t}`, `${t} More`, `${t} Now`, `${t} Please`],
        current: [`Want ${t}`, `${t} More`, `${t} Now`],
        expanded: [`I want to ${lower}.`, `Can we ${lower}?`, `I would like to ${lower} please.`],
      };
    case 'place':
      return {
        related: [`Go ${t}`, `At ${t}`, `My ${t}`, `Want ${t}`],
        current: [`Go ${t}`, `Want ${t}`, `At ${t}`],
        expanded: [`I want to go to ${lower}.`, `Let’s go to ${lower}.`, `I am at ${lower}.`],
      };
    case 'food':
    case 'drink':
    case 'object':
      return {
        related: [`Big ${t}`, `My ${t}`, `More ${t}`, `Want ${t}`, `${t} Please`],
        current: [`Want ${t}`, `More ${t}`, `My ${t}`],
        expanded: [`I want ${article(lower)}${lower}.`, `Can I have ${article(lower)}${lower} please?`, `I like ${lower}.`],
      };
    case 'request':
      return {
        related: [`${t} Please`, `${t} Me`, `${t} Now`, `Need ${t}`],
        current: [`${t} Please`, `${t} Me`, `Need ${t}`],
        expanded: [`I need ${lower} please.`, `Can you ${lower} me?`, `Please ${lower} now.`],
      };
    case 'affirm':
      return {
        related: [`${t} Please`, `${t} Thanks`, `${t} I Do`],
        current: [`${t} Please`, `${t} Thanks`],
        expanded: [`${t} please.`, `${t}, thank you.`],
      };
    case 'body':
      return {
        related: [`${t} Hurts`, `My ${t}`, `Help ${t}`, `Owie`],
        current: [`${t} Hurts`, `My ${t}`, `Help Me`],
        expanded: [`My ${lower} hurts.`, `I have ${lower}.`, `Please help, my ${lower} hurts.`],
      };
  }
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
  const cat = classify(key);
  const gen = genByCategory(key, cat);
  const override = OVERRIDES[key] || {};

  return scaleForProfile({
    trigger,
    relatedWords: uniq(override.relatedWords ?? gen.related),
    currentLevel: uniq(override.currentLevel ?? gen.current),
    expandedLanguage: uniq(override.expandedLanguage ?? gen.expanded),
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
