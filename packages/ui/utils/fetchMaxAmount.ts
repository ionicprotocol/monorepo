import { FundOperationMode, Fuse, NativePricedFuseAsset } from '@midas-capital/sdk';
import { BigNumber, utils } from 'ethers';

import { toFixedNoRound } from './formatNumber';

import { fetchTokenBalance } from '@ui/hooks/useTokenBalance';

export const fetchMaxAmount = async (
  mode: FundOperationMode,
  fuse: Fuse,
  address: string,
  asset: NativePricedFuseAsset
) => {
  if (mode === FundOperationMode.SUPPLY) {
    return await fetchTokenBalance(asset.underlyingToken, fuse, address);
  }

  if (mode === FundOperationMode.REPAY) {
    const balance = await fetchTokenBalance(asset.underlyingToken, fuse, address);
    const debt = asset.borrowBalance;

    if (balance.gt(debt)) {
      return debt;
    } else {
      return balance;
    }
  }

  if (mode === FundOperationMode.BORROW) {
    const maxBorrow = (await fuse.contracts.FusePoolLensSecondary.callStatic.getMaxBorrow(
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
    let maxRedeem = await fuse.contracts.FusePoolLensSecondary.callStatic.getMaxRedeem(
      address,
      asset.cToken
    );
    // round down under 6 digits below decimal point
    maxRedeem = utils.parseUnits(toFixedNoRound(Number(utils.formatUnits(maxRedeem)), 6));

    if (maxRedeem) {
      return BigNumber.from(maxRedeem);
    } else {
      throw new Error('Could not fetch your max withdraw amount! Code: ');
    }
  }
};
