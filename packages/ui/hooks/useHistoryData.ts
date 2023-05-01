import type { AssetPrice, AssetTvl, ChartData } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo } from 'react';

import { PRICE, TVL } from '@ui/constants/index';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';

export function useHistoryData(
  mode: string,
  underlyingAddress: string,
  cTokenAddress: string,
  chainId: number,
  milliSeconds: number
) {
  const { data: usdPrices } = useAllUsdPrices();

  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[chainId.toString()]) {
      return usdPrices[chainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, chainId]);

  return useQuery<ChartData[] | null>(
    ['useHistoryData', mode, chainId, underlyingAddress, cTokenAddress, milliSeconds, usdPrice],
    async () => {
      if (mode && chainId && underlyingAddress && cTokenAddress && milliSeconds) {
        try {
          const info: ChartData[] = [];

          if (mode === PRICE) {
            const { data: prices } = await axios.get(
              `/api/assetPrice?chainId=${chainId}&underlyingAddress=${underlyingAddress}&milliSeconds=${
                Date.now() - milliSeconds
              }`
            );

            prices.map((data: AssetPrice) => {
              info.push({ xAxis: data.createdAt, yAxis: data.usdPrice, yAxisType: '$' });
            });
          } else if (mode === TVL && usdPrice !== undefined) {
            const { data: tvls } = await axios.get(
              `/api/assetTvl?chainId=${chainId}&cTokenAddress=${cTokenAddress}&milliSeconds=${
                Date.now() - milliSeconds
              }`
            );

            tvls.map((data: AssetTvl) => {
              info.push({
                xAxis: data.createdAt,
                yAxis: data.tvlNative * usdPrice,
                yAxisType: '$',
              });
            });
          }

          return info;
        } catch (error) {
          console.error(`Unable to fetch historical ${mode} data of chain \`${chainId}\``, error);

          return [];
        }
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!mode && !!chainId && !!underlyingAddress && !!cTokenAddress && !!milliSeconds,
      staleTime: Infinity,
    }
  );
}
