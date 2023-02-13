/*  This is a dynamically imported component on client-side only */

import { Box, Center, Spinner, Text } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

import { useAssetChartData } from '@ui/hooks/useAssetChartData';

const UtilizationChart = dynamic(() => import('@ui/components/shared/UtilizationChart'), {
  ssr: false,
});

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
  const { data, isLoading, error } = useAssetChartData(
    interestRateModelAddress,
    reserveFactor,
    adminFee,
    poolChainId
  );

  return (
    <Center height="2xs" width="100%">
      {isLoading && <Spinner />}
      {error && <Text>{"No graph is available for this asset's interest curves."}</Text>}
      {data && (
        <Box height="200px" px={3} width="100%">
          <UtilizationChart irmToCurve={data} />
        </Box>
      )}
    </Center>
  );
};

export default IRMChart;
