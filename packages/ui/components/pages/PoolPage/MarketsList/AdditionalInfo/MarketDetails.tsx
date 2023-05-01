import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Grid, HStack, Link, Text, VStack } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useMemo } from 'react';

import CaptionedStat from '@ui/components/shared/CaptionedStat';
import {
  ADMIN_FEE_TOOLTIP,
  ASSET_BORROWED_TOOLTIP,
  ASSET_SUPPLIED_TOOLTIP,
  LOAN_TO_VALUE_TOOLTIP,
  PERFORMANCE_FEE_TOOLTIP,
  RESERVE_FACTOR_TOOLTIP,
} from '@ui/constants/index';
import { useOracle } from '@ui/hooks/fuse/useOracle';
import { useBorrowCap } from '@ui/hooks/useBorrowCap';
import { useColors } from '@ui/hooks/useColors';
import { usePerformanceFee } from '@ui/hooks/usePerformanceFee';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { getScanUrlByChainId } from '@ui/utils/networkData';

export const MarketDetails = ({
  asset,
  comptrollerAddress,
  poolChainId,
}: {
  asset: MarketData;
  comptrollerAddress: string;
  poolChainId: number;
}) => {
  const { cCard } = useColors();
  const scanUrl = useMemo(() => getScanUrlByChainId(poolChainId), [poolChainId]);
  const { data: performanceFee } = usePerformanceFee(poolChainId, asset.plugin);
  const { data: supplyCaps } = useSupplyCap({
    chainId: poolChainId,
    comptroller: comptrollerAddress,
    market: asset,
  });
  const { data: borrowCaps } = useBorrowCap({
    chainId: poolChainId,
    comptroller: comptrollerAddress,
    market: asset,
  });
  const { data: oracle } = useOracle(asset.underlyingToken, poolChainId);

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
          <Text>Market Details</Text>
          <HStack>
            {oracle && (
              <Link href={`${scanUrl}/address/${oracle}`} isExternal rel="noreferrer">
                <Button rightIcon={<ExternalLinkIcon />} size="xs" variant={'external'}>
                  Oracle Contract
                </Button>
              </Link>
            )}
            <Link href={`${scanUrl}/address/${asset.underlyingToken}`} isExternal rel="noreferrer">
              <Button rightIcon={<ExternalLinkIcon />} size="xs" variant={'external'}>
                Token Contract
              </Button>
            </Link>
            <Link href={`${scanUrl}/address/${asset.cToken}`} isExternal rel="noreferrer">
              <Button rightIcon={<ExternalLinkIcon />} size="xs" variant={'external'}>
                Market Contract
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
        height="250px"
        width="100%"
      >
        <Grid
          gap={0}
          height="100%"
          templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
          width="100%"
        >
          <CaptionedStat
            caption={'Asset Supplied'}
            crossAxisAlignment="center"
            secondStat={supplyCaps ? smallUsdFormatter(supplyCaps.usdCap, true) : undefined}
            stat={smallUsdFormatter(asset.totalSupplyFiat, true)}
            tooltip={supplyCaps ? ASSET_SUPPLIED_TOOLTIP : undefined}
          />
          <CaptionedStat
            caption={'Asset Borrowed'}
            crossAxisAlignment="center"
            secondStat={
              !asset.isBorrowPaused && borrowCaps
                ? smallUsdFormatter(borrowCaps.usdCap, true)
                : undefined
            }
            stat={asset.isBorrowPaused ? '-' : smallUsdFormatter(asset.totalBorrowFiat, true)}
            tooltip={borrowCaps ? ASSET_BORROWED_TOOLTIP : undefined}
          />
          <CaptionedStat
            caption={'Asset Utilization'}
            crossAxisAlignment="center"
            stat={asset.isBorrowPaused ? '-' : asset.utilization.toFixed(0) + '%'}
          />
          <CaptionedStat
            caption={'Loan-to-Value'}
            crossAxisAlignment="center"
            stat={Number(utils.formatUnits(asset.collateralFactor, 16)).toFixed(0) + '%'}
            tooltip={LOAN_TO_VALUE_TOOLTIP}
          />

          <CaptionedStat
            caption={'Reserve Factor'}
            crossAxisAlignment="center"
            stat={Number(utils.formatUnits(asset.reserveFactor, 16)).toFixed(0) + '%'}
            tooltip={RESERVE_FACTOR_TOOLTIP}
          />
          <CaptionedStat
            caption={'Admin Fee'}
            crossAxisAlignment="center"
            stat={Number(utils.formatUnits(asset.adminFee, 16)).toFixed(1) + '%'}
            tooltip={ADMIN_FEE_TOOLTIP}
          />
          {performanceFee !== undefined ? (
            <CaptionedStat
              caption={'Performance Fee'}
              crossAxisAlignment="center"
              stat={`${performanceFee}%`}
              tooltip={PERFORMANCE_FEE_TOOLTIP}
            />
          ) : null}
        </Grid>
      </Box>
    </VStack>
  );
};
