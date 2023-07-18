import { Box, Button, Flex, Link, Spinner, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { BiLinkExternal } from 'react-icons/bi';

import { Center } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import UtilizationChart from '@ui/components/shared/UtilizationChart';
import { useIRM } from '@ui/hooks/ionic/useIRM';
import { useChartData } from '@ui/hooks/useChartData';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getScanUrlByChainId } from '@ui/utils/networkData';

export const UtilizationRate = ({ asset, chainId }: { asset: MarketData; chainId: number }) => {
  const scanUrl = useMemo(() => getScanUrlByChainId(chainId), [chainId]);
  const { data } = useChartData(asset.cToken, chainId);
  const { data: irm } = useIRM(asset.cToken, chainId);

  return (
    <CardBox>
      <Flex justifyContent={{ base: 'space-between' }}>
        <Text size={'xl'}>Utilization Rate</Text>
        {irm && (!asset.isBorrowPaused || !asset.totalBorrow.isZero()) && (
          <Link href={`${scanUrl}/address/${irm}`} isExternal rel="noreferrer">
            <Button
              rightIcon={<BiLinkExternal fontSize={'20px'} strokeWidth={'0.5px'} />}
              variant={'ghost'}
            >
              IRM Contract
            </Button>
          </Link>
        )}
      </Flex>
      <Box height="250px" pb={4} width="100%">
        {asset.isBorrowPaused && asset.totalBorrow.isZero() ? (
          <Center height="100%">
            <Text>This asset is not borrowable.</Text>
          </Center>
        ) : data ? (
          data.rates === null ? (
            <Center height="100%">
              <Text>No graph is available for this asset(&apos)s interest curves.</Text>
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
    </CardBox>
  );
};
