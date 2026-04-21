import { Pencil, Trash2 } from 'lucide-react';
import type { CustomItem } from '@/lib/customStore';

interface CustomItemCardProps {
  item: CustomItem;
  language: 'english' | 'hindi';
  editMode: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const colorClassMap: Record<string, string> = {
  core: 'aac-card-core',
  noun: 'aac-card-noun',
  verb: 'aac-card-verb',
  descriptor: 'aac-card-descriptor',
  preposition: 'aac-card-preposition',
  question: 'aac-card-question',
  negation: 'aac-card-negation',
  feeling: 'aac-card-feeling',
  social: 'aac-card-social',
  misc: 'aac-card-misc',
};

export default function CustomItemCard({ item, language, editMode, onClick, onEdit, onDelete }: CustomItemCardProps) {
  const text = language === 'english' ? item.label : item.labelHi;
  const cardClass = colorClassMap[item.wordType] || 'border-border bg-card';

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`relative flex flex-col items-center p-3 rounded-xl border-[3px] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 w-full ${cardClass}`}
      >
        <div className="w-16 h-16 flex items-center justify-center mb-1">
          <img src={item.imageData} alt={item.label} className="w-full h-full object-cover rounded-lg" />
        </div>
        <span className="text-sm font-bold text-foreground text-center leading-tight">{text}</span>
      </button>

      {editMode && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          <button onClick={onEdit} className="p-1.5 bg-primary text-primary-foreground rounded-full shadow-md hover:scale-110 transition-transform">
            <Pencil size={12} />
          </button>
          <button onClick={onDelete} className="p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-md hover:scale-110 transition-transform">
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
