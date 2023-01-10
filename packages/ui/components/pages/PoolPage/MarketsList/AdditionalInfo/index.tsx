import { ExternalLinkIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  HStack,
  Link,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { STRATEGY_HELP } from '@midas-capital/security';
import { FundOperationMode, Strategy } from '@midas-capital/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { Row } from '@tanstack/react-table';
import { utils } from 'ethers';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { BsTriangleFill } from 'react-icons/bs';
import { useSwitchNetwork } from 'wagmi';

import { Market } from '@ui/components/pages/PoolPage/MarketsList';
import { Collateral } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/Collateral/index';
import { FundButton } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/index';
import CaptionedStat from '@ui/components/shared/CaptionedStat';
import ClaimAssetRewardsButton from '@ui/components/shared/ClaimAssetRewardsButton';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import {
  ADMIN_FEE_TOOLTIP,
  LOAN_TO_VALUE_TOOLTIP,
  MIDAS_SECURITY_DOCS_URL,
  PERFORMANCE_FEE_TOOLTIP,
  RESERVE_FACTOR_TOOLTIP,
  SCORE_LIMIT,
  SCORE_RANGE_MAX,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useStrategyRating } from '@ui/hooks/fuse/useStrategyRating';
import { useChartData } from '@ui/hooks/useChartData';
import { useColors } from '@ui/hooks/useColors';
import { usePerformanceFee } from '@ui/hooks/usePerformanceFee';
import { useWindowSize } from '@ui/hooks/useScreenSize';
import { MarketData } from '@ui/types/TokensDataMap';
import { midUsdFormatter } from '@ui/utils/bigUtils';
import { deployedPlugins, getChainConfig, getScanUrlByChainId } from '@ui/utils/networkData';

const UtilizationChart = dynamic(() => import('@ui/components/shared/UtilizationChart'), {
  ssr: false,
});

export const AdditionalInfo = ({
  row,
  rows,
  comptrollerAddress,
  supplyBalanceFiat,
  borrowBalanceFiat,
  poolChainId,
}: {
  row: Row<Market>;
  rows: Row<Market>[];
  comptrollerAddress: string;
  supplyBalanceFiat: number;
  borrowBalanceFiat: number;
  poolChainId: number;
}) => {
  const scanUrl = useMemo(() => getScanUrlByChainId(poolChainId), [poolChainId]);
  const asset: MarketData = row.original.market;
  const assets: MarketData[] = rows.map((row) => row.original.market);

  const { data } = useChartData(asset.cToken, poolChainId);
  const { currentChain } = useMultiMidas();
  const windowWidth = useWindowSize();
  const chainConfig = useMemo(() => getChainConfig(poolChainId), [poolChainId]);
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();

  const { cCard } = useColors();
  const { switchNetworkAsync } = useSwitchNetwork();
  const strategyScore = useStrategyRating(poolChainId, asset.plugin);
  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else if (openChainModal) {
      openChainModal();
    }
  };
  const vaultUrl = useMemo(() => {
    if (strategyScore?.strategy.address) {
      return deployedPlugins[poolChainId][strategyScore.strategy.address].apyDocsUrl;
    }
  }, [strategyScore, poolChainId]);
  const greenColor = useColorModeValue('#38A169', 'green');
  const yellowColor = useColorModeValue('#D69E2E', 'yellow');
  const redColor = useColorModeValue('#E53E3E', 'red');
  const setColorByScore = (score: number) => {
    return score >= 0.8 ? greenColor : score >= 0.6 ? yellowColor : redColor;
  };

  const { data: performanceFee } = usePerformanceFee(poolChainId, asset.plugin);

  return (
    <Box width={{ base: windowWidth.width * 0.9, md: 'auto' }} minWidth="400px">
      <Flex
        gap={4}
        justifyContent="flex-end"
        alignItems="center"
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        {!currentChain ? (
          <Box>
            <Button variant="_solid" onClick={openConnectModal}>
              Connect Wallet
            </Button>
          </Box>
        ) : currentChain.unsupported || currentChain.id !== poolChainId ? (
          <Box>
            <Button variant="_solid" onClick={handleSwitch}>
              Switch {chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
            </Button>
          </Box>
        ) : (
          <HStack>
            <ClaimAssetRewardsButton poolAddress={comptrollerAddress} assetAddress={asset.cToken} />
            <FundButton
              mode={FundOperationMode.SUPPLY}
              comptrollerAddress={comptrollerAddress}
              assets={assets}
              asset={asset}
              isDisabled={asset.isSupplyPaused}
              poolChainId={poolChainId}
            />
            <FundButton
              mode={FundOperationMode.WITHDRAW}
              comptrollerAddress={comptrollerAddress}
              assets={assets}
              asset={asset}
              isDisabled={asset.supplyBalanceFiat === 0}
              poolChainId={poolChainId}
            />
            <FundButton
              mode={FundOperationMode.BORROW}
              comptrollerAddress={comptrollerAddress}
              assets={assets}
              asset={asset}
              isDisabled={asset.isBorrowPaused || supplyBalanceFiat === 0}
              poolChainId={poolChainId}
              borrowBalanceFiat={borrowBalanceFiat}
            />
            <FundButton
              mode={FundOperationMode.REPAY}
              comptrollerAddress={comptrollerAddress}
              assets={assets}
              asset={asset}
              isDisabled={asset.borrowBalanceFiat === 0}
              poolChainId={poolChainId}
            />
            <Collateral
              comptrollerAddress={comptrollerAddress}
              assets={assets}
              asset={asset}
              poolChainId={poolChainId}
            />
          </HStack>
        )}
      </Flex>
      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          lg: 'repeat(2, 1fr)',
        }}
        w="100%"
        gap={4}
        alignItems="stretch"
        mt={4}
      >
        {strategyScore !== undefined && (
          <GridItem rowSpan={2}>
            <VStack width="100%" spacing={0} borderRadius="20">
              <Box
                width="100%"
                px={4}
                background={cCard.headingBgColor}
                borderWidth={2}
                borderColor={cCard.headingBgColor}
                height={14}
              >
                <Flex justifyContent="space-between" alignItems="center" height="100%">
                  <Flex gap={2} alignSelf="center">
                    <Text>Strategy Safety Score:</Text>
                    <Text
                      fontWeight="bold"
                      size="md"
                      color={setColorByScore(strategyScore.totalScore)}
                    >
                      {(strategyScore.totalScore * SCORE_RANGE_MAX).toFixed(2)}
                    </Text>
                    <Center height="100%">
                      <SimpleTooltip label="Link to Docs">
                        <Link href={MIDAS_SECURITY_DOCS_URL} isExternal>
                          <InfoOutlineIcon />
                        </Link>
                      </SimpleTooltip>
                    </Center>
                  </Flex>

                  <HStack>
                    {asset.plugin && (
                      <Link href={`${scanUrl}/address/${asset.plugin}`} isExternal rel="noreferrer">
                        <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
                          Strategy Address
                        </Button>
                      </Link>
                    )}
                    {vaultUrl && (
                      <Link href={vaultUrl} isExternal rel="noreferrer">
                        <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
                          Vault
                        </Button>
                      </Link>
                    )}
                  </HStack>
                </Flex>
              </Box>
              <Box width="100%" height="100%" borderWidth={2} borderColor={cCard.headingBgColor}>
                <VStack alignItems="flex-start" p={4} gap={2}>
                  <Flex gap={2}>
                    {strategyScore.complexityScore >= SCORE_LIMIT ? (
                      <Center>
                        <BsTriangleFill
                          size={14}
                          color={setColorByScore(strategyScore.complexityScore)}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          size={12}
                          color={setColorByScore(strategyScore.complexityScore)}
                          style={{ transform: 'rotate(180deg)' }}
                        />
                      </Center>
                    )}
                    <Text>
                      {
                        STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].complexity[
                          strategyScore.strategy.complexity
                        ].title
                      }
                    </Text>
                    <PopoverTooltip
                      body={
                        <VStack alignItems="flex-start">
                          <Text fontWeight="bold">
                            Score: {strategyScore.complexityScore * SCORE_RANGE_MAX}
                          </Text>
                          <Text>
                            {
                              STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].complexity[
                                strategyScore.strategy.complexity
                              ].explanation
                            }
                          </Text>
                        </VStack>
                      }
                    >
                      <Center height="100%">
                        <InfoOutlineIcon />
                      </Center>
                    </PopoverTooltip>
                  </Flex>
                  <Flex gap={2}>
                    {strategyScore.timeInMarketScore >= SCORE_LIMIT ? (
                      <Center>
                        <BsTriangleFill
                          size={14}
                          color={setColorByScore(strategyScore.timeInMarketScore)}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          size={12}
                          color={setColorByScore(strategyScore.timeInMarketScore)}
                          style={{ transform: 'rotate(180deg)' }}
                        />
                      </Center>
                    )}
                    <Text>
                      {
                        STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].timeInMarket[
                          strategyScore.strategy.timeInMarket
                        ].title
                      }
                    </Text>
                    <PopoverTooltip
                      body={
                        <VStack alignItems="flex-start">
                          <Text fontWeight="bold">
                            Score: {strategyScore.timeInMarketScore * SCORE_RANGE_MAX}
                          </Text>
                          <Text>
                            {
                              STRATEGY_HELP[strategyScore.strategy.strategy as Strategy]
                                .timeInMarket[strategyScore.strategy.timeInMarket].explanation
                            }
                          </Text>
                        </VStack>
                      }
                    >
                      <Center height="100%">
                        <InfoOutlineIcon />
                      </Center>
                    </PopoverTooltip>
                  </Flex>
                  <Flex gap={2}>
                    {strategyScore.assetRiskILScore >= SCORE_LIMIT ? (
                      <Center>
                        <BsTriangleFill
                          size={14}
                          color={setColorByScore(strategyScore.assetRiskILScore)}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          size={12}
                          color={setColorByScore(strategyScore.assetRiskILScore)}
                          style={{ transform: 'rotate(180deg)' }}
                        />
                      </Center>
                    )}
                    <Text>
                      {
                        STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].riskIL[
                          strategyScore.strategy.riskIL
                        ].title
                      }
                    </Text>

                    <PopoverTooltip
                      body={
                        <VStack alignItems="flex-start">
                          <Text fontWeight="bold">
                            Score: {strategyScore.assetRiskILScore * SCORE_RANGE_MAX}
                          </Text>
                          <Text>
                            {
                              STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].riskIL[
                                strategyScore.strategy.riskIL
                              ].explanation
                            }
                          </Text>
                        </VStack>
                      }
                    >
                      <Center height="100%">
                        <InfoOutlineIcon />
                      </Center>
                    </PopoverTooltip>
                  </Flex>
                  <Flex gap={2}>
                    {strategyScore.assetRiskLiquidityScore >= SCORE_LIMIT ? (
                      <Center>
                        <BsTriangleFill
                          size={14}
                          color={setColorByScore(strategyScore.assetRiskLiquidityScore)}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          size={12}
                          color={setColorByScore(strategyScore.assetRiskLiquidityScore)}
                          style={{ transform: 'rotate(180deg)' }}
                        />
                      </Center>
                    )}
                    <Text>
                      {
                        STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].liquidity[
                          strategyScore.strategy.liquidity
                        ].title
                      }
                    </Text>
                    <PopoverTooltip
                      body={
                        <VStack alignItems="flex-start">
                          <Text fontWeight="bold">
                            Score: {strategyScore.assetRiskLiquidityScore * SCORE_RANGE_MAX}
                          </Text>
                          <Text>
                            {
                              STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].liquidity[
                                strategyScore.strategy.liquidity
                              ].explanation
                            }
                          </Text>
                        </VStack>
                      }
                    >
                      <Center height="100%">
                        <InfoOutlineIcon />
                      </Center>
                    </PopoverTooltip>
                  </Flex>
                  <Flex gap={2}>
                    {strategyScore.assetRiskMktCapScore >= SCORE_LIMIT ? (
                      <Center>
                        <BsTriangleFill
                          size={14}
                          color={setColorByScore(strategyScore.assetRiskMktCapScore)}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          size={12}
                          color={setColorByScore(strategyScore.assetRiskMktCapScore)}
                          style={{ transform: 'rotate(180deg)' }}
                        />
                      </Center>
                    )}
                    <Text>
                      {
                        STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].mktCap[
                          strategyScore.strategy.mktCap
                        ].title
                      }
                    </Text>
                    <PopoverTooltip
                      body={
                        <VStack alignItems="flex-start">
                          <Text fontWeight="bold">
                            Score: {strategyScore.assetRiskMktCapScore * SCORE_RANGE_MAX}
                          </Text>
                          <Text>
                            {
                              STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].mktCap[
                                strategyScore.strategy.mktCap
                              ].explanation
                            }
                          </Text>
                        </VStack>
                      }
                    >
                      <Center height="100%">
                        <InfoOutlineIcon />
                      </Center>
                    </PopoverTooltip>
                  </Flex>
                  <Flex gap={2}>
                    {strategyScore.assetRiskSupplyScore >= SCORE_LIMIT ? (
                      <Center>
                        <BsTriangleFill
                          size={14}
                          color={setColorByScore(strategyScore.assetRiskSupplyScore)}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          size={12}
                          color={setColorByScore(strategyScore.assetRiskSupplyScore)}
                          style={{ transform: 'rotate(180deg)' }}
                        />
                      </Center>
                    )}
                    <Text>
                      {
                        STRATEGY_HELP[strategyScore.strategy.strategy as Strategy]
                          .supplyCentralised[strategyScore.strategy.supplyCentralised].title
                      }
                    </Text>
                    <PopoverTooltip
                      body={
                        <VStack alignItems="flex-start">
                          <Text fontWeight="bold">
                            Score: {strategyScore.assetRiskSupplyScore * SCORE_RANGE_MAX}
                          </Text>
                          <Text>
                            {
                              STRATEGY_HELP[strategyScore.strategy.strategy as Strategy]
                                .supplyCentralised[strategyScore.strategy.supplyCentralised]
                                .explanation
                            }
                          </Text>
                        </VStack>
                      }
                    >
                      <Center height="100%">
                        <InfoOutlineIcon />
                      </Center>
                    </PopoverTooltip>
                  </Flex>
                  <Flex gap={2}>
                    {strategyScore.platformRiskReputationScore >= SCORE_LIMIT ? (
                      <Center>
                        <BsTriangleFill
                          size={14}
                          color={setColorByScore(strategyScore.platformRiskReputationScore)}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          size={12}
                          color={setColorByScore(strategyScore.platformRiskReputationScore)}
                          style={{ transform: 'rotate(180deg)' }}
                        />
                      </Center>
                    )}
                    <Text>
                      {
                        STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].reputation[
                          strategyScore.strategy.reputation
                        ].title
                      }
                    </Text>
                    <PopoverTooltip
                      body={
                        <VStack alignItems="flex-start">
                          <Text fontWeight="bold">
                            Score: {strategyScore.platformRiskReputationScore * SCORE_RANGE_MAX}
                          </Text>
                          <Text>
                            {
                              STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].reputation[
                                strategyScore.strategy.reputation
                              ].explanation
                            }
                          </Text>
                        </VStack>
                      }
                    >
                      <Center height="100%">
                        <InfoOutlineIcon />
                      </Center>
                    </PopoverTooltip>
                  </Flex>
                  <Flex gap={2}>
                    {strategyScore.platformRiskAuditScore >= SCORE_LIMIT ? (
                      <Center>
                        <BsTriangleFill
                          size={14}
                          color={setColorByScore(strategyScore.platformRiskAuditScore)}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          size={12}
                          color={setColorByScore(strategyScore.platformRiskAuditScore)}
                          style={{ transform: 'rotate(180deg)' }}
                        />
                      </Center>
                    )}
                    <Text>
                      {
                        STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].audit[
                          strategyScore.strategy.audit
                        ].title
                      }
                    </Text>
                    <PopoverTooltip
                      body={
                        <VStack alignItems="flex-start">
                          <Text fontWeight="bold">
                            Score: {strategyScore.platformRiskAuditScore * SCORE_RANGE_MAX}
                          </Text>
                          <Text>
                            {
                              STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].audit[
                                strategyScore.strategy.audit
                              ].explanation
                            }
                          </Text>
                        </VStack>
                      }
                    >
                      <Center height="100%">
                        <InfoOutlineIcon />
                      </Center>
                    </PopoverTooltip>
                  </Flex>
                  <Flex gap={2}>
                    {strategyScore.platformRiskContractsVerifiedScore >= SCORE_LIMIT ? (
                      <Center>
                        <BsTriangleFill
                          size={14}
                          color={setColorByScore(strategyScore.platformRiskContractsVerifiedScore)}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          size={12}
                          color={setColorByScore(strategyScore.platformRiskContractsVerifiedScore)}
                          style={{ transform: 'rotate(180deg)' }}
                        />
                      </Center>
                    )}
                    <Text>
                      {
                        STRATEGY_HELP[strategyScore.strategy.strategy as Strategy]
                          .contractsVerified[strategyScore.strategy.contractsVerified].title
                      }
                    </Text>
                    <PopoverTooltip
                      body={
                        <VStack alignItems="flex-start">
                          <Text fontWeight="bold">
                            Score:{' '}
                            {strategyScore.platformRiskContractsVerifiedScore * SCORE_RANGE_MAX}
                          </Text>
                          <Text>
                            {
                              STRATEGY_HELP[strategyScore.strategy.strategy as Strategy]
                                .contractsVerified[strategyScore.strategy.contractsVerified]
                                .explanation
                            }
                          </Text>
                        </VStack>
                      }
                    >
                      <Center height="100%">
                        <InfoOutlineIcon />
                      </Center>
                    </PopoverTooltip>
                  </Flex>
                  <Flex gap={2}>
                    {strategyScore.platformRiskAdminWithTimelockScore >= SCORE_LIMIT ? (
                      <Center>
                        <BsTriangleFill
                          size={14}
                          color={setColorByScore(strategyScore.platformRiskAdminWithTimelockScore)}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          size={12}
                          color={setColorByScore(strategyScore.platformRiskAdminWithTimelockScore)}
                          style={{ transform: 'rotate(180deg)' }}
                        />
                      </Center>
                    )}
                    <Text>
                      {
                        STRATEGY_HELP[strategyScore.strategy.strategy as Strategy]
                          .adminWithTimelock[strategyScore.strategy.adminWithTimelock].title
                      }
                    </Text>
                    <PopoverTooltip
                      body={
                        <VStack alignItems="flex-start">
                          <Text fontWeight="bold">
                            Score:{' '}
                            {strategyScore.platformRiskAdminWithTimelockScore * SCORE_RANGE_MAX}
                          </Text>
                          <Text>
                            {
                              STRATEGY_HELP[strategyScore.strategy.strategy as Strategy]
                                .adminWithTimelock[strategyScore.strategy.adminWithTimelock]
                                .explanation
                            }
                          </Text>
                        </VStack>
                      }
                    >
                      <Center height="100%">
                        <InfoOutlineIcon />
                      </Center>
                    </PopoverTooltip>
                  </Flex>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        )}
        <GridItem>
          <VStack width="100%" spacing={0} borderRadius="20">
            <Box
              width="100%"
              px={4}
              background={cCard.headingBgColor}
              borderWidth={2}
              borderColor={cCard.headingBgColor}
              height={14}
            >
              <Flex justifyContent="space-between" alignItems="center" height="100%">
                <Text>Market Details</Text>
                <HStack>
                  <Link
                    href={`${scanUrl}/address/${asset.underlyingToken}`}
                    isExternal
                    rel="noreferrer"
                  >
                    <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
                      Token Contract
                    </Button>
                  </Link>
                  <Link href={`${scanUrl}/address/${asset.cToken}`} isExternal rel="noreferrer">
                    <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
                      Market Contract
                    </Button>
                  </Link>
                </HStack>
              </Flex>
            </Box>
            <Box width="100%" height="250px" borderWidth={2} borderColor={cCard.headingBgColor}>
              <Grid
                templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
                gap={0}
                width="100%"
                height="100%"
              >
                <CaptionedStat
                  stat={midUsdFormatter(asset.totalSupplyFiat)}
                  caption={'Asset Supplied'}
                  crossAxisAlignment="center"
                />
                <CaptionedStat
                  stat={asset.isBorrowPaused ? '-' : midUsdFormatter(asset.totalBorrowFiat)}
                  caption={'Asset Borrowed'}
                  crossAxisAlignment="center"
                />
                <CaptionedStat
                  stat={asset.isBorrowPaused ? '-' : asset.utilization.toFixed(0) + '%'}
                  caption={'Asset Utilization'}
                  crossAxisAlignment="center"
                />
                <CaptionedStat
                  stat={Number(utils.formatUnits(asset.collateralFactor, 16)).toFixed(0) + '%'}
                  caption={'Loan-to-Value'}
                  crossAxisAlignment="center"
                  tooltip={LOAN_TO_VALUE_TOOLTIP}
                />

                <CaptionedStat
                  stat={Number(utils.formatUnits(asset.reserveFactor, 16)).toFixed(0) + '%'}
                  caption={'Reserve Factor'}
                  crossAxisAlignment="center"
                  tooltip={RESERVE_FACTOR_TOOLTIP}
                />
                <CaptionedStat
                  stat={Number(utils.formatUnits(asset.adminFee, 16)).toFixed(1) + '%'}
                  caption={'Admin Fee'}
                  crossAxisAlignment="center"
                  tooltip={ADMIN_FEE_TOOLTIP}
                />
                {performanceFee !== undefined ? (
                  <CaptionedStat
                    stat={`${performanceFee}%`}
                    caption={'Performance Fee'}
                    crossAxisAlignment="center"
                    tooltip={PERFORMANCE_FEE_TOOLTIP}
                  />
                ) : null}
              </Grid>
            </Box>
          </VStack>
        </GridItem>
        <GridItem>
          <VStack width="100%" spacing={0} borderRadius="20">
            <Box
              width="100%"
              px={4}
              background={cCard.headingBgColor}
              borderWidth={2}
              borderColor={cCard.headingBgColor}
              height={14}
            >
              <Flex alignItems="center" height="100%">
                <Text py={0.5}>Utilization Rate</Text>
              </Flex>
            </Box>
            <Box
              width="100%"
              height="250px"
              borderWidth={2}
              borderColor={cCard.headingBgColor}
              pb={4}
            >
              {asset.isBorrowPaused ? (
                <Center height="100%">
                  <Text size="md">This asset is not borrowable.</Text>
                </Center>
              ) : data ? (
                data.rates === null ? (
                  <Center height="100%">
                    <Text size="md">
                      No graph is available for this asset(&apos)s interest curves.
                    </Text>
                  </Center>
                ) : (
                  <UtilizationChart
                    irmToCurve={data}
                    currentUtilization={asset.utilization.toFixed(0)}
                  />
                )
              ) : (
                <Center height="100%">
                  <Spinner />
                </Center>
              )}
            </Box>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};
