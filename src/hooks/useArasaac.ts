import { useQuery } from '@tanstack/react-query';

interface ArasaacPictogram {
  _id: number;
  keywords: { keyword: string }[];
}

const fetchPictogramId = async (keyword: string): Promise<number | null> => {
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
