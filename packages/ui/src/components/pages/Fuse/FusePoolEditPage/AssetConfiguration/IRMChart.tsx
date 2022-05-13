/*  This is a dynamically imported component on client-side only */

import { Box, Center, Spinner, Text } from '@chakra-ui/react';
import { utils } from 'ethers';
import Chart from 'react-apexcharts';
import { useQuery } from 'react-query';

import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';
import { FuseIRMDemoChartOptions } from '@utils/chartOptions';
import { convertIRMtoCurve } from '@utils/convertIRMtoCurve';

interface IRMChartProps {
  interestRateModelAddress: string;
  reserveFactor: number;
  adminFee: number;
}
const IRMChart = ({ interestRateModelAddress, reserveFactor, adminFee }: IRMChartProps) => {
  const { cChart } = useColors();
  const { fuse } = useRari();
  const { data, isLoading, error } = useQuery(
    ['irmCurve', interestRateModelAddress, adminFee, reserveFactor],
    async () => {
      const IRM = await fuse.identifyInterestRateModel(interestRateModelAddress);
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
        fuse.provider
      );

      return convertIRMtoCurve(IRM);
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
