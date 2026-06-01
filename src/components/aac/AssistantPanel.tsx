import { useMemo, useState } from 'react';
import { Sparkles, X, User, MessageSquare, BarChart3, Plus, Star, Bookmark, Volume2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useChildProfile, type ChildProfile } from '@/hooks/useChildProfile';
import { useAssistantTracker } from '@/hooks/useAssistantTracker';
import { generateSuggestions, generateFromNeed, type AssistantResult } from '@/lib/assistantEngine';

const SAVED_KEY = 'spectra-assistant-saved';

export interface AssistantPanelProps {
  open: boolean;
  onClose: () => void;
  trigger: string; // word/category child tapped
  language: 'english' | 'hindi';
  onSpeak: (text: string) => void;
  onAddToBoard: (text: string) => void;
  onAddToFavorites: (text: string) => void;
}

function SuggestionButton({ text, onTap, onAdd, onFav }: { text: string; onTap: () => void; onAdd?: () => void; onFav?: () => void }) {
  return (
    <div className="group flex items-stretch gap-1">
      <button
        onClick={onTap}
        className="flex-1 text-left px-4 py-3 bg-card border-2 border-primary/30 rounded-xl font-bold text-base hover:bg-primary/5 hover:border-primary transition-all flex items-center gap-2 min-h-[56px]"
      >
        <Volume2 size={18} className="text-primary shrink-0" />
        <span className="text-foreground">{text}</span>
      </button>
      {onAdd && (
        <button onClick={onAdd} title="Add to board" className="px-3 bg-success/10 text-success-foreground border-2 border-success/40 rounded-xl hover:bg-success/20">
          <Plus size={16} />
        </button>
      )}
      {onFav && (
        <button onClick={onFav} title="Favorite" className="px-3 bg-warning/10 text-warning-foreground border-2 border-warning/40 rounded-xl hover:bg-warning/20">
          <Star size={16} />
        </button>
      )}
    </div>
  );
}

function SuggestionList({
  title,
  items,
  type,
  onTap,
  onAdd,
  onFav,
}: {
  title: string;
  items: string[];
  type: 'word' | 'phrase' | 'sentence';
  onTap: (s: string, type: 'word' | 'phrase' | 'sentence') => void;
  onAdd?: (s: string, type: 'word' | 'phrase' | 'sentence') => void;
  onFav?: (s: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="mb-3">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">{title}</h4>
      <div className="grid gap-2">
        {items.map((it, i) => (
          <SuggestionButton
            key={`${it}-${i}`}
            text={it}
            onTap={() => onTap(it, type)}
            onAdd={onAdd ? () => onAdd(it, type) : undefined}
            onFav={onFav ? () => onFav(it) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function LevelBlock({ heading, accent, set, onTap, onAdd, onFav }: {
  heading: string;
  accent: string;
  set: AssistantResult['currentLevel'];
  onTap: (s: string, t: 'word' | 'phrase' | 'sentence') => void;
  onAdd?: (s: string, t: 'word' | 'phrase' | 'sentence') => void;
  onFav?: (s: string) => void;
}) {
  return (
    <div className={`p-3 rounded-xl border-2 ${accent} mb-3`}>
      <h3 className="text-sm font-extrabold mb-2 flex items-center gap-2">
        <Sparkles size={14} /> {heading}
      </h3>
      <SuggestionList title="Words" items={set.words} type="word" onTap={onTap} onAdd={onAdd} onFav={onFav} />
      <SuggestionList title="Phrases" items={set.phrases} type="phrase" onTap={onTap} onAdd={onAdd} onFav={onFav} />
      <SuggestionList title="Sentences" items={set.sentences} type="sentence" onTap={onTap} onAdd={onAdd} onFav={onFav} />
    </div>
  );
}

export default function AssistantPanel({ open, onClose, trigger, language, onSpeak, onAddToBoard, onAddToFavorites }: AssistantPanelProps) {
  const { profile, setProfile, toggleAssistant } = useChildProfile();
  const { stats, track, reset } = useAssistantTracker();
  const [need, setNeed] = useState('');
  const [parentResult, setParentResult] = useState<AssistantResult | null>(null);
  const [saved, setSaved] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; }
  });

  const result = useMemo(() => generateSuggestions(trigger || 'default', profile), [trigger, profile]);

  // Track view when panel opens
  useMemo(() => { if (open) track('view', trigger || 'default'); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  const handleTap = (text: string, type: 'word' | 'phrase' | 'sentence') => {
    onSpeak(text);
    track('select', text);
  };
  const handleAdd = (text: string, type: 'word' | 'phrase' | 'sentence') => {
    onAddToBoard(text);
    track('add', text, type);
  };
  const handleFav = (text: string) => {
    onAddToFavorites(text);
    track('add', text, 'word');
  };
  const handleSaveLater = (text: string) => {
    const next = Array.from(new Set([...saved, text]));
    setSaved(next);
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  };

  const generateParent = () => {
    if (!need.trim()) return;
    setParentResult(generateFromNeed(need, profile));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <div className="aac-gradient text-primary-foreground p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={22} />
            <div>
              <h2 className="font-extrabold text-lg">Communication Assistant</h2>
              <p className="text-xs opacity-90">Support feature — the AAC board remains primary.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <Tabs defaultValue="child" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 m-3 mb-0 shrink-0">
            <TabsTrigger value="child"><MessageSquare size={14} className="mr-1" />Child</TabsTrigger>
            <TabsTrigger value="parent"><User size={14} className="mr-1" />Parent</TabsTrigger>
            <TabsTrigger value="profile"><User size={14} className="mr-1" />Profile</TabsTrigger>
            <TabsTrigger value="dashboard"><BarChart3 size={14} className="mr-1" />Stats</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            {/* CHILD MODE */}
            <TabsContent value="child" className="mt-0">
              <p className="text-sm text-muted-foreground mb-3">
                Based on <strong>{trigger || '—'}</strong> · AAC Level {profile.aacLevel} · Expressive age {profile.expressiveAge}y
              </p>
              <LevelBlock
                heading="Current Level"
                accent="border-success/40 bg-success/5"
                set={result.currentLevel}
                onTap={handleTap}
                onAdd={handleAdd}
                onFav={handleFav}
              />
              <LevelBlock
                heading="Next Level (one step ahead)"
                accent="border-primary/40 bg-primary/5"
                set={result.nextLevel}
                onTap={handleTap}
                onAdd={handleAdd}
                onFav={handleFav}
              />
              <div className="p-3 rounded-xl border-2 border-warning/40 bg-warning/5">
                <h3 className="text-sm font-extrabold mb-2">Language Targets</h3>
                <p className="text-xs font-bold text-muted-foreground mb-1">Words to learn next:</p>
                <p className="text-sm mb-2">{result.targets.wordsToLearn.join(' · ')}</p>
                <p className="text-xs font-bold text-muted-foreground mb-1">Phrases to model:</p>
                <p className="text-sm mb-2">{result.targets.phrasesToModel.join(' · ')}</p>
                <p className="text-xs font-bold text-muted-foreground mb-1">Goals:</p>
                <p className="text-sm">{result.targets.goals.join(' · ')}</p>
              </div>
            </TabsContent>

            {/* PARENT MODE */}
            <TabsContent value="parent" className="mt-0 space-y-3">
              <div>
                <Label className="text-sm font-bold">Communication Need</Label>
                <Textarea
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                  placeholder="e.g. My child wants to play cricket outside."
                  rows={3}
                  className="mt-1"
                />
                <Button onClick={generateParent} className="mt-2 w-full">
                  <Sparkles size={16} className="mr-2" /> Generate Suggestions
                </Button>
              </div>

              {parentResult && (
                <>
                  <LevelBlock
                    heading="Current Level Language"
                    accent="border-success/40 bg-success/5"
                    set={parentResult.currentLevel}
                    onTap={handleTap}
                    onAdd={handleAdd}
                    onFav={handleFav}
                  />
                  <LevelBlock
                    heading="Next Level Language"
                    accent="border-primary/40 bg-primary/5"
                    set={parentResult.nextLevel}
                    onTap={handleTap}
                    onAdd={handleAdd}
                    onFav={handleFav}
                  />
                  <div className="flex flex-wrap gap-2">
                    {[...parentResult.currentLevel.phrases, ...parentResult.nextLevel.sentences].slice(0, 6).map((p, i) => (
                      <button key={i} onClick={() => handleSaveLater(p)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-accent/30 rounded-full border border-border hover:bg-accent/50">
                        <Bookmark size={12} /> Save: {p}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {saved.length > 0 && (
                <div className="p-3 rounded-xl bg-secondary border border-border">
                  <h3 className="text-sm font-bold mb-2 flex items-center gap-1"><Bookmark size={14} /> Saved For Later</h3>
                  <ul className="text-sm space-y-1">
                    {saved.map((s, i) => (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span>{s}</span>
                        <div className="flex gap-1">
                          <button onClick={() => onAddToBoard(s)} className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">Add</button>
                          <button onClick={() => {
                            const next = saved.filter((_, j) => j !== i);
                            setSaved(next);
                            localStorage.setItem(SAVED_KEY, JSON.stringify(next));
                          }} className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded">Remove</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            {/* PROFILE */}
            <TabsContent value="profile" className="mt-0 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
                <div>
                  <p className="font-bold text-sm">Assistant Enabled</p>
                  <p className="text-xs text-muted-foreground">Show ✨ Help Me Say More on the board</p>
                </div>
                <Switch checked={profile.assistantEnabled} onCheckedChange={toggleAssistant} />
              </div>

              <div>
                <Label>Child Name</Label>
                <Input value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} />
              </div>

              <ProfileSlider label="Chronological Age" value={profile.chronologicalAge} onChange={(v) => setProfile({ chronologicalAge: v })} />
              <ProfileSlider label="Expressive Language Age" value={profile.expressiveAge} onChange={(v) => setProfile({ expressiveAge: v })} />
              <ProfileSlider label="Receptive Language Age" value={profile.receptiveAge} onChange={(v) => setProfile({ receptiveAge: v })} />

              <div>
                <Label>AAC Level (1 = single words, 5 = complex sentences)</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((lv) => (
                    <button
                      key={lv}
                      onClick={() => setProfile({ aacLevel: lv as ChildProfile['aacLevel'] })}
                      className={`flex-1 py-2 rounded-lg font-bold text-sm border-2 transition-all ${profile.aacLevel === lv ? 'aac-gradient text-primary-foreground border-transparent' : 'bg-card border-border'}`}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Current Vocabulary (comma separated)</Label>
                <Textarea
                  value={profile.vocabulary.join(', ')}
                  onChange={(e) => setProfile({ vocabulary: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Current Goals (one per line)</Label>
                <Textarea
                  value={profile.goals.join('\n')}
                  onChange={(e) => setProfile({ goals: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* DASHBOARD */}
            <TabsContent value="dashboard" className="mt-0 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <StatCard label="Viewed" value={stats.viewed} />
                <StatCard label="Selected" value={stats.selected} />
                <StatCard label="Words +" value={stats.wordsAdded} />
                <StatCard label="Phrases +" value={stats.phrasesAdded} />
                <StatCard label="Sentences +" value={stats.sentencesAdded} />
              </div>
              <div className="p-3 rounded-xl bg-secondary border border-border">
                <h3 className="text-sm font-bold mb-2">Recent Activity</h3>
                {stats.history.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No activity yet.</p>
                ) : (
                  <ul className="text-xs space-y-1 max-h-60 overflow-y-auto">
                    {[...stats.history].reverse().slice(0, 30).map((h, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span className="font-mono opacity-60">{new Date(h.ts).toLocaleTimeString()}</span>
                        <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 bg-card rounded">{h.kind}</span>
                        <span className="flex-1 truncate">{h.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button variant="outline" onClick={reset} className="w-full">Reset Stats</Button>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded-xl bg-card border-2 border-border text-center">
      <p className="text-2xl font-extrabold text-primary">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">{label}</p>
    </div>
  );
}

function ProfileSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <Label>{label}</Label>
        <span className="text-sm font-bold">{value} yrs</span>
      </div>
      <Slider value={[value]} min={1} max={12} step={1} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}
