import { useState, useMemo, useEffect, type ReactNode } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import type { GridSize } from '@/hooks/useGridSize';

// rows x cols per page so cards fill the whole screen evenly
const LAYOUT: Record<number, string> = {
  4: 'grid-cols-2 grid-rows-2',
  6: 'grid-cols-2 grid-rows-3 sm:grid-cols-3 sm:grid-rows-2',
  8: 'grid-cols-2 grid-rows-4 sm:grid-cols-4 sm:grid-rows-2',
  12: 'grid-cols-3 grid-rows-4 sm:grid-cols-4 sm:grid-rows-3',
  15: 'grid-cols-3 grid-rows-5 sm:grid-cols-5 sm:grid-rows-3',
  18: 'grid-cols-3 grid-rows-6 sm:grid-cols-6 sm:grid-rows-3',
};

export interface PagedGridItem {
  id: string;
  render: () => ReactNode;
}

interface Props {
  items: PagedGridItem[];
  gridSize: GridSize;
  storageKey: string;
  trailing?: ReactNode; // e.g. "Add item" tile, never draggable
}

function Cell({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative h-full w-full touch-none"
      {...attributes}
      {...listeners}
    >
      {children}
      <GripVertical
        size={14}
        className="absolute bottom-1 right-1 text-muted-foreground/40 pointer-events-none"
      />
    </div>
  );
}

function useOrderedIds(key: string, currentIds: string[]) {
  const storageKey = `spectra-order-${key}`;
  const [order, setOrder] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Reconcile stored order with current items
  const merged = useMemo(() => {
    const set = new Set(currentIds);
    const kept = order.filter((id) => set.has(id));
    const added = currentIds.filter((id) => !kept.includes(id));
    return [...kept, ...added];
  }, [order, currentIds.join('|')]);

  useEffect(() => {
    if (merged.join('|') !== order.join('|')) {
      setOrder(merged);
      localStorage.setItem(storageKey, JSON.stringify(merged));
    }
  }, [merged.join('|')]);

  // Reload order when category (key) changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setOrder(Array.isArray(parsed) ? parsed : []);
    } catch {
      setOrder([]);
    }
  }, [storageKey]);

  const save = (next: string[]) => {
    setOrder(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };
  return [merged, save] as const;
}

export default function PagedGrid({ items, gridSize, storageKey, trailing }: Props) {
  const currentIds = items.map((i) => i.id);
  const [order, setOrder] = useOrderedIds(storageKey, currentIds);
  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const orderedItems = order
    .map((id) => itemMap.get(id))
    .filter(Boolean) as PagedGridItem[];

  const perPage = gridSize;
  const trailingExtra = trailing ? 1 : 0;
  const totalPages = Math.max(
    1,
    Math.ceil((orderedItems.length + trailingExtra) / perPage)
  );
  const [page, setPage] = useState(0);
  const safePage = Math.min(page, totalPages - 1);
  useEffect(() => {
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [totalPages, page]);

  // Slice with trailing tile appended at the very end
  const flat: Array<{ kind: 'item'; entry: PagedGridItem } | { kind: 'trailing' }> = [
    ...orderedItems.map((entry) => ({ kind: 'item' as const, entry })),
    ...(trailing ? [{ kind: 'trailing' as const }] : []),
  ];
  const start = safePage * perPage;
  const pageSlice = flat.slice(start, start + perPage);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 600, tolerance: 8 } })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    setOrder(arrayMove(order, oldIndex, newIndex));
  };

  const layout = LAYOUT[gridSize] || LAYOUT[12];
  const sortableIds = pageSlice
    .filter((s) => s.kind === 'item')
    .map((s) => (s as { kind: 'item'; entry: PagedGridItem }).entry.id);

  return (
    <div className="p-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
          <div className={`grid ${layout} gap-3 h-[70vh] min-h-[380px]`}>
            {pageSlice.map((slot, i) =>
              slot.kind === 'item' ? (
                <Cell key={slot.entry.id} id={slot.entry.id}>
                  {slot.entry.render()}
                </Cell>
              ) : (
                <div key={`trail-${i}`} className="h-full w-full">
                  {trailing}
                </div>
              )
            )}
          </div>
        </SortableContext>
      </DndContext>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="p-3 rounded-full bg-secondary text-foreground disabled:opacity-30 shadow active:scale-95"
            aria-label="Previous page"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === safePage ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-muted-foreground min-w-[3rem] text-center">
            {safePage + 1}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            className="p-3 rounded-full bg-secondary text-foreground disabled:opacity-30 shadow active:scale-95"
            aria-label="Next page"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </div>
  );
}
