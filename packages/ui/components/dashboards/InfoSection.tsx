import { useMemo } from 'react';

import millify from 'millify';
import { formatEther } from 'viem';

import { pools } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useHealthFactor } from '@ui/hooks/pools/useHealthFactor';
import { useAllClaimableRewards } from '@ui/hooks/rewards/useAllClaimableRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import { useUserNetApr } from '@ui/hooks/useUserNetApr';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

import ResultHandler from '../ResultHandler';

const InfoSection = ({
  marketData,
  isLoadingMarketData,
  rewardToggle,
  suppliedAssets,
  borrowedAssets,
  chain
}: {
  marketData?: PoolData | null;
  isLoadingMarketData: boolean;
  rewardToggle: () => void;
  suppliedAssets: MarketData[];
  borrowedAssets: MarketData[];
  chain: number;
}) => {
  const { currentSdk } = useMultiIonic();

  const { data: healthData, isLoading: isLoadingHealthData } = useHealthFactor(
    marketData?.comptroller,
    +chain
  );

  const { data: assetsSupplyAprData } = useTotalSupplyAPYs(
    marketData?.assets ?? [],
    +chain
  );

  const { borrowApr, netAssetValue, supplyApr } = useMemo(() => {
    if (!marketData?.assets || !assetsSupplyAprData || !currentSdk) {
      return {
        avgCollateralApr: '0.00%',
        borrowApr: '0.00%',
        netAssetValue: '$0.00',
        supplyApr: '0.00%',
        totalCollateral: '$0.00'
      };
    }

    try {
      const blocksPerMinute = getBlockTimePerMinuteByChainId(+chain);
      let totalCollateral = 0;
      let avgCollateralApr = 0;
      let borrowApr = 0;
      let supplyApr = 0;
      let memberships = 0;

      marketData.assets.forEach((asset) => {
        if (!asset) return;

        if (asset.membership) {
          totalCollateral += asset.supplyBalanceFiat ?? 0;
          avgCollateralApr += assetsSupplyAprData[asset.cToken]?.apy ?? 0;
          memberships++;
        }

        if (asset.borrowBalanceFiat && asset.borrowRatePerBlock) {
          try {
            borrowApr += currentSdk.ratePerBlockToAPY(
              asset.borrowRatePerBlock,
              blocksPerMinute
            );
          } catch (e) {
            console.warn('Error calculating borrow APR:', e);
          }
        }

        if (asset.supplyBalanceFiat && asset.supplyRatePerBlock) {
          try {
            supplyApr += currentSdk.ratePerBlockToAPY(
              asset.supplyRatePerBlock,
              blocksPerMinute
            );
          } catch (e) {
            console.warn('Error calculating supply APR:', e);
          }
        }
      });

      const finalSupplyApr = supplyApr / (suppliedAssets.length || 1);
      const finalBorrowApr = borrowApr / (borrowedAssets.length || 1);

      return {
        avgCollateralApr: `${(avgCollateralApr / (memberships || 1)).toFixed(2)}%`,
        borrowApr: `${finalBorrowApr.toFixed(2)}%`,
        netAssetValue: `$${millify(
          (marketData?.totalSupplyBalanceFiat ?? 0) -
            (marketData?.totalBorrowBalanceFiat ?? 0),
          { precision: 2 }
        )}`,
        supplyApr: `${finalSupplyApr.toFixed(2)}%`,
        totalCollateral: `$${millify(totalCollateral, { precision: 2 })}`
      };
    } catch (e) {
      console.warn('Error in APR calculations:', e);
      return {
        avgCollateralApr: '0.00%',
        borrowApr: '0.00%',
        netAssetValue: '$0.00',
        supplyApr: '0.00%',
        totalCollateral: '$0.00'
      };
    }
  }, [
    assetsSupplyAprData,
    borrowedAssets,
    currentSdk,
    marketData,
    suppliedAssets,
    chain
  ]);

  const handledHealthData = useMemo<string>(() => {
    if (
      marketData?.totalBorrowBalanceNative === 0 ||
      Number.parseFloat(healthData ?? '0') < 0
    ) {
      return '∞';
    }

    return healthData ?? '∞';
  }, [healthData, marketData]);

  const { data: userNetApr, isLoading: isLoadingUserNetApr } = useUserNetApr();
  const healthColorClass = useMemo<string>(() => {
    const healthDataAsNumber = Number.parseFloat(healthData ?? '0');

    if (isNaN(Number.parseFloat(handledHealthData))) {
      return '';
    }

    if (healthDataAsNumber >= 3) {
      return 'text-accent';
    }

    if (healthDataAsNumber >= 1.5) {
      return 'text-lime';
    }

    return 'text-error';
  }, [handledHealthData, healthData]);

  const allChains: number[] = Object.keys(pools).map(Number);
  const {
    data: claimableRewardsAcrossAllChains,
    isLoading: isLoadingClaimableRewardsAcrossAllChains
  } = useAllClaimableRewards(allChains);

  const totalRewardsAcrossAllChains = useMemo(() => {
    // Early return if the entire rewards array is undefined
    if (!claimableRewardsAcrossAllChains) return 0n;
    if (!Array.isArray(claimableRewardsAcrossAllChains)) return 0n;
    if (!claimableRewardsAcrossAllChains.length) return 0n;

    try {
      const validRewards = claimableRewardsAcrossAllChains.filter(
        (
          reward
        ): reward is { amount: bigint; chainId: number; rewardToken: string } =>
          reward !== null &&
          reward !== undefined &&
          'amount' in reward &&
          'chainId' in reward &&
          'rewardToken' in reward &&
          typeof reward.amount === 'bigint'
      );

      // If no valid rewards after filtering, return early
      if (!validRewards.length) return 0n;

      return validRewards.reduce((acc, reward) => acc + reward.amount, 0n);
    } catch (e) {
      console.warn('Error calculating total rewards:', {
        error: e,
        rewards: claimableRewardsAcrossAllChains
      });
      return 0n;
    }
  }, [claimableRewardsAcrossAllChains]);

  return (
    <div className="lg:grid grid-cols-8 gap-x-3 w-full font-semibold text-base">
      <div className="w-full mb-2 lg:mb-0 bg-grayone rounded-xl py-3 px-6 col-span-3 flex flex-col items-center">
        <div className="w-full flex justify-between pb-6 items-center">
          <span>NET ASSET VALUE</span>
          <ResultHandler
            height="24"
            isLoading={!netAssetValue}
            width="24"
          >
            <span>{netAssetValue}</span>
          </ResultHandler>
        </div>
        <div className="flex items-center justify-between w-full gap-x-3">
          <div className="flex flex-col items-start gap-y-1">
            <p className="text-white/60 text-xs">Total Supply</p>
            <ResultHandler
              height="24"
              isLoading={isLoadingMarketData}
              width="24"
            >
              <p className="font-semibold">
                ${millify(marketData?.totalSupplyBalanceFiat ?? 0)}
              </p>
            </ResultHandler>
          </div>
          <div className="flex flex-col items-start gap-y-1">
            <p className="text-white/60 text-xs">Total Borrow</p>
            <ResultHandler
              height="24"
              isLoading={isLoadingMarketData}
              width="24"
            >
              <p className="font-semibold">
                ${millify(marketData?.totalBorrowBalanceFiat ?? 0)}
              </p>
            </ResultHandler>
          </div>
          <div className="flex flex-col items-start gap-y-1">
            <p className="text-white/60 text-xs">Position Health</p>
            <ResultHandler
              height="24"
              isLoading={isLoadingHealthData}
              width="24"
            >
              <div className="popover-container">
                <p className={`font-semibold ${healthColorClass}`}>
                  {handledHealthData} <i className="popover-hint">i</i>
                </p>
                <div className="popover absolute w-[250px] right-0 md:right-auto top-full md:left-[50%] p-2 mt-1 md:ml-[-125px] border border-lime rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all">
                  Health Factor represents safety of your deposited collateral
                  against the borrowed assets and its underlying value. If the
                  health factor goes below 1, the liquidation of your collateral
                  might be triggered.
                </div>
              </div>
            </ResultHandler>
          </div>
        </div>
      </div>
      <div className="w-full mb-2 lg:mb-0 bg-grayone rounded-xl py-3 px-6 col-span-3 flex flex-col items-center">
        <div className="w-full flex justify-between pb-6 items-center">
          <span>NET APR (All Pools)</span>
          <ResultHandler
            height="24"
            isLoading={isLoadingUserNetApr}
            width="24"
          >
            <div className="popover-container">
              <span>
                {Number(formatEther(userNetApr ?? 0n)).toFixed(2)}%{' '}
                <i className="popover-hint">i</i>
              </span>
              <div className="popover absolute w-[250px] top-full right-0 md:right-auto md:left-[50%] p-2 mt-1 md:ml-[-125px] border border-lime rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all">
                Net APR is the difference between the average borrowing APR you
                are paying versus the average supply APR you are earning. This
                does not include the future value of Ionic points that you are
                earning!
              </div>
            </div>
          </ResultHandler>
        </div>
        <div className="flex items-center justify-between w-full gap-x-3">
          <div className="flex flex-col items-start gap-y-1">
            <p className="text-white/60 text-xs">Avg. Borrowing APR</p>
            <ResultHandler
              height="24"
              isLoading={!borrowApr}
              width="24"
            >
              <p className="font-semibold">{borrowApr}</p>
            </ResultHandler>
          </div>
          <div className="flex flex-col items-start gap-y-1">
            <p className="text-white/60 text-xs">Avg. Supply APR</p>
            <ResultHandler
              height="24"
              isLoading={!supplyApr}
              width="24"
            >
              <p className="font-semibold">{supplyApr}</p>
            </ResultHandler>
          </div>
        </div>
      </div>
      <div className="w-full mb-2 lg:mb-0 bg-grayone rounded-xl py-3 px-6 col-span-2 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-2">
          <span>Claimable Rewards</span>
          <ResultHandler
            height="24"
            isLoading={isLoadingClaimableRewardsAcrossAllChains}
            width="24"
          >
            <span className="flex items-center justify-center gap-1">
              {Math.round(
                +formatEther(totalRewardsAcrossAllChains)
              ).toLocaleString('en-us', {
                maximumFractionDigits: 0
              })}{' '}
              <span className="text-[8px] text-white/50 hidden">
                (ION+hyUSD+eUSD)
              </span>
            </span>
          </ResultHandler>
        </div>
        <div
          className="w-full cursor-pointer rounded-md bg-accent text-black py-2 px-6 text-center text-xs mt-auto"
          onClick={() => rewardToggle()}
        >
          CLAIM ALL REWARDS
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
