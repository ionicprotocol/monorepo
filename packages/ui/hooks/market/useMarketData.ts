import { useEffect, useMemo } from 'react';

import { type Address, formatEther, formatUnits } from 'viem';

import {
  FLYWHEEL_TYPE_MAP,
  pools,
  shouldGetFeatured
} from '@ui/constants/index';
import { useBorrowCapsForAssets } from '@ui/hooks/ionic/useBorrowCapsDataForAsset';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useFraxtalAprs } from '@ui/hooks/useFraxtalApr';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useLoopMarkets } from '@ui/hooks/useLoopMarkets';
import { useMerklApr } from '@ui/hooks/useMerklApr';
import { useRewards } from '@ui/hooks/useRewards';
import { useSupplyAPYs } from '@ui/hooks/useSupplyAPYs';
import { useStore } from '@ui/store/Store';
import type { MarketData } from '@ui/types/TokensDataMap';

import type { FlywheelReward } from '@ionicprotocol/types';

export type MarketRowData = MarketData & {
  asset: string;
  logo: string;
  supply: {
    balance: string;
    balanceUSD: string;
    total: string;
    totalUSD: string;
  };
  borrow: {
    balance: string;
    balanceUSD: string;
    total: string;
    totalUSD: string;
  };
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
  underlyingSymbol: string;
  nativeAssetYield: number | undefined;
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

  const { data: fraxtalAprs, isLoading: isLoadingFraxtalAprs } = useFraxtalAprs(
    assets ?? []
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

  const formatNumber = (value: bigint | number, decimals: number): string => {
    const parsedValue =
      typeof value === 'bigint'
        ? parseFloat(formatUnits(value, decimals))
        : value;

    return parsedValue.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const marketData = useMemo(() => {
    if (!assets) return [];

    const transformedData = pools[+chain].pools[+selectedPool].assets
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
            apy: 5
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

        const supply = {
          balance:
            typeof asset.supplyBalance === 'bigint'
              ? `${formatNumber(asset.supplyBalance, asset.underlyingDecimals)} ${asset.underlyingSymbol}`
              : `0 ${asset.underlyingSymbol}`,
          balanceUSD: formatNumber(asset.supplyBalanceFiat, 0),
          total: asset.totalSupplyNative
            ? `${formatNumber(asset.totalSupply, asset.underlyingDecimals)} ${asset.underlyingSymbol}`
            : `0 ${asset.underlyingSymbol}`,
          totalUSD: formatNumber(asset.totalSupplyFiat, 0)
        };

        const borrow = {
          balance:
            typeof asset.borrowBalance === 'bigint'
              ? `${formatNumber(asset.borrowBalance, asset.underlyingDecimals)} ${asset.underlyingSymbol}`
              : `0 ${asset.underlyingSymbol}`,
          balanceUSD: formatNumber(asset.borrowBalanceFiat, 0),
          total: asset.totalBorrowNative
            ? `${formatNumber(asset.totalBorrow, asset.underlyingDecimals)} ${asset.underlyingSymbol}`
            : `0 ${asset.underlyingSymbol}`,
          totalUSD: formatNumber(asset.totalBorrowFiat, 0)
        };

        return {
          ...asset,
          asset: asset.underlyingSymbol,
          logo: `/img/symbols/32/color/${asset.underlyingSymbol.toLowerCase()}.png`,
          supply,
          borrow,
          supplyAPR: supplyRates?.[asset.cToken]
            ? supplyRates[asset.cToken] * 100
            : 0,
          borrowAPR: borrowRates?.[asset.cToken]
            ? borrowRates[asset.cToken] * 100
            : 0,
          collateralFactor: Number(formatEther(asset.collateralFactor)) * 100,
          nativeAssetYield: fraxtalAprs?.[asset.cToken]?.nativeAssetYield,
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

    return transformedData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    assets,
    chain,
    selectedPool,
    rewards,
    merklApr,
    supplyRates,
    borrowRates,
    loopMarkets,
    isLoadingFraxtalAprs,
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

  const selectedMarketData = useMemo(() => {
    const found = assets?.find(
      (asset) => asset.underlyingSymbol === selectedSymbol
    );
    return found;
  }, [assets, selectedSymbol]);

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
