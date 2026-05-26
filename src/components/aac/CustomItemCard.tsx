import { useRef } from 'react';
import { Pencil, Trash2, Star } from 'lucide-react';
import type { CustomItem } from '@/lib/customStore';

interface CustomItemCardProps {
  item: CustomItem;
  language: 'english' | 'hindi';
  editMode: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLongPress?: () => void;
  isFavorite?: boolean;
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

export default function CustomItemCard({ item, language, editMode, onClick, onEdit, onDelete, onLongPress, isFavorite }: CustomItemCardProps) {
  const text = language === 'english' ? item.label : item.labelHi;
  const cardClass = colorClassMap[item.wordType] || 'border-border bg-card';

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);
  const startPress = () => {
    if (!onLongPress) return;
    longPressedRef.current = false;
    timerRef.current = setTimeout(() => { longPressedRef.current = true; onLongPress(); }, 500);
  };
  const cancelPress = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  const handleClick = () => {
    if (longPressedRef.current) { longPressedRef.current = false; return; }
    onClick();
  };

  return (
    <div className="relative h-full w-full">
      <button
        onClick={handleClick}
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchCancel={cancelPress}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative flex flex-col items-center justify-center p-2 rounded-xl border-[3px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 w-full h-full min-h-[110px] ${cardClass}`}
      >
        {isFavorite && (
          <Star size={16} className="absolute top-1.5 right-1.5 fill-warning text-warning" />
        )}
        <div className="flex-1 w-full flex items-center justify-center min-h-0 mb-1">
          <img src={item.imageData} alt={item.label} draggable={false} className="max-w-full max-h-full object-cover rounded-lg pointer-events-none" />
        </div>
        <span className="text-sm sm:text-base font-bold text-foreground text-center leading-tight">{text}</span>
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
