import { Fuse } from 'sdk';

export const fetchFuseTVL = async (fuse: Fuse) => {
  return fuse.getTotalValueLocked(false);
};
