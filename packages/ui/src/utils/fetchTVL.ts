import { Fuse } from '@midas-capital/sdk';
import { BigNumber } from 'ethers';

import { NATIVE_TOKEN_DATA } from '@constants/networkData';

export const fetchFuseTVL = async (fuse: Fuse) => {
  const { 2: totalSuppliedETH } =
    await fuse.contracts.FusePoolLens.callStatic.getPublicPoolsByVerificationWithData(true);

  return BigNumber.from(
    totalSuppliedETH.reduce((a: number, b: string) => a + parseInt(b), 0).toString()
  );
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
