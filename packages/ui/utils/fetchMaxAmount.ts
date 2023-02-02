import { MidasSdk } from '@midas-capital/sdk';
import { FundOperationMode, NativePricedFuseAsset } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import { BigNumber, constants, utils } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { fetchTokenBalance } from '@ui/hooks/useTokenBalance';

export function useMaxAmount(
  mode: FundOperationMode,
  asset: NativePricedFuseAsset,
  comptrollerAddress: string
) {
  const { currentSdk, address } = useMultiMidas();
  return useQuery(
    ['useMaxAmount', mode, address, asset.cToken, currentSdk?.chainId],
    async () => {
      if (currentSdk && address) {
        const bigNumber = await fetchMaxAmount(
          mode,
          currentSdk,
          address,
          asset,
          comptrollerAddress
        );

        return {
          bigNumber: bigNumber,
          number: Number(utils.formatUnits(bigNumber, asset.underlyingDecimals)),
        };
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!address && !!asset && !!currentSdk,
    }
  );
}

export const fetchMaxAmount = async (
  mode: FundOperationMode,
  midasSdk: MidasSdk,
  address: string,
  asset: NativePricedFuseAsset,
  comptrollerAddress?: string
): Promise<BigNumber> => {
  if (mode === FundOperationMode.SUPPLY) {
    const tokenBalance = await fetchTokenBalance(asset.underlyingToken, midasSdk, address);

    if (comptrollerAddress) {
      const comptroller = midasSdk.createComptroller(comptrollerAddress);
      const supplyCap = await comptroller.callStatic.supplyCaps(asset.cToken);

      return supplyCap.gt(constants.Zero) && supplyCap.lte(tokenBalance) ? supplyCap : tokenBalance;
    } else {
      return tokenBalance;
    }
  }

  if (mode === FundOperationMode.REPAY) {
    const balance = await fetchTokenBalance(asset.underlyingToken, midasSdk, address);
    const debt = asset.borrowBalance;
    return balance.gt(debt) ? debt : balance;
  }

  if (mode === FundOperationMode.BORROW) {
    const maxBorrow = (await midasSdk.contracts.FusePoolLensSecondary.callStatic.getMaxBorrow(
      address,
      asset.cToken
    )) as BigNumber;

    if (!maxBorrow) {
      throw new Error('Could not fetch your max borrow amount! Code: ');
    }

    if (comptrollerAddress) {
      const comptroller = midasSdk.createComptroller(comptrollerAddress);
      const borrowCaps = await comptroller.callStatic.borrowCaps(asset.cToken);

      return borrowCaps.gt(constants.Zero) && borrowCaps.lte(maxBorrow) ? borrowCaps : maxBorrow;
    } else {
      return maxBorrow;
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
