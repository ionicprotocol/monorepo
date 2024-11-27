import { useQuery } from '@tanstack/react-query';
import { parseEther, getContract } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import type { MarketData } from '@ui/types/TokensDataMap';
import { convertIRMtoCurve } from '@ui/utils/convertIRMtoCurve';

import { cTokenFirstExtensionAbi } from '@ionicprotocol/sdk/src';

export function useAssetChartData(
  marketData: MarketData | undefined,
  chainId: number
) {
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: ['useAssetChartData', marketData?.cToken, chainId],
    queryFn: async () => {
      if (!marketData?.cToken || !sdk?.publicClient) return null;

      const cTokenContract = getContract({
        address: marketData.cToken,
        abi: cTokenFirstExtensionAbi,
        client: sdk.publicClient
      });

      const irm = await cTokenContract.read.interestRateModel();
      if (!irm) return null;

      const interestRateModel = await sdk.identifyInterestRateModel(irm);
      if (!interestRateModel) return null;

      await interestRateModel._init(
        irm,
        parseEther((Number(marketData.reserveFactor) / 1e16 / 100).toString()),
        parseEther((Number(marketData.adminFee) / 1e16 / 100).toString()),
        parseEther('0.1'), // 10% Fuse fee
        sdk.publicClient
      );

      const rawData = await convertIRMtoCurve(sdk, interestRateModel, chainId);
      if (!rawData?.rates) return null;

      return {
        rates: rawData.rates,
        formattedData: {
          labels: rawData.rates.map(
            (point) => `${point.utilization.toFixed(0)}%`
          ),
          datasets: [
            {
              label: 'Borrow Rate',
              data: rawData.rates.map((point) => point.borrowRate),
              borderColor: '#ff3863ff',
              backgroundColor: '#ff386310',
              fill: true
            },
            {
              label: 'Supply Rate',
              data: rawData.rates.map((point) => point.depositRate),
              borderColor: '#3bff89ff',
              backgroundColor: '#3bff8910',
              fill: true
            }
          ]
        },
        interestRateModelAddress: irm
      };
    },
    enabled: Boolean(marketData?.cToken && sdk?.publicClient)
  });
}
