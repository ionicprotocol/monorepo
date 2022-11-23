import { MidasSdk } from '@midas-capital/sdk';
import { FundOperationMode, NativePricedFuseAsset } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import { BigNumber, utils } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { fetchTokenBalance } from '@ui/hooks/useTokenBalance';

export function useMaxAmount(mode: FundOperationMode, asset: NativePricedFuseAsset) {
  const { currentSdk, address } = useMultiMidas();
  return useQuery(
    ['useMaxAmount', asset.cToken, currentSdk?.chainId],
    async () => {
      if (currentSdk && address) {
        const bigNumber = await fetchMaxAmount(mode, currentSdk, address, asset);

        return {
          bigNumber: bigNumber,
          number: Number(utils.formatUnits(bigNumber, asset.underlyingDecimals)),
        };
      }
    },
    {
      enabled: !!address && !!asset && !!currentSdk,
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

    if (!maxBorrow) {
      throw new Error('Could not fetch your max borrow amount! Code: ');
    }
    return maxBorrow;
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
