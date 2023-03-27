import { useIsMobile } from '@ui/hooks/useScreenSize';

export function useMaybeResponsiveProp<T, A>(data: string | { base: A; md: T }) {
  const mobile = useIsMobile();

  if (typeof data === 'object') {
    if (mobile) {
      return data.base;
    } else {
      return data.md;
    }
  } else {
    return data;
  }
}
