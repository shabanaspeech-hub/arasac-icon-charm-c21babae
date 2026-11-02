import { useMemo } from 'react';
import { Sparkles, ArrowLeft, X } from 'lucide-react';
import { generateSuggestions } from '@/lib/assistantEngine';
import { generateHindiSuggestions } from '@/lib/assistantHindi';
import { useChildProfile } from '@/hooks/useChildProfile';
import { VisualSuggestionCard } from './VisualSuggestionCard';

interface Props {
  trigger: string;
  language: 'english' | 'hindi';
  onSpeak: (text: string) => void;
  onAddToBoard?: (text: string) => void;
  onClose?: () => void;
  onTurnOff?: () => void;
}

type Item = { text: string; pic?: string };

export default function InlineAssistantStrip({ trigger, language, onSpeak, onAddToBoard, onClose, onTurnOff }: Props) {
  const { profile } = useChildProfile();

  const result = useMemo(() => {
    if (!trigger) return null;
    if (language === 'hindi') return generateHindiSuggestions(trigger);
    const r = generateSuggestions(trigger, profile);
    const m = (l: string[]): Item[] => l.map(text => ({ text }));
    return { relatedWords: m(r.relatedWords), currentLevel: m(r.currentLevel), expandedLanguage: m(r.expandedLanguage) };
  }, [trigger, profile, language]);

  if (!profile.assistantEnabled || !trigger || !result) return null;

  const sections: Array<{ label: string; labelHi: string; items: Item[] }> = [
    { label: 'Related Words', labelHi: 'संबंधित शब्द', items: result.relatedWords },
    { label: 'Current Level', labelHi: 'वर्तमान स्तर', items: result.currentLevel },
    { label: 'Expanded Language', labelHi: 'विस्तृत भाषा', items: result.expandedLanguage },
  ];

  const visible = sections.filter(s => s.items.length > 0);
  if (visible.length === 0) return null;
  const en = language === 'english';

  return (
    <div key={trigger} className="bg-gradient-to-r from-primary/5 to-accent/5 border-b-[3px] border-primary/30 p-3 space-y-3">
      <div className="flex items-center gap-2">
        {onClose && (
          <button onClick={onClose} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border-2 border-border text-xs font-bold text-foreground hover:bg-secondary">
            <ArrowLeft size={14} /> {en ? 'Back' : 'वापस'}
          </button>
        )}
        <Sparkles size={14} className="text-primary" />
        <h3 className="flex-1 text-xs font-bold text-primary uppercase tracking-wide truncate">
          {en ? `Say more about "${trigger}"` : 'और कहें'}
        </h3>
        {onTurnOff && (
          <button onClick={onTurnOff} className="px-3 py-1.5 rounded-full bg-card border-2 border-border text-xs font-bold hover:bg-secondary">
            {en ? 'Turn off' : 'बंद करें'}
          </button>
        )}
        {onClose && (
          <button onClick={onClose} aria-label="Close suggestions" className="p-2 rounded-full bg-card border-2 border-border text-foreground hover:bg-secondary">
            <X size={16} />
          </button>
        )}
      </div>

      {visible.map((section) => (
        <div key={section.label}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            {en ? section.label : section.labelHi}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {section.items.map((it) => (
              <div key={it.text} className="shrink-0 w-28 sm:w-32">
                <VisualSuggestionCard
                  text={it.text}
                  picture={it.pic}
                  size="sm"
                  onTap={() => { if (onAddToBoard) onAddToBoard(it.text); else onSpeak(it.text); }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
