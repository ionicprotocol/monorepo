import type { AssetPrice, ChartData } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { PRICE, TVL } from '@ui/constants/index';

export function useHistoryData(
  mode: string,
  underlyingAddress: string,
  chainId: number,
  milliSeconds: number
) {
  return useQuery<ChartData[] | null>(
    ['useHistoryData', mode, chainId, underlyingAddress, milliSeconds],
    async () => {
      if (mode && chainId && underlyingAddress && milliSeconds) {
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
          } else if (mode === TVL) {
          }

          return info;
        } catch (error) {
          console.error(
            `Unable to fetch historical data of ${mode} of chain \`${chainId}\``,
            error
          );

          return [];
        }
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!chainId && !!underlyingAddress && !!milliSeconds,
      staleTime: Infinity,
    }
  );
}
