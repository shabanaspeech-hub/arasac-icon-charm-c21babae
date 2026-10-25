import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { Volume2, Delete, Trash2, Mic, Search, Settings, Plus, FolderOpen, Lock, Unlock, Star, ChevronUp, ChevronDown, X, LayoutGrid, Sparkles, Menu, Home } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import spectraLogo from '@/assets/spectra-logo.png';
import { symbols, categories, quickPhrases, type AACSymbol, type CategoryKey } from '@/data/aacData';
import { useSpeech } from '@/hooks/useSpeech';
import { useUsageTracker } from '@/hooks/useUsageTracker';
import { useCustomData } from '@/hooks/useCustomData';
import { useGridSize, GRID_OPTIONS } from '@/hooks/useGridSize';
import { useFavorites } from '@/hooks/useFavorites';
import { useChildProfile } from '@/hooks/useChildProfile';
import SymbolCard from './SymbolCard';
import SentenceBar from './SentenceBar';
import Keyboard from './Keyboard';
import SuggestionBar from './SuggestionBar';
import CoreWordsBar from './CoreWordsBar';
import VoiceSettingsDialog from './VoiceSettingsDialog';
import InstallBanner from './InstallBanner';
import AddItemDialog from './AddItemDialog';
import CategoryManagerDialog from './CategoryManagerDialog';
import CustomItemCard from './CustomItemCard';
import PagedGrid, { type PagedGridItem } from './PagedGrid';
import InlineAssistantStrip from './InlineAssistantStrip';
import BeginnerBoard, { type BeginnerWord } from './BeginnerBoard';


const wordColors: Record<string, string> = {
  core: '🟨', noun: '🟦', verb: '🟩', descriptor: '🟪',
  preposition: '🟧', question: '🟫', feeling: '🟥', social: '⬜'
};

export default function AACApp() {
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');
  const [currentCategory, setCurrentCategory] = useState<string>('core');
  const [sentence, setSentence] = useState<AACSymbol[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeCustomCategory, setActiveCustomCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showBeginner, setShowBeginner] = useState(true);
  const [assistantTrigger, setAssistantTrigger] = useState<string>('');
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { gridSize, setGridSize, gridColClass } = useGridSize();
  const { favorites, isFavorite, toggleFavorite, removeFavorite, moveFavorite } = useFavorites();
  const { voiceSettings, setVoiceSettings, speak } = useSpeech();
  const { profile: childProfile, toggleAssistant } = useChildProfile();


  const { trackWord } = useUsageTracker();
  const {
    categories: customCategories,
    items,
    createCategory,
    renameCategory,
    removeCategory,
    createItem,
    editItem,
    removeItem,
    getItemsForCategory,
  } = useCustomData();


  const addToSentence = useCallback((symbol: AACSymbol) => {
    const text = language === 'english' ? symbol.en : symbol.hi;
    speak(text, language);
    trackWord(text);
    setAssistantTrigger(symbol.en);
    setSentence(prev => [...prev, symbol]);
  }, [language, speak, trackWord]);

  const removeWord = useCallback((index: number) => {
    setSentence(prev => prev.filter((_, i) => i !== index));
  }, []);

  const speakSentence = useCallback(() => {
    if (sentence.length === 0) return;
    const text = sentence.map(s => language === 'english' ? s.en : s.hi).join(' ');
    speak(text, language);
  }, [sentence, language, speak]);

  const addPhrase = useCallback((phrase: string) => {
    speak(phrase, language);
    trackWord(phrase);
    setSentence(prev => [...prev, { emoji: '💬', en: phrase, hi: phrase, isPhrase: true }]);
  }, [language, speak, trackWord]);

  const addTypedWord = useCallback((word: string) => {
    speak(word, language);
    trackWord(word);
    setSentence(prev => [...prev, { emoji: '💬', en: word, hi: word, isTyped: true }]);
  }, [language, speak]);

  const handleCustomItemTap = useCallback((item: any) => {
    // Play custom audio if available, otherwise TTS
    if (item.audioData) {
      const audio = new Audio(item.audioData);
      audio.play();
    } else {
      const text = language === 'english' ? item.label : item.labelHi;
      speak(text, language);
    }
    trackWord(item.label);
    setSentence(prev => [...prev, { emoji: '📷', en: item.label, hi: item.labelHi, img: item.imageData, wordType: item.wordType }]);
  }, [language, speak, trackWord]);

  const handleBeginnerTap = useCallback((w: BeginnerWord) => {
    const text = language === 'english' ? w.en : w.hi;
    speak(text, language);
    trackWord(w.en);
    setAssistantTrigger(w.en);
    setSentence(prev => [...prev, { emoji: '🌟', en: w.en, hi: w.hi, wordType: 'core' }]);
  }, [language, speak, trackWord]);

  const handleSaveItem = useCallback(async (data: any) => {
    if (!activeCustomCategory) return;
    if (editingItem) {
      await editItem(editingItem.id, data);
    } else {
      await createItem({ ...data, categoryId: activeCustomCategory });
    }
    setEditingItem(null);
  }, [activeCustomCategory, editingItem, editItem, createItem]);

  // Get filtered symbols
  const getDisplaySymbols = () => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const allMatches: AACSymbol[] = [];
      Object.keys(symbols).forEach(cat => {
        if (cat === 'keyboard') return;
        symbols[cat].forEach(s => {
          if (s.en.toLowerCase().includes(query) || s.hi.toLowerCase().includes(query)) {
            allMatches.push(s);
          }
        });
      });
      return allMatches;
    }
    return symbols[currentCategory] || [];
  };

  const displaySymbols = getDisplaySymbols();
  const phrases = language === 'english' ? quickPhrases.en : quickPhrases.hi;
  const isCustomView = activeCustomCategory !== null && !showFavorites;
  const customItems = activeCustomCategory ? getItemsForCategory(activeCustomCategory) : [];

  // Lookup maps for favorites
  const symbolByEn = useMemo(() => {
    const m = new Map<string, AACSymbol>();
    Object.keys(symbols).forEach(cat => {
      if (cat === 'keyboard') return;
      symbols[cat].forEach(s => { if (!m.has(s.en)) m.set(s.en, s); });
    });
    return m;
  }, []);

  const favoriteEntries = useMemo(() => {
    return favorites.map(f => {
      if (f.key.startsWith('sym:')) {
        const sym = symbolByEn.get(f.key.slice(4));
        return sym ? { type: 'symbol' as const, key: f.key, symbol: sym } : null;
      }
      if (f.key.startsWith('custom:')) {
        const id = f.key.slice(7);
        const item = items.find(i => i.id === id);
        return item ? { type: 'custom' as const, key: f.key, item } : null;
      }
      return null;
    }).filter(Boolean) as Array<
      | { type: 'symbol'; key: string; symbol: AACSymbol }
      | { type: 'custom'; key: string; item: any }
    >;
  }, [favorites, symbolByEn, items]);


  // Stats
  let totalWords = 0;
  let coreWords = 0;
  Object.keys(symbols).forEach(cat => {
    if (cat !== 'keyboard') {
      totalWords += symbols[cat].length;
      coreWords += symbols[cat].filter(s => s.core).length;
    }
  });

  const goFolder = (fn: () => void) => { fn(); setSearchQuery(''); setFolderSheetOpen(false); };
  const openBeginner = () => goFolder(() => { setShowBeginner(true); setShowFavorites(false); setActiveCustomCategory(null); });
  const openFavorites = () => goFolder(() => { setShowFavorites(true); setShowBeginner(false); setActiveCustomCategory(null); });
  const openCategory = (key: string) => goFolder(() => { setCurrentCategory(key); setActiveCustomCategory(null); setShowFavorites(false); setShowBeginner(false); });
  const openCustom = (id: string) => goFolder(() => { setActiveCustomCategory(id); setShowFavorites(false); setShowBeginner(false); });

  const splitLabel = (label: string) => {
    const i = label.indexOf(' ');
    return i > 0 ? { icon: label.slice(0, i), name: label.slice(i + 1) } : { icon: '📁', name: label };
  };

  const currentTitle = searchQuery.trim()
    ? (language === 'english' ? `Search: “${searchQuery}”` : `खोज: “${searchQuery}”`)
    : showBeginner ? (language === 'english' ? 'Beginner' : 'शुरुआती')
    : showFavorites ? (language === 'english' ? 'Favorites' : 'पसंदीदा')
    : isCustomView ? (() => { const c = customCategories.find(c => c.id === activeCustomCategory); return c ? (language === 'english' ? c.nameEn : c.nameHi) : ''; })()
    : splitLabel(language === 'english' ? categories[currentCategory]?.en ?? '' : categories[currentCategory]?.hi ?? '').name;

  const DockItem = ({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-colors border ${
        active ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card text-foreground border-transparent hover:bg-secondary hover:border-border'
      }`}
    >
      <span className="text-xl w-7 text-center shrink-0" aria-hidden>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );

  const folderList = (
    <nav className="flex flex-col gap-1.5" aria-label="Folders">
      <DockItem active={showBeginner && !searchQuery} icon="🌟" label={language === 'english' ? 'Beginner' : 'शुरुआती'} onClick={openBeginner} />
      <DockItem active={showFavorites && !searchQuery} icon={<Star size={18} className="mx-auto" />} label={`${language === 'english' ? 'Favorites' : 'पसंदीदा'} (${favorites.length})`} onClick={openFavorites} />
      <div className="h-px bg-border my-1.5" />
      {Object.entries(categories).map(([key, val]) => {
        const { icon, name } = splitLabel(language === 'english' ? val.en : val.hi);
        const active = key === currentCategory && !isCustomView && !showFavorites && !showBeginner && !searchQuery;
        return <DockItem key={key} active={active} icon={icon} label={name} onClick={() => openCategory(key)} />;
      })}
      {(customCategories.length > 0 || editMode) && <div className="h-px bg-border my-1.5" />}
      {customCategories.map(cat => (
        <DockItem key={cat.id} active={activeCustomCategory === cat.id && !showFavorites && !showBeginner} icon="📷" label={language === 'english' ? cat.nameEn : cat.nameHi} onClick={() => openCustom(cat.id)} />
      ))}
      {editMode && (
        <button onClick={() => setCategoryManagerOpen(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-primary border border-dashed border-primary/40 hover:bg-primary/5">
          <FolderOpen size={18} className="w-7" /> {language === 'english' ? 'Manage folders' : 'फ़ोल्डर प्रबंधित करें'}
        </button>
      )}
    </nav>
  );

  return (
    <div className="h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-2 px-3 py-2 bg-card border-b border-border shrink-0">
        <button onClick={() => setFolderSheetOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-secondary" aria-label="Open folders">
          <Menu size={22} />
        </button>
        <img src={spectraLogo} alt="" className="w-8 h-8 rounded-full" />
        <div className="hidden md:flex flex-col leading-tight">
          <span className="font-extrabold text-base tracking-wide">VOXAFIA</span>
          <span className="text-[10px] text-muted-foreground">Every Voice Deserves to Be Heard</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="inline-flex rounded-xl border border-border bg-secondary p-1" role="tablist" aria-label="Board mode">
            {(() => {
              const typing = currentCategory === 'keyboard' && !showBeginner && !showFavorites && !activeCustomCategory;
              const cls = (on: boolean) => `px-3 py-1.5 rounded-lg text-sm font-bold transition ${on ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`;
              return (<>
                <button role="tab" aria-selected={!typing} onClick={openBeginner} className={cls(!typing)}>🖼️ {language === 'english' ? 'Pictures' : 'चित्र'}</button>
                <button role="tab" aria-selected={typing} onClick={() => openCategory('keyboard')} className={cls(typing)}>⌨️ {language === 'english' ? 'Type' : 'टाइप'}</button>
              </>);
            })()}
          </div>
        </div>
        {editMode && <span className="text-xs font-bold px-2 py-1 rounded-md bg-warning text-warning-foreground">{language === 'english' ? 'Edit mode' : 'एडिट मोड'}</span>}
        <button onClick={() => setSettingsOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-bold hover:bg-secondary" aria-label="Settings">
          <Settings size={18} /> <span className="hidden sm:inline">{language === 'english' ? 'Settings' : 'सेटिंग्स'}</span>
        </button>
      </header>

      {/* Message window */}
      <div className="flex items-stretch gap-2 p-2 bg-secondary/60 border-b border-border shrink-0">
        <div className="flex-1 min-w-0 rounded-xl bg-card border border-border overflow-hidden">
          <SentenceBar sentence={sentence} language={language} onRemoveWord={removeWord} />
        </div>
        <div className="flex gap-1.5">
          <button onClick={speakSentence} className="flex flex-col items-center justify-center gap-0.5 w-16 sm:w-20 rounded-xl bg-success text-success-foreground font-bold text-xs active:scale-95 transition" aria-label="Speak">
            <Volume2 size={24} /> {language === 'english' ? 'Speak' : 'बोलो'}
          </button>
          <button onClick={() => setSentence(prev => prev.slice(0, -1))} className="flex flex-col items-center justify-center gap-0.5 w-14 sm:w-16 rounded-xl bg-card border border-border font-bold text-xs active:scale-95 transition" aria-label="Delete last word">
            <Delete size={20} /> {language === 'english' ? 'Back' : 'हटाओ'}
          </button>
          <button onClick={() => setSentence([])} className="flex flex-col items-center justify-center gap-0.5 w-14 sm:w-16 rounded-xl bg-card border border-border font-bold text-xs active:scale-95 transition" aria-label="Clear sentence">
            <Trash2 size={20} /> {language === 'english' ? 'Clear' : 'साफ़'}
          </button>
        </div>
      </div>

      <InlineAssistantStrip
        trigger={assistantTrigger}
        language={language}
        onSpeak={(t) => speak(t, language)}
        onAddToBoard={(t) => addPhrase(t)}
        onClose={() => setAssistantTrigger('')}
      />

      <div className="flex-1 flex min-h-0">
        {/* Side folder dock */}
        <aside className="hidden lg:block w-56 shrink-0 border-r border-border bg-card overflow-y-auto p-2">
          {folderList}
        </aside>

        {/* Board */}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-card shrink-0">
            {!showBeginner && (
              <button onClick={openBeginner} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary" aria-label="Home">
                <Home size={14} /> {language === 'english' ? 'Home' : 'होम'}
              </button>
            )}
            <h2 className="text-sm font-extrabold truncate">{currentTitle}</h2>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-2">
        {/* Content */}
        {showBeginner ? (
          <BeginnerBoard language={language} onSelect={handleBeginnerTap} />
        ) : showFavorites ? (
          favoriteEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 px-4">
              {language === 'english'
                ? 'No favorites yet. Long-press any button to add it.'
                : 'अभी तक कोई पसंदीदा नहीं। जोड़ने के लिए किसी भी बटन को देर तक दबाएं।'}
            </p>
          ) : (
            <PagedGrid
              gridSize={gridSize}
              storageKey="favorites"
              items={favoriteEntries.map<PagedGridItem>((entry) => ({
                id: entry.key,
                render: () =>
                  entry.type === 'symbol' ? (
                    <SymbolCard
                      symbol={entry.symbol}
                      language={language}
                      onClick={() => addToSentence(entry.symbol)}
                      onLongPress={() => toggleFavorite(entry.key)}
                      isFavorite
                    />
                  ) : (
                    <CustomItemCard
                      item={entry.item}
                      language={language}
                      editMode={false}
                      onClick={() => handleCustomItemTap(entry.item)}
                      onEdit={() => {}}
                      onDelete={() => removeFavorite(entry.key)}
                      onLongPress={() => toggleFavorite(entry.key)}
                      isFavorite
                    />
                  ),
              }))}
            />
          )
        ) : isCustomView ? (
          customItems.length === 0 && !editMode ? (
            <p className="text-center text-muted-foreground py-12 px-4">
              {language === 'english' ? 'No custom items yet. Turn on Edit mode to add items.' : 'अभी तक कोई कस्टम आइटम नहीं। आइटम जोड़ने के लिए एडिट मोड चालू करें।'}
            </p>
          ) : (
            <PagedGrid
              gridSize={gridSize}
              storageKey={`custom-${activeCustomCategory}`}
              items={customItems.map<PagedGridItem>((item) => ({
                id: `custom:${item.id}`,
                render: () => (
                  <CustomItemCard
                    item={item}
                    language={language}
                    editMode={editMode}
                    onClick={() => handleCustomItemTap(item)}
                    onEdit={() => { setEditingItem(item); setAddItemOpen(true); }}
                    onDelete={() => removeItem(item.id)}
                    onLongPress={() => toggleFavorite(`custom:${item.id}`)}
                    isFavorite={isFavorite(`custom:${item.id}`)}
                  />
                ),
              }))}
              trailing={editMode ? (
                <button
                  onClick={() => { setEditingItem(null); setAddItemOpen(true); }}
                  className="flex flex-col items-center justify-center h-full w-full p-3 rounded-xl border-[3px] border-dashed border-primary/40 cursor-pointer transition-all hover:border-primary hover:bg-primary/5"
                >
                  <Plus size={32} className="text-primary/60 mb-1" />
                  <span className="text-xs font-bold text-primary/60">Add Item</span>
                </button>
              ) : null}
            />
          )
        ) : currentCategory === 'keyboard' ? (
          <Keyboard language={language} onAddWord={addTypedWord} />
        ) : displaySymbols.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 px-4">
            {language === 'english' ? 'No symbols found' : 'कोई प्रतीक नहीं मिला'}
          </p>
        ) : (
          <PagedGrid
            gridSize={gridSize}
            storageKey={searchQuery.trim() ? `search` : `cat-${currentCategory}`}
            items={displaySymbols.map<PagedGridItem>((symbol) => ({
              id: `sym:${symbol.en}`,
              render: () => (
                <SymbolCard
                  symbol={symbol}
                  language={language}
                  onClick={() => addToSentence(symbol)}
                  onLongPress={() => toggleFavorite(`sym:${symbol.en}`)}
                  isFavorite={isFavorite(`sym:${symbol.en}`)}
                />
              ),
            }))}
          />
        )}

          </div>
        </main>
      </div>

      {/* Folders drawer (mobile / tablet portrait) */}
      <Sheet open={folderSheetOpen} onOpenChange={setFolderSheetOpen}>
        <SheetContent side="left" className="w-72 p-3 overflow-y-auto">
          <SheetHeader className="mb-3"><SheetTitle>{language === 'english' ? 'Folders' : 'फ़ोल्डर'}</SheetTitle></SheetHeader>
          {folderList}
        </SheetContent>
      </Sheet>

      {/* Settings drawer */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="right" className="w-80 overflow-y-auto">
          <SheetHeader className="mb-4"><SheetTitle>{language === 'english' ? 'Settings' : 'सेटिंग्स'}</SheetTitle></SheetHeader>
          <div className="space-y-5 text-sm">
            <section className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowBeginner(false); setShowFavorites(false); setActiveCustomCategory(null); if (currentCategory === 'keyboard') setCurrentCategory('core'); }}
                  placeholder={language === 'english' ? 'Search words…' : 'शब्द खोजें…'}
                  className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg bg-card focus:border-primary focus:outline-none"
                />
              </div>
            </section>
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-muted-foreground">{language === 'english' ? 'Language' : 'भाषा'}</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['english', 'hindi'] as const).map(l => (
                  <button key={l} onClick={() => setLanguage(l)} className={`py-2 rounded-lg font-bold border ${language === l ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}>
                    {l === 'english' ? 'English' : 'हिंदी'}
                  </button>
                ))}
              </div>
            </section>
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><LayoutGrid size={12} /> {language === 'english' ? 'Pictures per page' : 'प्रति पेज चित्र'}</h3>
              <div className="grid grid-cols-6 gap-1.5">
                {GRID_OPTIONS.map(size => (
                  <button key={size} onClick={() => setGridSize(size)} className={`py-2 rounded-lg font-bold border ${gridSize === size ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}>{size}</button>
                ))}
              </div>
            </section>
            <section className="space-y-2">
              <button onClick={() => setEditMode(!editMode)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg font-bold border ${editMode ? 'bg-warning text-warning-foreground border-warning' : 'bg-card border-border'}`}>
                {editMode ? <Unlock size={16} /> : <Lock size={16} />} {editMode ? (language === 'english' ? 'Edit mode ON' : 'एडिट मोड चालू') : (language === 'english' ? 'Child mode (locked)' : 'चाइल्ड मोड (लॉक)')}
              </button>
              <button onClick={toggleAssistant} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg font-bold border ${childProfile.assistantEnabled ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}>
                <Sparkles size={16} /> {language === 'english' ? `Assistant ${childProfile.assistantEnabled ? 'ON' : 'OFF'}` : `सहायक ${childProfile.assistantEnabled ? 'चालू' : 'बंद'}`}
              </button>
              <button onClick={() => { setSettingsOpen(false); setVoiceModalOpen(true); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg font-bold border border-border bg-card">
                <Mic size={16} /> {language === 'english' ? 'Voice settings' : 'आवाज़ सेटिंग्स'}
              </button>
              {editMode && (
                <button onClick={() => { setSettingsOpen(false); setCategoryManagerOpen(true); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg font-bold border border-border bg-card">
                  <FolderOpen size={16} /> {language === 'english' ? 'Manage folders' : 'फ़ोल्डर प्रबंधित करें'}
                </button>
              )}
            </section>
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-muted-foreground">{language === 'english' ? 'Colour code' : 'रंग कोड'}</h3>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(wordColors).map(([type, icon]) => (
                  <span key={type}>{icon} {type.charAt(0).toUpperCase() + type.slice(1)}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground pt-2">📚 {totalWords} words · ⭐ {coreWords} core · by SpectraSpeech — Shabana Tariq, SLP</p>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}

      <VoiceSettingsDialog
        open={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        settings={voiceSettings}
        onSettingsChange={setVoiceSettings}
        onTest={() => speak(language === 'english' ? 'Hello, this is a test' : 'नमस्ते, यह एक परीक्षण है', language)}
      />

      <AddItemDialog
        open={addItemOpen}
        onClose={() => { setAddItemOpen(false); setEditingItem(null); }}
        onSave={handleSaveItem}
        editData={editingItem ? { label: editingItem.label, labelHi: editingItem.labelHi, imageData: editingItem.imageData, audioData: editingItem.audioData, wordType: editingItem.wordType } : null}
      />

      <CategoryManagerDialog
        open={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
        categories={customCategories}
        onAdd={createCategory}
        onRename={renameCategory}
        onDelete={removeCategory}
      />


      <InstallBanner />
    </div>
  );
}
