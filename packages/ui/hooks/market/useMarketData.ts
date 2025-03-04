import { useMemo } from 'react';

import { type Address, formatEther, formatUnits } from 'viem';

import {
  FLYWHEEL_TYPE_MAP,
  pools,
  shouldGetFeatured
} from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useBorrowCapsForAssets } from '@ui/hooks/ionic/useBorrowCapsDataForAsset';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useFraxtalAprs } from '@ui/hooks/useFraxtalApr';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useLoopMarkets } from '@ui/hooks/useLoopMarkets';
import { useSupplyAPYs } from '@ui/hooks/useSupplyAPYs';
import type { MarketData } from '@ui/types/TokensDataMap';
import { calculateTotalAPR } from '@ui/utils/marketUtils';
import { multipliers } from '@ui/utils/multipliers';

import { useTokenBalances } from './useTokenBalances';
import { useMerklData } from '../useMerklData';
import { useRewardsWithEmissions } from '../useRewardsWithEmissions';

import type { FlywheelReward } from '@ionicprotocol/types';

type TokenBalance = {
  amount: number;
  formatted: string;
  amountUSD: number;
  formattedUSD: string;
};

export type MarketRowData = MarketData & {
  asset: string;
  logo: string;
  supply: {
    balance: number;
    balanceUSD: number;
    total: number;
    totalUSD: number;
  };
  borrow: {
    balance: number;
    balanceUSD: number;
    total: number;
    totalUSD: number;
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
  tokenBalance: TokenBalance;
};

export const useMarketData = (
  selectedPool: string,
  chain: number | string,
  selectedSymbol?: string | undefined
) => {
  const { address } = useMultiIonic();
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
  const { data: merklApr, isLoading: isLoadingMerklData } = useMerklData();

  const { data: borrowCapsData, isLoading: isLoadingBorrowCaps } =
    useBorrowCapsForAssets(cTokenAddresses, +chain);

  const { data: rewards, isLoading: isLoadingRewards } =
    useRewardsWithEmissions({
      chainId: +chain,
      poolId: selectedPool
    });

  const { balanceMap } = useTokenBalances({
    assets: assets?.map((asset) => ({
      underlyingToken: asset.underlyingToken,
      underlyingDecimals: asset.underlyingDecimals
    })),
    chainId: chain,
    userAddress: address
  });

  const formatNumber = (value: bigint | number, decimals: number): number => {
    const parsedValue =
      typeof value === 'bigint'
        ? parseFloat(formatUnits(value, decimals))
        : value;

    return Number(parsedValue.toFixed(2));
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
              ? formatNumber(asset.supplyBalance, asset.underlyingDecimals)
              : 0,
          balanceUSD: formatNumber(asset.supplyBalanceFiat, 0),
          total: asset.totalSupplyNative
            ? formatNumber(asset.totalSupply, asset.underlyingDecimals)
            : 0,
          totalUSD: formatNumber(asset.totalSupplyFiat, 0)
        };

        const borrow = {
          balance:
            typeof asset.borrowBalance === 'bigint'
              ? formatNumber(asset.borrowBalance, asset.underlyingDecimals)
              : 0,
          balanceUSD: formatNumber(asset.borrowBalanceFiat, 0),
          total: asset.totalBorrowNative
            ? formatNumber(asset.totalBorrow, asset.underlyingDecimals)
            : 0,
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
          merklAprForOP: config?.supply?.op
            ? merklApr?.find(
                (info) =>
                  info.token?.toLowerCase() ===
                    asset.underlyingToken?.toLowerCase() &&
                  info.type === 'supply'
              )?.apr
            : undefined
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
          merklAprForOP: config?.borrow?.op
            ? merklApr?.find(
                (info) =>
                  info.token?.toLowerCase() ===
                    asset.underlyingToken?.toLowerCase() &&
                  info.type === 'borrow'
              )?.apr
            : undefined
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
          borrowAPRTotal,
          tokenBalance: balanceMap[asset.underlyingToken.toLowerCase()] ?? {
            amount: 0,
            formatted: '0.00',
            amountUSD: 0,
            formattedUSD: '$0.00'
          }
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
    supplyRates,
    borrowRates,
    loopMarkets,
    isLoadingFraxtalAprs,
    poolData?.comptroller,
    borrowCapsData,
    balanceMap
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
      shouldGetFeatured.featuredSupply[+chain]?.[selectedPool]?.toLowerCase(),
      shouldGetFeatured.featuredSupply2[+chain]?.[selectedPool]?.toLowerCase()
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
      isLoadingBorrowApys ||
      isLoadingRewards,
    poolData,
    selectedMarketData,
    loopProps,
    featuredMarkets
  };
};
