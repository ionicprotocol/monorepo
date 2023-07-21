import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Grid, HStack, Link, Text, VStack } from '@chakra-ui/react';
import type { OpenPosition, PositionInfo } from '@ionicprotocol/types';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { SupplyApy as MarketSupplyApy } from '@ui/components/pages/PoolPage/MarketsList/SupplyApy';
import CaptionedStat, { Caption } from '@ui/components/shared/CaptionedStat';
import { Column } from '@ui/components/shared/Flex';
import {
  DEBT_RATIO_TOOLTIP,
  EQUITY_VALUE_TOOLTIP,
  LIQUIDATION_THRESHOLD_TOOLTIP
} from '@ui/constants/index';
import { useCurrentLeverageRatio } from '@ui/hooks/leverage/useCurrentLeverageRatio';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useAssets } from '@ui/hooks/useAssets';
import { useColors } from '@ui/hooks/useColors';
import { useRewardsForMarket } from '@ui/hooks/useRewards';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';
import { getScanUrlByChainId } from '@ui/utils/networkData';

export const PositionDetails = ({
  position,
  positionInfo
}: {
  position: OpenPosition;
  positionInfo: PositionInfo | null;
}) => {
  const { cCard } = useColors();
  const scanUrl = useMemo(() => getScanUrlByChainId(position.chainId), [position.chainId]);
  const { data: currentLeverageRatio } = useCurrentLeverageRatio(
    position.address,
    position.chainId
  );
  const { data: usdPrice } = useUsdPrice(position.chainId.toString());
  const { data: allRewards } = useRewardsForMarket({
    asset: {
      cToken: position.collateral.cToken,
      plugin: position.collateral.plugin
    },
    chainId: Number(position.chainId),
    poolAddress: position.collateral.pool
  });
  const { data: assetInfos } = useAssets([position.chainId]);
  const { data: totalSupplyApyPerAsset } = useTotalSupplyAPYs(
    [
      {
        cToken: position.collateral.cToken,
        supplyRatePerBlock: position.collateral.supplyRatePerBlock,
        underlyingSymbol: position.collateral.symbol,
        underlyingToken: position.collateral.underlyingToken
      }
    ],
    position.chainId,
    allRewards,
    assetInfos
  );

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
            <Link href={`${scanUrl}/address/${position.address}`} isExternal rel="noreferrer">
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
          gap={8}
          height="100%"
          templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
          width="100%"
        >
          <CaptionedStat
            caption={'Leverage Ratio'}
            crossAxisAlignment="center"
            stat={currentLeverageRatio ? currentLeverageRatio.toFixed(3) + ' x' : '-'}
          />
          <CaptionedStat
            caption={'Equity Value'}
            crossAxisAlignment="center"
            secondStat={
              positionInfo && usdPrice
                ? `${smallFormatter(
                    parseFloat(
                      utils.formatUnits(
                        positionInfo.equityAmount,
                        position.collateral.underlyingDecimals
                      )
                    ),
                    true
                  )} ${position.collateral.symbol}`
                : '-'
            }
            stat={
              positionInfo && usdPrice
                ? smallUsdFormatter(
                    Number(utils.formatUnits(positionInfo.equityValue)) * usdPrice,
                    true
                  )
                : '-'
            }
            tooltip={EQUITY_VALUE_TOOLTIP}
          />
          {allRewards && totalSupplyApyPerAsset ? (
            <Column gap={2} mainAxisAlignment="center">
              <HStack>
                <Caption textAlign="center">Supply Apy</Caption>
              </HStack>
              <HStack>
                <MarketSupplyApy
                  asset={{
                    cToken: position.collateral.cToken,
                    plugin: position.collateral.plugin,
                    supplyRatePerBlock: position.collateral.supplyRatePerBlock,
                    underlyingSymbol: position.collateral.symbol,
                    underlyingToken: position.collateral.underlyingToken
                  }}
                  poolChainId={position.chainId}
                  rewards={allRewards}
                  totalApy={totalSupplyApyPerAsset[position.collateral.cToken].totalApy}
                />
              </HStack>
            </Column>
          ) : (
            '-'
          )}
          <CaptionedStat
            caption={'Debt Ratio'}
            crossAxisAlignment="center"
            stat={
              positionInfo
                ? `${(Number(utils.formatUnits(positionInfo.debtRatio)) * 100).toFixed(2)}%`
                : '-'
            }
            tooltip={DEBT_RATIO_TOOLTIP}
          />
          <CaptionedStat
            caption={'Liquidation Threshold'}
            crossAxisAlignment="center"
            stat={
              positionInfo
                ? `${(Number(utils.formatUnits(positionInfo.liquidationThreshold)) * 100).toFixed(
                    2
                  )}%`
                : '-'
            }
            tooltip={LIQUIDATION_THRESHOLD_TOOLTIP}
          />
        </Grid>
      </Box>
    </VStack>
  );
};
