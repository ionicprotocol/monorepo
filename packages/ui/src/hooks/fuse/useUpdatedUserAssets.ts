import { USDPricedFuseAsset } from '@midas-capital/sdk';
import { BigNumber, constants, utils } from 'ethers';
import { useMemo } from 'react';
import { useQuery, UseQueryResult } from 'react-query';

import { Mode } from '@components/pages/Fuse/Modals/PoolModal';
import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';

const useUpdatedUserAssets = ({
  mode,
  index,
  assets,
  amount,
}: {
  mode: Mode;
  assets: USDPricedFuseAsset[] | undefined;
  index: number;
  amount: BigNumber;
}) => {
  const { fuse, currentChain } = useRari();

  const { data: updatedAssets }: UseQueryResult<USDPricedFuseAsset[]> = useQuery(
    ['UpdatedUserAssets', currentChain.id, mode, index, assets?.map((a) => a.cToken), amount],
    async () => {
      if (!assets || !assets.length) return [];

      const ethPrice = (await fuse.getUsdPriceBN(
        NATIVE_TOKEN_DATA[fuse.chainId].coingeckoId,
        false
      )) as number;

      const assetToBeUpdated = assets[index];

      const interestRateModel = await fuse.getInterestRateModel(assetToBeUpdated.cToken);

      let updatedAsset: USDPricedFuseAsset;
      if (mode === Mode.SUPPLY) {
        const supplyBalance = assetToBeUpdated.supplyBalance.add(amount);

        const totalSupply = assetToBeUpdated.totalSupply.add(amount);

        updatedAsset = {
          ...assetToBeUpdated,

          supplyBalance,

          supplyBalanceUSD:
            (Number(utils.formatUnits(supplyBalance, 18)) /
              Number(utils.formatUnits(assetToBeUpdated.underlyingPrice, 18))) *
            ethPrice,

          totalSupply,
          supplyRatePerBlock: interestRateModel.getSupplyRate(
            totalSupply.gt(constants.Zero)
              ? assetToBeUpdated.totalBorrow.mul(constants.WeiPerEther).div(totalSupply)
              : constants.Zero
          ),
        };
      } else if (mode === Mode.WITHDRAW) {
        const supplyBalance = assetToBeUpdated.supplyBalance.sub(amount);

        const totalSupply = assetToBeUpdated.totalSupply.sub(amount);

        updatedAsset = {
          ...assetToBeUpdated,

          supplyBalance,
          supplyBalanceUSD:
            (Number(utils.formatUnits(supplyBalance, 18)) /
              Number(utils.formatUnits(assetToBeUpdated.underlyingPrice, 18))) *
            ethPrice,

          totalSupply,
          supplyRatePerBlock: interestRateModel.getSupplyRate(
            totalSupply.gt(constants.Zero)
              ? assetToBeUpdated.totalBorrow.mul(constants.WeiPerEther).div(totalSupply)
              : constants.Zero
          ),
        };
      } else if (mode === Mode.BORROW) {
        const borrowBalance = assetToBeUpdated.borrowBalance.add(amount);

        const totalBorrow = assetToBeUpdated.totalBorrow.add(amount);

        updatedAsset = {
          ...assetToBeUpdated,
          borrowBalance,
          borrowBalanceUSD:
            (Number(utils.formatUnits(borrowBalance)) /
              Number(utils.formatUnits(assetToBeUpdated.underlyingPrice))) *
            ethPrice,

          totalBorrow,
          borrowRatePerBlock: interestRateModel.getBorrowRate(
            assetToBeUpdated.totalSupply.gt(constants.Zero)
              ? totalBorrow.mul(constants.WeiPerEther).div(assetToBeUpdated.totalSupply)
              : constants.Zero
          ),
        };
      } else if (mode === Mode.REPAY) {
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
          borrowBalanceUSD:
            (Number(utils.formatUnits(borrowBalance)) /
              Number(utils.formatUnits(assetToBeUpdated.underlyingPrice))) *
            ethPrice,

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
