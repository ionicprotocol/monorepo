import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Grid, HStack, Link, Text, VStack } from '@chakra-ui/react';
import type { OpenPosition } from '@midas-capital/types';
import { utils } from 'ethers';
import { useMemo } from 'react';

import CaptionedStat from '@ui/components/shared/CaptionedStat';
import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useBaseCollateral } from '@ui/hooks/leverage/useBaseCollateral';
import { useCurrentLeverageRatio } from '@ui/hooks/leverage/useCurrentLeverageRatio';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useColors } from '@ui/hooks/useColors';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { getScanUrlByChainId } from '@ui/utils/networkData';

export const PositionDetails = ({ position }: { position: OpenPosition }) => {
  const { cCard } = useColors();
  const scanUrl = useMemo(() => getScanUrlByChainId(position.chainId), [position.chainId]);
  const { data: currentLeverageRatio } = useCurrentLeverageRatio(
    position.borrowable.position,
    position.chainId
  );
  const { data: baseCollateral } = useBaseCollateral(
    position.borrowable.position,
    position.chainId
  );
  const { data: usdPrices } = useAllUsdPrices();

  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[position.chainId.toString()]) {
      return usdPrices[position.chainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, position.chainId]);

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
          <Text>Position Details</Text>
          <HStack>
            <Link
              href={`${scanUrl}/address/${position.borrowable.position}`}
              isExternal
              rel="noreferrer"
            >
              <Button rightIcon={<ExternalLinkIcon />} size="xs" variant={'external'}>
                Position Contract
              </Button>
            </Link>
          </HStack>
        </Flex>
      </Box>
      <Box
        borderBottomRadius={12}
        borderColor={cCard.borderColor}
        borderTop="none"
        borderWidth={2}
        py={8}
        width="100%"
      >
        <Grid
          gap={0}
          height="100%"
          templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
          width="100%"
        >
          <CaptionedStat
            caption={'Leverage Ratio'}
            crossAxisAlignment="center"
            stat={
              currentLeverageRatio
                ? Number(utils.formatUnits(currentLeverageRatio)).toFixed(3) + ' x'
                : '-'
            }
          />
          <CaptionedStat
            caption={'TVL'}
            crossAxisAlignment="center"
            stat={
              baseCollateral && usdPrice
                ? smallUsdFormatter(
                    Number(
                      utils.formatUnits(baseCollateral, position.collateral.underlyingDecimals)
                    ) *
                      Number(
                        utils.formatUnits(position.collateral.underlyingPrice, DEFAULT_DECIMALS)
                      ) *
                      usdPrice,
                    true
                  )
                : '-'
            }
          />
        </Grid>
      </Box>
    </VStack>
  );
};
