// Communication Assistant engine.
// V1: structured developmental suggestions. Designed so an AI provider
// (Lovable AI Gateway, etc.) can be swapped in later by replacing
// `generateSuggestions` without touching UI consumers.

import type { ChildProfile } from '@/hooks/useChildProfile';

export interface SuggestionSet {
  words: string[];
  phrases: string[];
  sentences: string[];
}

export interface AssistantResult {
  currentLevel: SuggestionSet;
  nextLevel: SuggestionSet;
  targets: {
    wordsToLearn: string[];
    phrasesToModel: string[];
    goals: string[];
  };
}

// Curated developmental seed map (English). Words keyed by trigger word/category.
const SEED: Record<string, AssistantResult> = {
  play: {
    currentLevel: {
      words: ['ball', 'bubbles', 'swing', 'outside', 'with'],
      phrases: ['play ball', 'more bubbles', 'go outside'],
      sentences: ['I play.', 'You play.', 'Play more.'],
    },
    nextLevel: {
      words: ['together', 'turn', 'fun', 'friend'],
      phrases: ['my turn', 'your turn', 'play together'],
      sentences: ["I want to play.", "Let's play outside.", 'Play with me.'],
    },
    targets: {
      wordsToLearn: ['turn', 'together', 'friend'],
      phrasesToModel: ['my turn please', 'play with friend'],
      goals: ['Use 3-word combinations during play'],
    },
  },
  eat: {
    currentLevel: {
      words: ['food', 'more', 'apple', 'water', 'hungry'],
      phrases: ['more food', 'eat apple', 'want water'],
      sentences: ['I eat.', 'Eat more.', 'I want food.'],
    },
    nextLevel: {
      words: ['snack', 'lunch', 'tasty', 'finished'],
      phrases: ['I am hungry', 'all finished', 'tasty snack'],
      sentences: ['I want a snack.', 'I am all finished.', 'Can I have water please?'],
    },
    targets: {
      wordsToLearn: ['hungry', 'finished', 'please'],
      phrasesToModel: ['I am hungry', 'all done'],
      goals: ['Request food using 3+ word phrase'],
    },
  },
  drink: {
    currentLevel: {
      words: ['water', 'milk', 'juice', 'more', 'cup'],
      phrases: ['more water', 'want milk', 'my cup'],
      sentences: ['I drink.', 'Want juice.', 'Drink water.'],
    },
    nextLevel: {
      words: ['thirsty', 'cold', 'warm', 'empty'],
      phrases: ['I am thirsty', 'cup is empty', 'more please'],
      sentences: ['I want some water.', 'My cup is empty.', 'Can I have milk please?'],
    },
    targets: {
      wordsToLearn: ['thirsty', 'empty', 'please'],
      phrasesToModel: ['cup empty', 'I thirsty'],
      goals: ['Express need with feeling word'],
    },
  },
  feelings: {
    currentLevel: {
      words: ['happy', 'sad', 'mad', 'tired', 'scared'],
      phrases: ['I happy', 'I sad', 'feel tired'],
      sentences: ['I feel happy.', 'I am sad.', 'I am tired.'],
    },
    nextLevel: {
      words: ['because', 'frustrated', 'excited', 'calm'],
      phrases: ['feel happy because', 'I am excited', 'help me calm'],
      sentences: ['I feel sad because I miss you.', 'I am excited to play.', 'Please help me feel calm.'],
    },
    targets: {
      wordsToLearn: ['because', 'frustrated', 'excited'],
      phrasesToModel: ['I feel ___ because ___'],
      goals: ['Name feeling + state cause'],
    },
  },
  go: {
    currentLevel: {
      words: ['outside', 'home', 'park', 'car', 'school'],
      phrases: ['go outside', 'go home', 'go park'],
      sentences: ['I go.', 'Go now.', 'Go outside.'],
    },
    nextLevel: {
      words: ['later', 'now', 'with', 'after'],
      phrases: ['go to park', 'go with you', 'go after lunch'],
      sentences: ['I want to go outside.', 'Can we go to the park?', "Let's go home now."],
    },
    targets: {
      wordsToLearn: ['later', 'after', 'with'],
      phrasesToModel: ['go with mommy', 'go later'],
      goals: ['Use prepositions in 4-word phrase'],
    },
  },
  default: {
    currentLevel: {
      words: ['want', 'more', 'help', 'stop', 'please'],
      phrases: ['want more', 'help me', 'stop please'],
      sentences: ['I want it.', 'Help me please.', 'I need more.'],
    },
    nextLevel: {
      words: ['could', 'would', 'maybe', 'later'],
      phrases: ['could I have', 'maybe later', 'help me please'],
      sentences: ['Could I have some please?', 'I would like more.', 'Can you help me please?'],
    },
    targets: {
      wordsToLearn: ['please', 'could', 'would'],
      phrasesToModel: ['could I please', 'I would like'],
      goals: ['Add politeness markers'],
    },
  },
};

function pickLevels(profile: ChildProfile, base: AssistantResult): AssistantResult {
  // AAC level 1-2: trim to short words/phrases; 4-5: prefer full sentences.
  if (profile.aacLevel <= 2) {
    return {
      currentLevel: {
        words: base.currentLevel.words.slice(0, 4),
        phrases: base.currentLevel.phrases.slice(0, 3),
        sentences: base.currentLevel.sentences.slice(0, 2),
      },
      nextLevel: {
        words: base.nextLevel.words.slice(0, 3),
        phrases: base.nextLevel.phrases.slice(0, 2),
        sentences: base.nextLevel.sentences.slice(0, 2),
      },
      targets: base.targets,
    };
  }
  return base;
}

export function generateSuggestions(
  trigger: string,
  profile: ChildProfile,
): AssistantResult {
  const key = trigger.toLowerCase().trim();
  const base = SEED[key] || SEED.default;
  return pickLevels(profile, base);
}

// Parent/therapist free-text need -> suggestions.
// Simple keyword extraction in v1; ready for AI swap.
export function generateFromNeed(need: string, profile: ChildProfile): AssistantResult {
  const lower = need.toLowerCase();
  const keys = Object.keys(SEED).filter(k => k !== 'default' && lower.includes(k));
  const trigger = keys[0] || 'default';
  const base = generateSuggestions(trigger, profile);

  // Lightly customise sentences with verbs found in `need`.
  const customSentences: string[] = [];
  const m = lower.match(/want[s]? to ([a-z ]+?)(?:\.|,|$| outside| inside| with)/);
  if (m) {
    const action = m[1].trim();
    customSentences.push(`I want to ${action}.`);
    customSentences.push(`Can we ${action} now?`);
    customSentences.push(`Let's ${action} together.`);
  }
  if (customSentences.length) {
    return {
      ...base,
      nextLevel: {
        ...base.nextLevel,
        sentences: [...customSentences, ...base.nextLevel.sentences].slice(0, 4),
      },
    };
  }
  return base;
}
