/*  This is a dynamically imported component on client-side only */

import { Box, Center, Spinner, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';
import Chart from 'react-apexcharts';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useColors } from '@ui/hooks/useColors';
import { FuseIRMDemoChartOptions } from '@ui/utils/chartOptions';
import { convertIRMtoCurve } from '@ui/utils/convertIRMtoCurve';

interface IRMChartProps {
  interestRateModelAddress: string;
  reserveFactor: number;
  adminFee: number;
  poolChainId: number;
}
const IRMChart = ({
  interestRateModelAddress,
  reserveFactor,
  adminFee,
  poolChainId,
}: IRMChartProps) => {
  const { cChart } = useColors();
  const sdk = useSdk(poolChainId);
  const { data, isLoading, error } = useQuery(
    ['irmCurve', interestRateModelAddress, adminFee, reserveFactor, poolChainId],
    async () => {
      if (sdk) {
        const IRM = await sdk.identifyInterestRateModel(interestRateModelAddress);
        if (IRM === null) {
          return null;
        }

        await IRM._init(
          interestRateModelAddress,
          // reserve factor
          // reserveFactor * 1e16,
          utils.parseEther((reserveFactor / 100).toString()),

          // admin fee
          // adminFee * 1e16,
          utils.parseEther((adminFee / 100).toString()),

          // hardcoded 10% Fuse fee
          utils.parseEther((10 / 100).toString()),
          sdk.provider
        );

        return convertIRMtoCurve(sdk, IRM, sdk.chainId);
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled:
        !!interestRateModelAddress && !!adminFee.toString() && !!reserveFactor.toString() && !!sdk,
    }
  );

  return (
    <Center width="100%" height="2xs">
      {isLoading && <Spinner />}
      {error && <Text>{"No graph is available for this asset's interest curves."}</Text>}
      {data && (
        <Box
          height="200px"
          width="100%"
          color="#000000"
          overflow="hidden"
          px={3}
          className="hide-bottom-tooltip"
          flexShrink={0}
        >
          <Chart
            options={{
              ...FuseIRMDemoChartOptions,
              colors: [cChart.borrowColor, cChart.tokenColor],
            }}
            type="line"
            width={'100%'}
            height={'100%'}
            series={[
              {
                name: 'Borrow Rate',
                data: data.borrowerRates,
              },
              {
                name: 'Deposit Rate',
                data: data.supplierRates,
              },
            ]}
          />
        </Box>
      )}
    </Center>
  );
};

export default IRMChart;
