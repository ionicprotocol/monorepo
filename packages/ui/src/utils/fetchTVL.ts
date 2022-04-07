import { Fuse } from '@midas-capital/sdk';

import { NATIVE_TOKEN_DATA } from '@constants/networkData';

export const fetchFuseTVL = async (fuse: Fuse) => {
  return fuse.getTotalValueLocked(false);
};

export const perPoolTVL = async (fuse: Fuse) => {
  const ethUSDBN = await fuse.getUsdPriceBN(NATIVE_TOKEN_DATA[fuse.chainId].coingeckoId, true);
  const fuseTVLInETH = await fetchFuseTVL(fuse);
  const fuseTVL = fuseTVLInETH.mul(ethUSDBN);

  return { fuseTVL };
};

export const fetchTVL = async (fuse: Fuse) => {
  const tvls = await perPoolTVL(fuse);

  return tvls.fuseTVL;
};
