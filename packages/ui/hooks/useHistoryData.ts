import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { APY, PRICE, TVL } from '@ui/constants/index';

import { useUsdPrice } from './useUsdPrices';

import type { Address } from 'viem';

import type {
  AssetPrice,
  AssetTotalApy,
  AssetTvl,
  ChartData
} from '@ionicprotocol/types';

export function useHistoryData(
  mode: string,
  underlyingAddress: Address,
  cTokenAddress: Address,
  chainId: number,
  milliSeconds: number
) {
  const { data: usdPrice } = useUsdPrice(chainId);

  return useQuery({
    queryKey: [
      'useHistoryData',
      mode,
      chainId,
      underlyingAddress,
      cTokenAddress,
      milliSeconds,
      usdPrice
    ],

    queryFn: async () => {
      if (
        mode &&
        chainId &&
        underlyingAddress &&
        cTokenAddress &&
        milliSeconds
      ) {
        try {
          const info: ChartData[] = [];

          if (mode === PRICE) {
            const { data: prices } = await axios.get(
              `/api/assetPrice?chainId=${chainId}&underlyingAddress=${underlyingAddress}&milliSeconds=${
                Date.now() - milliSeconds
              }`
            );

            prices.map((data: AssetPrice) => {
              info.push({ createdAt: data.createdAt, price: data.usdPrice });
            });
          } else if (mode === TVL && usdPrice !== undefined) {
            const { data: tvls } = await axios.get(
              `/api/assetTvl?chainId=${chainId}&cTokenAddress=${cTokenAddress}&milliSeconds=${
                Date.now() - milliSeconds
              }`
            );

            tvls.map((data: AssetTvl) => {
              info.push({
                createdAt: data.createdAt,
                tvl: data.tvlNative * (usdPrice || 0)
              });
            });
          } else if (mode === APY) {
            const { data: apys } = await axios.get(
              `/api/assetTotalApy?chainId=${chainId}&cTokenAddress=${cTokenAddress}&milliSeconds=${
                Date.now() - milliSeconds
              }`
            );

            apys.map((data: AssetTotalApy) => {
              const { createdAt, ...rest } = data;
              info.push({
                createdAt,
                ...rest
              });
            });
          }

          return info;
        } catch (error) {
          console.error(
            `Unable to fetch historical ${mode} data of chain \`${chainId}\``,
            error
          );

          return [];
        }
      } else {
        return null;
      }
    },

    gcTime: Infinity,

    enabled:
      !!mode &&
      !!chainId &&
      !!underlyingAddress &&
      !!cTokenAddress &&
      !!milliSeconds,

    staleTime: Infinity
  });
}
