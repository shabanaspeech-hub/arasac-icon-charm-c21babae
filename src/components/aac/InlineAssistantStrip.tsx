import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { generateSuggestions } from '@/lib/assistantEngine';
import { useChildProfile } from '@/hooks/useChildProfile';
import { VisualSuggestionCard } from './VisualSuggestionCard';

interface Props {
  trigger: string;
  language: 'english' | 'hindi';
  onSpeak: (text: string) => void;
  onAddToBoard?: (text: string) => void;
}

/**
 * Inline Communication Expansion Area.
 * Renders directly under the sentence strip when assistant is ON.
 * No popups, no navigation – picture-first AAC cards expanding the
 * child's last selected word.
 */
export default function InlineAssistantStrip({ trigger, language, onSpeak, onAddToBoard }: Props) {
  const { profile } = useChildProfile();

  const result = useMemo(() => {
    if (!trigger) return null;
    return generateSuggestions(trigger, profile);
  }, [trigger, profile]);

  if (!profile.assistantEnabled || !trigger || !result) return null;

  // Combine current + next-level into a single picture row, dedup, cap.
  const items = Array.from(new Set([
    ...result.currentLevel.phrases,
    ...result.currentLevel.words,
    ...result.nextLevel.phrases,
    ...result.nextLevel.sentences,
  ])).slice(0, 8);

  if (items.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-b-[3px] border-primary/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} className="text-primary" />
        <h3 className="text-xs font-bold text-primary uppercase tracking-wide">
          {language === 'english' ? `Say more about "${trigger}"` : `"${trigger}" के बारे में और कहें`}
        </h3>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((text) => (
          <div key={text} className="shrink-0 w-28 sm:w-32">
            <VisualSuggestionCard
              text={text}
              size="sm"
              onTap={() => { onSpeak(text); onAddToBoard?.(text); }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
