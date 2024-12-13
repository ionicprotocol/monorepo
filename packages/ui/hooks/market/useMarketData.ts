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
import { useRewards } from '@ui/hooks/useRewards';
import { useSupplyAPYs } from '@ui/hooks/useSupplyAPYs';
import type { MarketData } from '@ui/types/TokensDataMap';

import type { FlywheelReward } from '@ionicprotocol/types';
import { useMerklData } from '../useMerklData';
import { calculateTotalAPR } from '@ui/utils/marketUtils';
import { multipliers } from '@ui/utils/multipliers';

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
  supplyAPRTotalz: number;
  borrowAPRTotalz: number;
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
  const assets = useMemo<MarketData[] | undefined>(
    () => poolData?.assets,
    [poolData]
  );
  const cTokenAddresses = useMemo(
    () => assets?.map((asset) => asset.cToken) ?? [],
    [assets]
  );

  const { data: borrowRates, isLoading: isLoadingBorrowApys } = useBorrowAPYs(
    assets ?? [],
    +chain
  );
  const { data: supplyRates, isLoading: isLoadingSupplyApys } = useSupplyAPYs(
    assets ?? [],
    +chain
  );
  const { data: loopMarkets, isLoading: isLoadingLoopMarkets } = useLoopMarkets(
    poolData?.assets.map((asset) => asset.cToken) ?? [],
    +chain
  );

  const { data: fraxtalAprs, isLoading: isLoadingFraxtalAprs } = useFraxtalAprs(
    assets ?? []
  );

  const { data: borrowCapsData, isLoading: isLoadingBorrowCaps } =
    useBorrowCapsForAssets(cTokenAddresses, +chain);
  const { data: merklAprz, isLoading: isLoadingMerklData } = useMerklData();

  const { data: rewards } = useRewards({
    chainId: +chain,
    poolId: selectedPool
  });

  // Get all cToken addresses for borrow caps query

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
            apy: (reward.apy ?? 0) * 100
          })) as FlywheelReward[];

        const borrowRewards = rewards?.[asset.cToken]
          ?.filter((reward) =>
            FLYWHEEL_TYPE_MAP[+chain]?.borrow?.includes(
              (reward as FlywheelReward).flywheel
            )
          )
          .map((reward) => ({
            ...reward,
            apy: (reward.apy ?? 0) * 100
          })) as FlywheelReward[];

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

        const nativeAssetYield = fraxtalAprs?.[asset.cToken]?.nativeAssetYield;
        const config =
          multipliers[+chain]?.[selectedPool]?.[asset.underlyingSymbol];

        const supplyAPRTotal = calculateTotalAPR({
          type: 'supply',
          baseAPR: supplyRates?.[asset.cToken]
            ? supplyRates[asset.cToken] * 100
            : 0,
          rewards: supplyRewards,
          effectiveNativeYield:
            nativeAssetYield !== undefined
              ? nativeAssetYield * 100
              : config?.supply?.underlyingAPR,
          merklAprForOP: merklAprz?.find(
            (info) =>
              info.token?.toLowerCase() ===
                asset.underlyingToken?.toLowerCase() && info.type === 'supply'
          )?.apr,
          isOp: config?.supply?.op
        });

        const borrowAPRTotal = calculateTotalAPR({
          type: 'borrow',
          baseAPR: borrowRates?.[asset.cToken]
            ? borrowRates[asset.cToken] * 100
            : 0,
          rewards: borrowRewards,
          effectiveNativeYield:
            nativeAssetYield !== undefined
              ? nativeAssetYield * 100
              : config?.borrow?.underlyingAPR,
          merklAprForOP: merklAprz?.find(
            (info) =>
              info.token?.toLowerCase() ===
                asset.underlyingToken?.toLowerCase() && info.type === 'borrow'
          )?.apr,
          isOp: config?.borrow?.op
        });

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
          nativeAssetYield,
          membership: asset.membership,
          cTokenAddress: asset.cToken,
          comptrollerAddress: poolData?.comptroller,
          underlyingDecimals: asset.underlyingDecimals,
          loopPossible: loopMarkets
            ? loopMarkets[asset.cToken].length > 0
            : false,
          supplyRewards,
          borrowRewards,
          isBorrowDisabled: assetBorrowCaps
            ? assetBorrowCaps.totalBorrowCap <= 1
            : false,
          supplyAPRTotal,
          borrowAPRTotal
        };
      })
      .filter(Boolean) as MarketRowData[];

    return transformedData;
  }, [
    assets,
    chain,
    selectedPool,
    rewards,
    supplyRates,
    borrowRates,
    loopMarkets,
    isLoadingFraxtalAprs,
    poolData?.comptroller,
    borrowCapsData
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

  const featuredMarkets = useMemo(() => {
    if (!marketData.length) return [];

    const featuredSymbols = [
      shouldGetFeatured.featuredSupply[+chain][selectedPool]?.toLowerCase(),
      shouldGetFeatured.featuredSupply2[+chain][selectedPool]?.toLowerCase()
    ];

    return marketData.filter((market) =>
      featuredSymbols.includes(market.asset.toLowerCase())
    );
  }, [marketData, chain, selectedPool]);

  return {
    marketData,
    isLoading:
      isLoadingPoolData ||
      isLoadingLoopMarkets ||
      isLoadingFraxtalAprs ||
      isLoadingMerklData ||
      isLoadingBorrowCaps ||
      isLoadingSupplyApys ||
      isLoadingBorrowApys,
    poolData,
    selectedMarketData,
    loopProps,
    featuredMarkets
  };
};
