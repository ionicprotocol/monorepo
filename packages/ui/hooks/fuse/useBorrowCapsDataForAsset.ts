import type { IonicSdk } from '@ionicprotocol/sdk';
import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const fetchBorrowCaps = async (sdk: IonicSdk, cTokens: string[]) => {
  const cTokenToBorrowCaps: {
    [cToken: string]: {
      borrowCapsPerCollateral: BigNumber[];
      collateral: string[];
      collateralBlacklisted: boolean[];
      nonWhitelistedTotalBorrows: BigNumber;
      totalBorrowCap: BigNumber;
    };
  } = {};

  await Promise.all(
    cTokens.map(async (cToken) => {
      const borrowCaps = await sdk.contracts.PoolLens.callStatic.getBorrowCapsDataForAsset(cToken);

      cTokenToBorrowCaps[cToken] = borrowCaps;
    })
  );

  return cTokenToBorrowCaps;
};

export const useBorrowCapsDataForAsset = (cTokenAddress: string, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useBorrowCapsDataForAsset', cTokenAddress, sdk?.chainId],
    async () => {
      if (cTokenAddress && sdk) {
        try {
          const borrowCaps = await fetchBorrowCaps(sdk, [cTokenAddress]);

          return borrowCaps[cTokenAddress];
        } catch (e) {
          console.warn(`Getting borrow caps error: `, { cTokenAddress, poolChainId }, e);

          return null;
        }
      } else {
        return null;
      }
    },
    {
      enabled: !!cTokenAddress && !!sdk,
    }
  );
};

export const useBorrowCapsForAssets = (cTokens?: string[], poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useBorrowCapsForAssets', cTokens, sdk?.chainId],
    async () => {
      if (cTokens && cTokens.length > 0 && sdk) {
        try {
          return await fetchBorrowCaps(sdk, cTokens);
        } catch (e) {
          console.warn(`Getting borrow caps error: `, { cTokens, poolChainId }, e);

          return null;
        }
      } else {
        return null;
      }
    },
    {
      enabled: !!cTokens && cTokens.length > 0 && !!sdk,
    }
  );
};
