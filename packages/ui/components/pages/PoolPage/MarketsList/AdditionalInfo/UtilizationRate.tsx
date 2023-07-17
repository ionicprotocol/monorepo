import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Center, Flex, Link, Spinner, Text, VStack } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

import { useIRM } from '@ui/hooks/fuse/useIRM';
import { useChartData } from '@ui/hooks/useChartData';
import { useColors } from '@ui/hooks/useColors';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getScanUrlByChainId } from '@ui/utils/networkData';

const UtilizationChart = dynamic(() => import('@ui/components/shared/UtilizationChart'), {
  ssr: false
});

export const UtilizationRate = ({
  asset,
  poolChainId
}: {
  asset: MarketData;
  poolChainId: number;
}) => {
  const { cCard } = useColors();
  const scanUrl = useMemo(() => getScanUrlByChainId(poolChainId), [poolChainId]);
  const { data } = useChartData(asset.cToken, poolChainId);
  const { data: irm } = useIRM(asset.cToken, poolChainId);

  return (
    <VStack borderRadius="20" spacing={0} width="100%">
      <Box
        background={cCard.headingBgColor}
        borderColor={cCard.borderColor}
        borderTopRadius={12}
        borderWidth={2}
        height={14}
        px={4}
        width="100%"
      >
        <Flex alignItems="center" height="100%" justifyContent="space-between">
          <Text py={0.5}>Utilization Rate</Text>
          {irm && (!asset.isBorrowPaused || !asset.totalBorrow.isZero()) && (
            <Link href={`${scanUrl}/address/${irm}`} isExternal rel="noreferrer">
              <Button rightIcon={<ExternalLinkIcon />} size="xs" variant={'external'}>
                IRM Contract
              </Button>
            </Link>
          )}
        </Flex>
      </Box>
      <Box
        borderBottomRadius={12}
        borderColor={cCard.borderColor}
        borderTop="none"
        borderWidth={2}
        height="250px"
        pb={4}
        width="100%"
      >
        {asset.isBorrowPaused && asset.totalBorrow.isZero() ? (
          <Center height="100%">
            <Text size="md">This asset is not borrowable.</Text>
          </Center>
        ) : data ? (
          data.rates === null ? (
            <Center height="100%">
              <Text size="md">No graph is available for this asset(&apos)s interest curves.</Text>
            </Center>
          ) : (
            <UtilizationChart currentUtilization={asset.utilization.toFixed(0)} irmToCurve={data} />
          )
        ) : (
          <Center height="100%">
            <Spinner />
          </Center>
        )}
      </Box>
    </VStack>
  );
};
