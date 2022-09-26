import { MidasSdk } from '@midas-capital/sdk';
import { FundOperationMode, NativePricedFuseAsset } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import { BigNumber, utils } from 'ethers';

import { useMidas } from '@ui/context/MidasContext';
import { fetchTokenBalance } from '@ui/hooks/useTokenBalance';

export function useMaxAmount(mode: FundOperationMode, asset: NativePricedFuseAsset) {
  const {
    midasSdk,
    address,
    currentChain: { id: chainId },
  } = useMidas();
  return useQuery<{ bigNumber: BigNumber; number: number }>(
    ['useMaxAmount', asset.cToken, chainId],
    async () => {
      const bigNumber = await fetchMaxAmount(mode, midasSdk, address, asset);
      return {
        bigNumber: bigNumber,
        number: Number(utils.formatUnits(bigNumber, asset.underlyingDecimals)),
      };
    },
    {
      enabled: !!midasSdk && !!address && !!chainId && !!asset,
    }
  );
}

export const fetchMaxAmount = async (
  mode: FundOperationMode,
  midasSdk: MidasSdk,
  address: string,
  asset: NativePricedFuseAsset
): Promise<BigNumber> => {
  if (mode === FundOperationMode.SUPPLY) {
    return await fetchTokenBalance(asset.underlyingToken, midasSdk, address);
  }

  if (mode === FundOperationMode.REPAY) {
    const balance = await fetchTokenBalance(asset.underlyingToken, midasSdk, address);
    const debt = asset.borrowBalance;

    if (balance.gt(debt)) {
      return debt;
    } else {
      return balance;
    }
  }

  if (mode === FundOperationMode.BORROW) {
    const maxBorrow = (await midasSdk.contracts.FusePoolLensSecondary.callStatic.getMaxBorrow(
      address,
      asset.cToken
    )) as BigNumber;

    if (maxBorrow) {
      return maxBorrow;
    } else {
      throw new Error('Could not fetch your max borrow amount! Code: ');
    }
  }

  if (mode === FundOperationMode.WITHDRAW) {
    const maxRedeem = await midasSdk.contracts.FusePoolLensSecondary.callStatic.getMaxRedeem(
      address,
      asset.cToken,
      { from: address }
    );

    if (maxRedeem) {
      return BigNumber.from(maxRedeem);
    } else {
      throw new Error('Could not fetch your max withdraw amount! Code: ');
    }
  }
  throw new Error('Unsupported `FundOperationMode` passed.');
};
