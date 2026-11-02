// Hindi version of the Communication Assistant. Natural Hindi phrases per
// word category; each item keeps an English picture keyword so ARASAAC
// pictures still load.
import { classify } from './assistantEngine';
import { symbols } from '@/data/aacData';

export interface HiItem { text: string; pic: string }
export interface HiResult { relatedWords: HiItem[]; currentLevel: HiItem[]; expandedLanguage: HiItem[] }

const HI_BASE: Record<string, string> = {
  eat: 'खाना', drink: 'पीना', sleep: 'सोना', play: 'खेलना', pain: 'दर्द', mom: 'माँ', dad: 'पापा',
  home: 'घर', yes: 'हाँ', no: 'नहीं', washroom: 'शौचालय', help: 'मदद', more: 'और', go: 'जाना',
  happy: 'खुश', sad: 'उदास', water: 'पानी', milk: 'दूध', stop: 'रुको', want: 'चाहिए',
};

let map: Map<string, string> | null = null;
function toHindi(en: string): string {
  const k = en.toLowerCase();
  if (HI_BASE[k]) return HI_BASE[k];
  if (!map) {
    map = new Map();
    Object.values(symbols).forEach(l => l.forEach(s => { if (s.en && s.hi) map!.set(s.en.toLowerCase(), s.hi); }));
  }
  return map.get(k) || en;
}

type Raw = { r: [string, string][]; c: [string, string][]; e: [string, string][] };

const OVR: Record<string, Raw> = {
  eat: { r: [['सेब', 'apple'], ['नाश्ता', 'snack'], ['खाना', 'lunch'], ['भूख', 'hungry']], c: [['मुझे खाना है', 'eat'], ['और खाना', 'more'], ['मुझे भूख लगी है', 'hungry']], e: [['मुझे भूख लगी है, खाना दो।', 'eat'], ['क्या मुझे नाश्ता मिलेगा?', 'snack']] },
  drink: { r: [['पानी', 'water'], ['दूध', 'milk'], ['जूस', 'juice'], ['कप', 'cup']], c: [['मुझे पानी पीना है', 'drink'], ['मुझे प्यास लगी है', 'thirsty']], e: [['मुझे प्यास लगी है।', 'thirsty'], ['कृपया पानी दो।', 'water']] },
  water: { r: [['ठंडा पानी', 'cold'], ['गरम पानी', 'hot'], ['और पानी', 'more']], c: [['मुझे पानी चाहिए', 'water'], ['पानी दो', 'water']], e: [['कृपया मुझे पानी दो।', 'water'], ['मुझे प्यास लगी है।', 'thirsty']] },
  play: { r: [['गेंद', 'ball'], ['झूला', 'swing'], ['बाहर', 'outside'], ['बुलबुले', 'bubbles']], c: [['मुझे खेलना है', 'play'], ['बाहर खेलो', 'outside'], ['मेरे साथ खेलो', 'play']], e: [['क्या हम बाहर खेलें?', 'outside'], ['मेरे साथ खेलोगे?', 'play']] },
  go: { r: [['बाहर', 'outside'], ['घर', 'home'], ['पार्क', 'park'], ['स्कूल', 'school']], c: [['बाहर जाना है', 'outside'], ['घर चलो', 'home'], ['चलो चलें', 'go']], e: [['मुझे बाहर जाना है।', 'outside'], ['क्या हम पार्क चलें?', 'park']] },
  sleep: { r: [['बिस्तर', 'bed'], ['तकिया', 'pillow'], ['थका', 'tired']], c: [['मुझे सोना है', 'sleep'], ['मैं थक गया हूँ', 'tired']], e: [['मुझे नींद आ रही है।', 'sleep'], ['सोने का समय है।', 'bed']] },
};

function gen(en: string, h: string): Raw | null {
  const cat = classify(en);
  const p = en;
  switch (cat) {
    case 'person': return { r: [[`${h} आओ`, p], [`${h} कहाँ है?`, p]], c: [[`मुझे ${h} चाहिए`, p], [`${h}, मदद करो`, 'help']], e: [[`${h}, मुझे गले लगाओ।`, 'hug'], [`मैं ${h} से प्यार करता हूँ।`, 'love']] };
    case 'emotion': case 'state': return { r: [[`बहुत ${h}`, p]], c: [[`मैं ${h} हूँ`, p]], e: [[`मैं आज ${h} हूँ।`, p], [`मुझे गले लगाओ।`, 'hug']] };
    case 'action': return { r: [[`अभी ${h}`, p]], c: [[`मुझे ${h} है`, p], [`मेरे साथ ${h}`, p]], e: [[`क्या मैं अभी ${h} सकता हूँ?`, p]] };
    case 'place': return { r: [[`${h} चलो`, p]], c: [[`${h} जाना है`, p]], e: [[`मुझे ${h} जाना है।`, p], [`चलो ${h} चलें।`, p]] };
    case 'food': case 'drink': case 'object': return { r: [[`और ${h}`, 'more'], [`${h} दो`, p]], c: [[`मुझे ${h} चाहिए`, p], [`${h} दो, कृपया`, p]], e: [[`मुझे ${h} पसंद है।`, 'like'], [`क्या मुझे ${h} मिल सकता है?`, p]] };
    case 'request': return { r: [[`${h} करो`, p]], c: [[`मुझे ${h} चाहिए`, p], [`कृपया ${h}`, 'please']], e: [[`कृपया मेरी ${h} करो।`, p]] };
    case 'affirm': return { r: [['ठीक है', 'ok'], ['धन्यवाद', 'thank you']], c: [[`${h}, धन्यवाद`, p]], e: [[`${h}, कृपया।`, p]] };
    case 'body': return { r: [['डॉक्टर', 'doctor'], ['आराम', 'rest']], c: [[`मुझे दर्द है`, 'pain'], ['मदद करो', 'help']], e: [[`मेरे ${h} में दर्द है।`, p], ['कृपया मेरी मदद करो।', 'help']] };
    default: return null;
  }
}

export function generateHindiSuggestions(trigger: string): HiResult | null {
  const en = trigger.toLowerCase().trim();
  if (!en) return null;
  const raw = OVR[en] || gen(en, toHindi(en));
  if (!raw) return null;
  const seen = new Set<string>();
  const m = (l: [string, string][]) => l.filter(([t]) => !seen.has(t) && (seen.add(t), true)).map(([text, pic]) => ({ text, pic }));
  return { relatedWords: m(raw.r), currentLevel: m(raw.c), expandedLanguage: m(raw.e) };
}
