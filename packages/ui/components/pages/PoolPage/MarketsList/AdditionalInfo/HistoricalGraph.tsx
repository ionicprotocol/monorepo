import { Box, Center, Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

import { useAssetPrice } from '@ui/hooks/useAssetPrice';
import { useColors } from '@ui/hooks/useColors';
import type { MarketData } from '@ui/types/TokensDataMap';

const AssetPriceChart = dynamic(() => import('@ui/components/shared/AssetPriceChart'), {
  ssr: false,
});

export const HistoricalGraph = ({
  asset,
  poolChainId,
}: {
  asset: MarketData;
  poolChainId: number;
}) => {
  const { cCard } = useColors();
  const { data: assetPriceInfo } = useAssetPrice(asset.underlyingToken, poolChainId);

  return (
    <VStack borderRadius="20" spacing={0} width="100%">
      <Box
        background={cCard.headingBgColor}
        borderBottom="none"
        borderColor={cCard.borderColor}
        borderTopRadius={12}
        borderWidth={2}
        height={14}
        px={4}
        width="100%"
      >
        <Flex alignItems="center" height="100%" justifyContent="space-between">
          <Text py={0.5}>Historical Graph</Text>
        </Flex>
      </Box>
      <Box
        borderBottomRadius={12}
        borderColor={cCard.borderColor}
        borderWidth={2}
        height="250px"
        pb={4}
        width="100%"
      >
        {assetPriceInfo ? (
          <AssetPriceChart assetPriceInfo={assetPriceInfo} />
        ) : (
          <Center height="100%">
            <Spinner />
          </Center>
        )}
      </Box>
    </VStack>
  );
};
