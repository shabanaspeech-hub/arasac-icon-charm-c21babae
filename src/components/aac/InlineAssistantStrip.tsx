import { useMemo } from 'react';
import { Sparkles, ArrowLeft, X } from 'lucide-react';
import { generateSuggestions } from '@/lib/assistantEngine';
import { useChildProfile } from '@/hooks/useChildProfile';
import { VisualSuggestionCard } from './VisualSuggestionCard';

interface Props {
  trigger: string;
  language: 'english' | 'hindi';
  onSpeak: (text: string) => void;
  onAddToBoard?: (text: string) => void;
  onClose?: () => void;
}

export default function InlineAssistantStrip({ trigger, language, onSpeak, onAddToBoard, onClose }: Props) {
  const { profile } = useChildProfile();

  const result = useMemo(() => {
    if (!trigger) return null;
    return generateSuggestions(trigger, profile);
  }, [trigger, profile]);

  if (!profile.assistantEnabled || !trigger || !result) return null;

  const sections: Array<{ label: string; labelHi: string; items: string[]; size: 'sm' | 'md' }> = [
    { label: 'Related Words', labelHi: 'संबंधित शब्द', items: result.relatedWords, size: 'sm' },
    { label: 'Current Level', labelHi: 'वर्तमान स्तर', items: result.currentLevel, size: 'sm' },
    { label: 'Expanded Language', labelHi: 'विस्तृत भाषा', items: result.expandedLanguage, size: 'sm' },
  ];

  const visible = sections.filter(s => s.items.length > 0);
  if (visible.length === 0) return null;

  return (
    <div
      key={trigger /* force fresh mount per selected word */}
      className="bg-gradient-to-r from-primary/5 to-accent/5 border-b-[3px] border-primary/30 p-3 space-y-3"
    >
      <div className="flex items-center gap-2">
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border-2 border-border text-xs font-bold text-foreground hover:bg-secondary"
          >
            <ArrowLeft size={14} /> {language === 'english' ? 'Back' : 'वापस'}
          </button>
        )}
        <Sparkles size={14} className="text-primary" />
        <h3 className="flex-1 text-xs font-bold text-primary uppercase tracking-wide">
          {language === 'english'
            ? `Say more about "${trigger}"`
            : `"${trigger}" के बारे में और कहें`}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close suggestions"
            className="p-2 rounded-full bg-card border-2 border-border text-foreground hover:bg-secondary"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {visible.map((section) => (
        <div key={section.label}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            {language === 'english' ? section.label : section.labelHi}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {section.items.map((text) => (
              <div key={text} className="shrink-0 w-28 sm:w-32">
                <VisualSuggestionCard
                  text={text}
                  size={section.size}
                  onTap={() => { onSpeak(text); onAddToBoard?.(text); }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
