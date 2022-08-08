import { MidasSdk } from '@midas-capital/sdk';
import { FundOperationMode, NativePricedFuseAsset } from '@midas-capital/types';
import { BigNumber } from 'ethers';

import { fetchTokenBalance } from '@ui/hooks/useTokenBalance';

export const fetchMaxAmount = async (
  mode: FundOperationMode,
  midasSdk: MidasSdk,
  address: string,
  asset: NativePricedFuseAsset
) => {
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
      asset.cToken
    );

    if (maxRedeem) {
      return BigNumber.from(maxRedeem);
    } else {
      throw new Error('Could not fetch your max withdraw amount! Code: ');
    }
  }
};
