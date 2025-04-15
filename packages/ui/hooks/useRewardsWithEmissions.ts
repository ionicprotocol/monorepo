import { useMemo } from 'react';

import { type Address } from 'viem';

import { FLYWHEEL_TYPE_MAP, REWARDS_TO_SYMBOL } from '@ui/constants/index';
import { useMarketEmissions } from '@ui/hooks/market/useMarketEmissions';
import { useRewards } from '@ui/hooks/useRewards';
import type { MarketData } from '@ui/types/TokensDataMap';

import { useFusePoolData } from './useFusePoolData';

import type { FlywheelReward, Reward } from '@ionicprotocol/types';

interface UseRewardsWithEmissionsProps {
  chainId: number;
  poolId: string;
}

export function useRewardsWithEmissions({
  chainId,
  poolId
}: UseRewardsWithEmissionsProps) {
  const { data: poolData, isLoading: isLoadingPoolData } = useFusePoolData(
    poolId,
    +chainId
  );
  const assets = useMemo<MarketData[] | undefined>(
    () => poolData?.assets,
    [poolData]
  );
  const cTokenAddresses = useMemo(
    () => assets?.map((asset) => asset.cToken) ?? [],
    [assets]
  );
  const {
    data: originalRewards,
    isLoading: isLoadingRewards,
    ...rest
  } = useRewards({
    chainId,
    poolId
  });

  const { data: emissionsData, isLoading: isLoadingEmissions } =
    useMarketEmissions({
      chainId: chainId as 8453 | 34443,
      cTokenAddresses
    });

  const data = useMemo(() => {
    if (
      !originalRewards ||
      isLoadingRewards ||
      !emissionsData ||
      isLoadingEmissions
    ) {
      return originalRewards;
    }

    const ionTokenAddress = Object.entries(
      REWARDS_TO_SYMBOL[chainId] || {}
    ).find(([_, symbol]) => symbol === 'ION')?.[0] as Address;

    if (!ionTokenAddress) {
      return originalRewards;
    }

    const updatedRewards: Record<string, Reward[]> = {};

    Object.entries(originalRewards).forEach(([cToken, marketRewards]) => {
      const marketEmissions = emissionsData.data.find(
        (market) => market.cTokenAddress.toLowerCase() === cToken.toLowerCase()
      );

      if (!marketEmissions) {
        updatedRewards[cToken] = marketRewards;
        return;
      }

      const nonIonRewards = marketRewards.filter((reward) => {
        return (reward as FlywheelReward).token !== ionTokenAddress;
      });

      const updatedMarketRewards = [...nonIonRewards];

      const flywheelMap = FLYWHEEL_TYPE_MAP[chainId];

      const supplyFlywheel = (flywheelMap?.supply?.[0] ||
        '0x0000000000000000000000000000000000000000') as Address;
      const borrowFlywheel = (flywheelMap?.borrow?.[0] ||
        '0x0000000000000000000000000000000000000001') as Address;

      if (marketEmissions.supplyEmissions > 0) {
        updatedMarketRewards.push({
          apy: marketEmissions.supplyEmissions / 100,
          token: ionTokenAddress,
          flywheel: supplyFlywheel,
          updated_at: new Date().toISOString()
        } as FlywheelReward);
      }

      if (marketEmissions.borrowEmissions > 0) {
        updatedMarketRewards.push({
          apy: marketEmissions.borrowEmissions / 100,
          token: ionTokenAddress,
          flywheel: borrowFlywheel,
          updated_at: new Date().toISOString()
        } as FlywheelReward);
      }

      updatedRewards[cToken] = updatedMarketRewards;
    });

    Object.keys(originalRewards).forEach((cToken) => {
      if (!updatedRewards[cToken]) {
        updatedRewards[cToken] = originalRewards[cToken];
      }
    });

    return updatedRewards;
  }, [
    originalRewards,
    isLoadingRewards,
    emissionsData,
    isLoadingEmissions,
    chainId
  ]);

  return {
    ...rest,
    data,
    isLoading: isLoadingRewards || isLoadingEmissions || isLoadingPoolData
  };
}
