import { useRouter } from 'next/router';

export function useSort(): string | null {
  const router = useRouter();
  const { sortBy } = router.query;

  // Check if the query params are an array
  if (typeof sortBy === 'object') return sortBy[0];
  // Else return the filter or null
  else return sortBy ?? null;
}
