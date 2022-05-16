import { Fuse } from '@midas-capital/sdk';

export const fetchFuseTVL = async (fuse: Fuse) => {
  return fuse.getTotalValueLocked(false);
};
