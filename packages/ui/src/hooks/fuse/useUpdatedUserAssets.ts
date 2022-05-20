import { NativePricedFuseAsset } from '@midas-capital/sdk';
import { BigNumber, constants, utils } from 'ethers';
import { useMemo } from 'react';
import { useQuery, UseQueryResult } from 'react-query';

import { FundOperationMode } from '@ui/constants/index';
import { useRari } from '@ui/context/RariContext';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

const useUpdatedUserAssets = ({
  mode,
  index,
  assets,
  amount,
}: {
  mode: FundOperationMode;
  assets: NativePricedFuseAsset[] | undefined;
  index: number;
  amount: BigNumber;
}) => {
  const { fuse, currentChain, coingeckoId } = useRari();
  const { data: usdPrice } = useUSDPrice(coingeckoId);

  const { data: updatedAssets }: UseQueryResult<NativePricedFuseAsset[]> = useQuery(
    [
      'UpdatedUserAssets',
      currentChain.id,
      mode,
      index,
      assets?.map((a) => a.cToken),
      amount,
      usdPrice,
    ],
    async () => {
      if (!assets || !assets.length || !usdPrice) return [];

      const assetToBeUpdated = assets[index];

      const interestRateModel = await fuse.getInterestRateModel(assetToBeUpdated.cToken);

      let updatedAsset: NativePricedFuseAsset;
      if (mode === FundOperationMode.SUPPLY) {
        const supplyBalance = assetToBeUpdated.supplyBalance.add(amount);

        const totalSupply = assetToBeUpdated.totalSupply.add(amount);

        updatedAsset = {
          ...assetToBeUpdated,

          supplyBalance,

          supplyBalanceNative:
            Number(utils.formatUnits(supplyBalance, 18)) *
            Number(utils.formatUnits(assetToBeUpdated.underlyingPrice, 18)) *
            usdPrice,

          totalSupply,
          supplyRatePerBlock: interestRateModel.getSupplyRate(
            totalSupply.gt(constants.Zero)
              ? assetToBeUpdated.totalBorrow.mul(constants.WeiPerEther).div(totalSupply)
              : constants.Zero
          ),
        };
      } else if (mode === FundOperationMode.WITHDRAW) {
        const supplyBalance = assetToBeUpdated.supplyBalance.sub(amount);

        const totalSupply = assetToBeUpdated.totalSupply.sub(amount);

        updatedAsset = {
          ...assetToBeUpdated,

          supplyBalance,
          supplyBalanceNative:
            (Number(utils.formatUnits(supplyBalance, 18)) /
              Number(utils.formatUnits(assetToBeUpdated.underlyingPrice, 18))) *
            usdPrice,

          totalSupply,
          supplyRatePerBlock: interestRateModel.getSupplyRate(
            totalSupply.gt(constants.Zero)
              ? assetToBeUpdated.totalBorrow.mul(constants.WeiPerEther).div(totalSupply)
              : constants.Zero
          ),
        };
      } else if (mode === FundOperationMode.BORROW) {
        const borrowBalance = assetToBeUpdated.borrowBalance.add(amount);

        const totalBorrow = assetToBeUpdated.totalBorrow.add(amount);

        updatedAsset = {
          ...assetToBeUpdated,
          borrowBalance,
          borrowBalanceNative:
            (Number(utils.formatUnits(borrowBalance)) /
              Number(utils.formatUnits(assetToBeUpdated.underlyingPrice))) *
            usdPrice,

          totalBorrow,
          borrowRatePerBlock: interestRateModel.getBorrowRate(
            assetToBeUpdated.totalSupply.gt(constants.Zero)
              ? totalBorrow.mul(constants.WeiPerEther).div(assetToBeUpdated.totalSupply)
              : constants.Zero
          ),
        };
      } else if (mode === FundOperationMode.REPAY) {
        const borrowBalance = assetToBeUpdated.borrowBalance.sub(amount);

        const totalBorrow = assetToBeUpdated.totalBorrow.sub(amount);

        const borrowRatePerBlock = interestRateModel.getBorrowRate(
          assetToBeUpdated.totalSupply.gt(constants.Zero)
            ? totalBorrow.mul(constants.WeiPerEther).div(assetToBeUpdated.totalSupply)
            : constants.Zero
        );

        updatedAsset = {
          ...assetToBeUpdated,

          borrowBalance,
          borrowBalanceNative:
            (Number(utils.formatUnits(borrowBalance)) /
              Number(utils.formatUnits(assetToBeUpdated.underlyingPrice))) *
            usdPrice,

          totalBorrow,
          borrowRatePerBlock,
        };
      }

      return assets.map((value, _index) => {
        if (_index === index) {
          return updatedAsset;
        } else {
          return value;
        }
      });
    }
  );

  return useMemo(() => updatedAssets, [updatedAssets]);
};

export default useUpdatedUserAssets;
