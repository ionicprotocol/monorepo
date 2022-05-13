import { useWindowSize } from '@ui/utils/chakraUtils';

export const useIsSemiSmallScreen = () => {
  const { width } = useWindowSize();

  return width < 1180;
};
