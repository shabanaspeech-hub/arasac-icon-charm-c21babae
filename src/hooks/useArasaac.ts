import { useQuery } from '@tanstack/react-query';
import { symbols } from '@/data/aacData';

interface ArasaacPictogram {
  _id: number;
  keywords: { keyword: string }[];
}

// Hindi word → English keyword, so Hindi labels still find their ARASAAC picture.
const HI_EXTRA: Record<string, string> = {
  'खाना': 'eat', 'पीना': 'drink', 'सोना': 'sleep', 'खेलना': 'play', 'दर्द': 'pain',
  'माँ': 'mother', 'पापा': 'father', 'घर': 'house', 'हाँ': 'yes', 'नहीं': 'no',
  'शौचालय': 'toilet', 'मदद': 'help', 'और': 'more', 'जाओ': 'go', 'खुश': 'happy',
  'उदास': 'sad', 'पानी': 'water', 'दूध': 'milk', 'मैं': 'I', 'मुझे': 'me', 'चाहिए': 'want',
  'जाना': 'go', 'चाहता': 'want', 'वापस': 'back',
};
let hiMap: Map<string, string> | null = null;
function toEnglish(keyword: string): string {
  if (!/[\u0900-\u097F]/.test(keyword)) return keyword;
  if (!hiMap) {
    hiMap = new Map(Object.entries(HI_EXTRA));
    Object.values(symbols).forEach(list => list.forEach(s => {
      if (s.hi && s.en && !hiMap!.has(s.hi)) hiMap!.set(s.hi, s.en);
    }));
  }
  const k = keyword.trim();
  if (hiMap.has(k)) return hiMap.get(k)!;
  // Phrase: translate the first known word
  for (const w of k.split(/\s+/)) if (hiMap.has(w)) return hiMap.get(w)!;
  return keyword;
}

const fetchPictogramId = async (raw: string): Promise<number | null> => {
  const keyword = toEnglish(raw);
  try {
    const res = await fetch(
      `https://api.arasaac.org/v1/pictograms/en/search/${encodeURIComponent(keyword.toLowerCase())}`
    );
    if (!res.ok) return null;
    const data: ArasaacPictogram[] = await res.json();
    if (data.length > 0) return data[0]._id;
    return null;
  } catch {
    return null;
  }
};

export function getArasaacImageUrl(id: number, options?: { skin?: boolean }): string {
  if (options?.skin) {
    return `https://static.arasaac.org/pictograms/${id}/${id}_300.png?skin=yellow`;
  }
  return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;
}

export function useArasaacPictogram(keyword: string) {
  return useQuery({
    queryKey: ['arasaac', keyword.toLowerCase()],
    queryFn: () => fetchPictogramId(keyword),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}
