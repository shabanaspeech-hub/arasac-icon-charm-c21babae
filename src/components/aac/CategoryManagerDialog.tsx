import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import type { CustomCategory } from '@/lib/customStore';

interface CategoryManagerDialogProps {
  open: boolean;
  onClose: () => void;
  categories: CustomCategory[];
  onAdd: (nameEn: string, nameHi: string, emoji: string) => Promise<void>;
  onRename: (id: string, nameEn: string, nameHi: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function CategoryManagerDialog({ open, onClose, categories, onAdd, onRename, onDelete }: CategoryManagerDialogProps) {
  const [newNameEn, setNewNameEn] = useState('');
  const [newNameHi, setNewNameHi] = useState('');
  const [newEmoji, setNewEmoji] = useState('📁');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameEn, setEditNameEn] = useState('');
  const [editNameHi, setEditNameHi] = useState('');

  const handleAdd = async () => {
    if (!newNameEn.trim()) return;
    await onAdd(newNameEn.trim(), newNameHi.trim() || newNameEn.trim(), newEmoji);
    setNewNameEn('');
    setNewNameHi('');
    setNewEmoji('📁');
  };

  const handleRename = async (id: string) => {
    if (!editNameEn.trim()) return;
    await onRename(id, editNameEn.trim(), editNameHi.trim() || editNameEn.trim());
    setEditingId(null);
  };

  const startEdit = (cat: CustomCategory) => {
    setEditingId(cat.id);
    setEditNameEn(cat.nameEn.replace(/^[^\w]*\s/, ''));
    setEditNameHi(cat.nameHi.replace(/^[^\w]*\s/, ''));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">📁 Manage Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Add new */}
          <div className="space-y-2 p-3 bg-secondary rounded-lg">
            <p className="text-xs font-bold text-muted-foreground">Add New Category</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newEmoji}
                onChange={e => setNewEmoji(e.target.value)}
                className="w-12 p-2 border-2 border-border rounded-lg bg-card text-foreground text-center focus:border-primary focus:outline-none"
                maxLength={2}
              />
              <input
                type="text"
                value={newNameEn}
                onChange={e => setNewNameEn(e.target.value)}
                placeholder="English name"
                className="flex-1 p-2 border-2 border-border rounded-lg bg-card text-foreground text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <input
              type="text"
              value={newNameHi}
              onChange={e => setNewNameHi(e.target.value)}
              placeholder="Hindi name (optional)"
              className="w-full p-2 border-2 border-border rounded-lg bg-card text-foreground text-sm focus:border-primary focus:outline-none"
            />
            <button onClick={handleAdd} disabled={!newNameEn.trim()} className="w-full py-2 bg-success text-success-foreground rounded-lg font-bold text-sm disabled:opacity-50">
              <Plus size={14} className="inline mr-1" /> Add Category
            </button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border">
                {editingId === cat.id ? (
                  <>
                    <input value={editNameEn} onChange={e => setEditNameEn(e.target.value)} className="flex-1 p-1.5 border border-border rounded text-sm bg-card" />
                    <button onClick={() => handleRename(cat.id)} className="p-1.5 bg-success text-success-foreground rounded"><Check size={14} /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-muted text-foreground rounded"><X size={14} /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-bold">{cat.nameEn}</span>
                    <button onClick={() => startEdit(cat)} className="p-1.5 text-primary hover:bg-primary/10 rounded"><Pencil size={14} /></button>
                    {!cat.isDefault && (
                      <button onClick={() => onDelete(cat.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={14} /></button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
