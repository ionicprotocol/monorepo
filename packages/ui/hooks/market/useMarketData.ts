// hooks/useMarketData.ts
import { useEffect, useMemo } from 'react';

import { type Address, formatEther, formatUnits } from 'viem';

import {
  FLYWHEEL_TYPE_MAP,
  pools,
  shouldGetFeatured
} from '@ui/constants/index';
import { useBorrowCapsForAssets } from '@ui/hooks/ionic/useBorrowCapsDataForAsset';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useLoopMarkets } from '@ui/hooks/useLoopMarkets';
import { useMerklApr } from '@ui/hooks/useMerklApr';
import { useRewards } from '@ui/hooks/useRewards';
import { useSupplyAPYs } from '@ui/hooks/useSupplyAPYs';
import type { MarketData } from '@ui/types/TokensDataMap';

import type { FlywheelReward } from '@ionicprotocol/types';
import { useStore } from '@ui/store/Store';

export type MarketRowData = MarketData & {
  asset: string;
  logo: string;
  supplyBalance: string;
  totalSupplied: string;
  borrowBalance: string;
  totalBorrowing: string;
  supplyAPR: number;
  borrowAPR: number;
  collateralFactor: number;
  membership: boolean;
  cTokenAddress: Address;
  comptrollerAddress: Address;
  underlyingDecimals: number;
  loopPossible: boolean;
  supplyRewards: FlywheelReward[];
  borrowRewards: FlywheelReward[];
  supplyAPRTotal: number | undefined;
  borrowAPRTotal: number | undefined;
  isBorrowDisabled: boolean;
};

export const useMarketData = (
  selectedPool: string,
  chain: number | string,
  selectedSymbol: string | undefined
) => {
  const { data: poolData, isLoading: isLoadingPoolData } = useFusePoolData(
    selectedPool,
    +chain
  );

  const setFeaturedSupply = useStore((state) => state.setFeaturedSupply);
  const setFeaturedSupply2 = useStore((state) => state.setFeaturedSupply2);

  const assets = useMemo<MarketData[] | undefined>(
    () => poolData?.assets,
    [poolData]
  );

  const { data: borrowRates } = useBorrowAPYs(assets ?? [], +chain);
  const { data: supplyRates } = useSupplyAPYs(assets ?? [], +chain);
  const { data: merklApr } = useMerklApr();
  const { data: loopMarkets, isLoading: isLoadingLoopMarkets } = useLoopMarkets(
    poolData?.assets.map((asset) => asset.cToken) ?? [],
    +chain
  );

  const { data: rewards } = useRewards({
    chainId: +chain,
    poolId: selectedPool
  });

  // Get all cToken addresses for borrow caps query
  const cTokenAddresses = useMemo(
    () => assets?.map((asset) => asset.cToken) ?? [],
    [assets]
  );

  // Query borrow caps for all assets at once
  const { data: borrowCapsData } = useBorrowCapsForAssets(
    cTokenAddresses,
    +chain
  );

  const marketData = useMemo(() => {
    if (!assets) return [];

    return pools[+chain].pools[+selectedPool].assets
      .map((symbol: string) => {
        const asset = assets.find((a) => a.underlyingSymbol === symbol);
        if (!asset) return null;

        const supplyRewards = rewards?.[asset.cToken]
          ?.filter((reward) =>
            FLYWHEEL_TYPE_MAP[+chain]?.supply?.includes(
              (reward as FlywheelReward).flywheel
            )
          )
          .map((reward) => ({
            ...reward,
            apy: (reward.apy ?? 0) * 100
          }));

        const borrowRewards = rewards?.[asset.cToken]
          ?.filter((reward) =>
            FLYWHEEL_TYPE_MAP[+chain]?.borrow?.includes(
              (reward as FlywheelReward).flywheel
            )
          )
          .map((reward) => ({
            ...reward,
            apy: (reward.apy ?? 0) * 100
          }));

        const merklAprForToken = merklApr?.find(
          (a) => Object.keys(a)[0].toLowerCase() === asset.cToken.toLowerCase()
        )?.[asset.cToken];

        const totalSupplyRewardsAPR =
          (supplyRewards?.reduce((acc, reward) => acc + (reward.apy ?? 0), 0) ??
            0) + (merklAprForToken ?? 0);

        const totalBorrowRewardsAPR =
          borrowRewards?.reduce((acc, reward) => acc + (reward.apy ?? 0), 0) ??
          0;

        // Get borrow caps for this specific asset from the bulk query result
        const assetBorrowCaps = borrowCapsData?.[asset.cToken];

        return {
          ...asset,
          asset: asset.underlyingSymbol,
          logo: `/img/symbols/32/color/${asset.underlyingSymbol.toLowerCase()}.png`,
          supplyBalance: `${
            typeof asset.supplyBalance === 'bigint'
              ? parseFloat(
                  formatUnits(asset.supplyBalance, asset.underlyingDecimals)
                ).toLocaleString('en-US', { maximumFractionDigits: 2 })
              : '0'
          } ${asset.underlyingSymbol} / $${asset.supplyBalanceFiat.toLocaleString(
            'en-US',
            { maximumFractionDigits: 2 }
          )}`,
          totalSupplied: `${
            asset.totalSupplyNative
              ? parseFloat(
                  formatUnits(asset.totalSupply, asset.underlyingDecimals)
                ).toLocaleString('en-US', { maximumFractionDigits: 2 })
              : '0'
          } ${asset.underlyingSymbol} / $${asset.totalSupplyFiat.toLocaleString(
            'en-US',
            { maximumFractionDigits: 2 }
          )}`,
          borrowBalance: `${
            typeof asset.borrowBalance === 'bigint'
              ? parseFloat(
                  formatUnits(asset.borrowBalance, asset.underlyingDecimals)
                ).toLocaleString('en-US', { maximumFractionDigits: 2 })
              : '0'
          } ${asset.underlyingSymbol} / $${asset.borrowBalanceFiat.toLocaleString(
            'en-US',
            { maximumFractionDigits: 2 }
          )}`,
          totalBorrowing: `${
            asset.totalBorrowNative
              ? parseFloat(
                  formatUnits(asset.totalBorrow, asset.underlyingDecimals)
                ).toLocaleString('en-US', { maximumFractionDigits: 2 })
              : '0'
          } ${asset.underlyingSymbol} / $${asset.totalBorrowFiat.toLocaleString(
            'en-US',
            { maximumFractionDigits: 2 }
          )}`,
          supplyAPR: supplyRates?.[asset.cToken]
            ? supplyRates[asset.cToken] * 100
            : 0,
          borrowAPR: borrowRates?.[asset.cToken]
            ? borrowRates[asset.cToken] * 100
            : 0,
          collateralFactor: Number(formatEther(asset.collateralFactor)) * 100,
          membership: asset.membership,
          cTokenAddress: asset.cToken,
          comptrollerAddress: poolData?.comptroller,
          underlyingDecimals: asset.underlyingDecimals,
          loopPossible: loopMarkets
            ? loopMarkets[asset.cToken].length > 0
            : false,
          supplyRewards,
          borrowRewards,
          supplyAPRTotal: supplyRates?.[asset.cToken]
            ? supplyRates[asset.cToken] * 100 + totalSupplyRewardsAPR
            : undefined,
          borrowAPRTotal: borrowRates?.[asset.cToken]
            ? 0 - borrowRates[asset.cToken] * 100 + totalBorrowRewardsAPR
            : undefined,
          isBorrowDisabled: assetBorrowCaps
            ? assetBorrowCaps.totalBorrowCap <= 1
            : false
        };
      })
      .filter(Boolean) as MarketRowData[];
  }, [
    assets,
    chain,
    selectedPool,
    rewards,
    merklApr,
    supplyRates,
    borrowRates,
    loopMarkets,
    poolData?.comptroller,
    borrowCapsData
  ]);

  useEffect(() => {
    if (!marketData.length) return;

    // Find and set featured supply assets based on shouldGetFeatured mapping
    marketData.forEach((market) => {
      // Check if this market is featured supply 1
      if (
        shouldGetFeatured.featuredSupply[+chain][
          selectedPool
        ]?.toLowerCase() === market.asset.toLowerCase()
      ) {
        console.log('yeee');
        setFeaturedSupply({
          asset: market.asset,
          supplyAPR: market.supplyAPR,
          supplyAPRTotal: market.supplyAPRTotal,
          rewards: market.supplyRewards,
          dropdownSelectedChain: +chain,
          selectedPoolId: selectedPool,
          cToken: market.cTokenAddress,
          pool: market.comptrollerAddress
        });
      }

      // Check if this market is featured supply 2
      if (
        shouldGetFeatured.featuredSupply2[+chain][
          selectedPool
        ]?.toLowerCase() === market.asset.toLowerCase()
      ) {
        setFeaturedSupply2({
          asset: market.asset,
          supplyAPR: market.supplyAPR,
          supplyAPRTotal: market.supplyAPRTotal,
          rewards: market.supplyRewards,
          dropdownSelectedChain: +chain,
          selectedPoolId: selectedPool,
          cToken: market.cTokenAddress,
          pool: market.comptrollerAddress
        });
      }
    });
  }, [
    marketData,
    chain,
    selectedPool,
    setFeaturedSupply,
    setFeaturedSupply2,
    poolData?.comptroller
  ]);

  const selectedMarketData = marketData.find(
    (asset) => asset.asset === selectedSymbol
  );

  const loopProps = useMemo(() => {
    if (!selectedMarketData || !poolData) return null;
    return {
      borrowableAssets: loopMarkets
        ? loopMarkets[selectedMarketData.cToken]
        : [],
      comptrollerAddress: poolData.comptroller,
      selectedCollateralAsset: selectedMarketData
    };
  }, [selectedMarketData, poolData, loopMarkets]);

  return {
    marketData,
    isLoading: isLoadingPoolData,
    poolData,
    selectedMarketData,
    loopProps
  };
};
