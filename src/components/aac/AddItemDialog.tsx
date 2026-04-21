import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Upload, Mic, Square, Trash2, Play } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { label: string; labelHi: string; imageData: string; audioData?: string; wordType: string }) => void;
  editData?: { label: string; labelHi: string; imageData: string; audioData?: string; wordType: string } | null;
}

const wordTypes = [
  { value: 'noun', label: 'Noun (Orange)' },
  { value: 'verb', label: 'Verb (Green)' },
  { value: 'descriptor', label: 'Descriptor (Blue)' },
  { value: 'feeling', label: 'Feeling (Pink)' },
  { value: 'social', label: 'Social (Pink)' },
  { value: 'core', label: 'Core (Yellow)' },
  { value: 'misc', label: 'Other (Grey)' },
];

export default function AddItemDialog({ open, onClose, onSave, editData }: AddItemDialogProps) {
  const [label, setLabel] = useState(editData?.label || '');
  const [labelHi, setLabelHi] = useState(editData?.labelHi || '');
  const [imageData, setImageData] = useState(editData?.imageData || '');
  const [wordType, setWordType] = useState(editData?.wordType || 'noun');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, audioData, startRecording, stopRecording, clearRecording, playAudio, setAudioData } = useAudioRecorder();

  // Reset on open
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    } else {
      setLabel(editData?.label || '');
      setLabelHi(editData?.labelHi || '');
      setImageData(editData?.imageData || '');
      setWordType(editData?.wordType || 'noun');
      if (editData?.audioData) setAudioData(editData.audioData);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!label.trim() || !imageData) return;
    onSave({
      label: label.trim(),
      labelHi: labelHi.trim() || label.trim(),
      imageData,
      audioData: audioData || editData?.audioData || undefined,
      wordType,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{editData ? '✏️ Edit Item' : '➕ Add New Item'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Image */}
          <div>
            <label className="text-sm font-bold text-foreground block mb-2">Image</label>
            {imageData ? (
              <div className="relative w-32 h-32 mx-auto">
                <img src={imageData} alt="Preview" className="w-full h-full object-cover rounded-xl border-2 border-border" />
                <button onClick={() => setImageData('')} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-3 justify-center">
                <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-1 px-4 py-3 bg-primary/10 rounded-xl border-2 border-primary/30 hover:bg-primary/20 transition-all">
                  <Camera size={24} className="text-primary" />
                  <span className="text-xs font-bold">Camera</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 px-4 py-3 bg-primary/10 rounded-xl border-2 border-primary/30 hover:bg-primary/20 transition-all">
                  <Upload size={24} className="text-primary" />
                  <span className="text-xs font-bold">Gallery</span>
                </button>
              </div>
            )}
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </div>

          {/* Label */}
          <div>
            <label className="text-sm font-bold text-foreground block mb-1">English Label</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Ball"
              className="w-full p-2.5 border-2 border-border rounded-lg bg-card text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-foreground block mb-1">Hindi Label (optional)</label>
            <input
              type="text"
              value={labelHi}
              onChange={e => setLabelHi(e.target.value)}
              placeholder="e.g. गेंद"
              className="w-full p-2.5 border-2 border-border rounded-lg bg-card text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Word Type */}
          <div>
            <label className="text-sm font-bold text-foreground block mb-1">Word Type (Color)</label>
            <select
              value={wordType}
              onChange={e => setWordType(e.target.value)}
              className="w-full p-2.5 border-2 border-border rounded-lg bg-card text-foreground focus:border-primary focus:outline-none"
            >
              {wordTypes.map(wt => (
                <option key={wt.value} value={wt.value}>{wt.label}</option>
              ))}
            </select>
          </div>

          {/* Voice Recording */}
          <div>
            <label className="text-sm font-bold text-foreground block mb-2">Custom Voice (optional)</label>
            <div className="flex gap-2 items-center">
              {isRecording ? (
                <button onClick={stopRecording} className="flex items-center gap-1.5 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-bold text-sm">
                  <Square size={16} /> Stop
                </button>
              ) : (
                <button onClick={startRecording} className="flex items-center gap-1.5 px-4 py-2 bg-info text-info-foreground rounded-lg font-bold text-sm">
                  <Mic size={16} /> Record
                </button>
              )}
              {(audioData || editData?.audioData) && (
                <>
                  <button onClick={() => playAudio(audioData || editData?.audioData)} className="flex items-center gap-1.5 px-3 py-2 bg-success text-success-foreground rounded-lg font-bold text-sm">
                    <Play size={16} /> Play
                  </button>
                  <button onClick={clearRecording} className="flex items-center gap-1.5 px-3 py-2 bg-warning text-warning-foreground rounded-lg font-bold text-sm">
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
            {isRecording && <p className="text-xs text-destructive font-bold mt-1 animate-pulse">🔴 Recording...</p>}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!label.trim() || !imageData}
            className="w-full py-3 bg-success text-success-foreground rounded-lg font-bold text-sm hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editData ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
