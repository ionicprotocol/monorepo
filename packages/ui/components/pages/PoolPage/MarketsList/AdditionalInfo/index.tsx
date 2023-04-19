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
import type { Strategy } from '@midas-capital/types';
import { FundOperationMode } from '@midas-capital/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import type { Row } from '@tanstack/react-table';
import { utils } from 'ethers';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { BsTriangleFill } from 'react-icons/bs';
import { useSwitchNetwork } from 'wagmi';

import type { Market } from '@ui/components/pages/PoolPage/MarketsList';
import { Collateral } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/Collateral/index';
import { FundButton } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/index';
import CaptionedStat from '@ui/components/shared/CaptionedStat';
import ClaimAssetRewardsButton from '@ui/components/shared/ClaimAssetRewardsButton';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import {
  ADMIN_FEE_TOOLTIP,
  ASSET_BORROWED_TOOLTIP,
  ASSET_SUPPLIED_TOOLTIP,
  LOAN_TO_VALUE_TOOLTIP,
  MIDAS_SECURITY_DOCS_URL,
  PERFORMANCE_FEE_TOOLTIP,
  RESERVE_FACTOR_TOOLTIP,
  SCORE_LIMIT,
  SCORE_RANGE_MAX,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useIRM } from '@ui/hooks/fuse/useIRM';
import { useOracle } from '@ui/hooks/fuse/useOracle';
import { useStrategyRating } from '@ui/hooks/fuse/useStrategyRating';
import { useBorrowCap } from '@ui/hooks/useBorrowCap';
import { useChartData } from '@ui/hooks/useChartData';
import { useColors } from '@ui/hooks/useColors';
import { usePerformanceFee } from '@ui/hooks/usePerformanceFee';
import { useWindowSize } from '@ui/hooks/useScreenSize';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
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
  borrowBalanceFiat: number;
  comptrollerAddress: string;
  poolChainId: number;
  row: Row<Market>;
  rows: Row<Market>[];
  supplyBalanceFiat: number;
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
  const { data: irm } = useIRM(asset.cToken, poolChainId);

  return (
    <Box minWidth="400px" width={{ base: windowWidth.width * 0.9, md: 'auto' }}>
      <Flex
        alignItems="center"
        flexDirection={{ base: 'column', lg: 'row' }}
        gap={4}
        justifyContent="flex-end"
      >
        {!currentChain ? (
          <Box>
            <Button onClick={openConnectModal} variant="_solid">
              Connect Wallet
            </Button>
          </Box>
        ) : currentChain.unsupported || currentChain.id !== poolChainId ? (
          <Box>
            <Button onClick={handleSwitch} variant="_solid">
              Switch {chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
            </Button>
          </Box>
        ) : (
          <HStack>
            <ClaimAssetRewardsButton
              assetAddress={asset.cToken}
              poolAddress={comptrollerAddress}
              poolChainId={poolChainId}
            />
            <FundButton
              asset={asset}
              assets={assets}
              comptrollerAddress={comptrollerAddress}
              isDisabled={asset.isSupplyPaused}
              mode={FundOperationMode.SUPPLY}
              poolChainId={poolChainId}
            />
            <FundButton
              asset={asset}
              assets={assets}
              comptrollerAddress={comptrollerAddress}
              isDisabled={asset.supplyBalanceFiat === 0}
              mode={FundOperationMode.WITHDRAW}
              poolChainId={poolChainId}
            />
            <FundButton
              asset={asset}
              assets={assets}
              borrowBalanceFiat={borrowBalanceFiat}
              comptrollerAddress={comptrollerAddress}
              isDisabled={asset.isBorrowPaused || supplyBalanceFiat === 0}
              mode={FundOperationMode.BORROW}
              poolChainId={poolChainId}
            />
            <FundButton
              asset={asset}
              assets={assets}
              comptrollerAddress={comptrollerAddress}
              isDisabled={asset.borrowBalanceFiat === 0}
              mode={FundOperationMode.REPAY}
              poolChainId={poolChainId}
            />
            <Collateral
              asset={asset}
              assets={assets}
              comptrollerAddress={comptrollerAddress}
              poolChainId={poolChainId}
            />
          </HStack>
        )}
      </Flex>
      <Grid
        alignItems="stretch"
        gap={4}
        mt={4}
        templateColumns={{
          base: 'repeat(1, 1fr)',
          lg: 'repeat(2, 1fr)',
        }}
        w="100%"
      >
        {strategyScore !== undefined && (
          <GridItem rowSpan={2}>
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
                  <Flex alignSelf="center" gap={2}>
                    <Text>Strategy Safety Score:</Text>
                    <Text
                      color={setColorByScore(strategyScore.totalScore)}
                      fontWeight="bold"
                      size="md"
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
                        <Button rightIcon={<ExternalLinkIcon />} size="xs" variant={'external'}>
                          Strategy Address
                        </Button>
                      </Link>
                    )}
                    {vaultUrl && (
                      <Link href={vaultUrl} isExternal rel="noreferrer">
                        <Button rightIcon={<ExternalLinkIcon />} size="xs" variant={'external'}>
                          Vault
                        </Button>
                      </Link>
                    )}
                  </HStack>
                </Flex>
              </Box>
              <Box
                borderBottomRadius={12}
                borderColor={cCard.borderColor}
                borderTop="none"
                borderWidth={2}
                height="100%"
                width="100%"
              >
                <VStack alignItems="flex-start" gap={2} p={4}>
                  <Flex gap={2}>
                    {strategyScore.complexityScore >= SCORE_LIMIT ? (
                      <Center>
                        <BsTriangleFill
                          color={setColorByScore(strategyScore.complexityScore)}
                          size={14}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          color={setColorByScore(strategyScore.complexityScore)}
                          size={12}
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
                          color={setColorByScore(strategyScore.timeInMarketScore)}
                          size={14}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          color={setColorByScore(strategyScore.timeInMarketScore)}
                          size={12}
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
                          color={setColorByScore(strategyScore.assetRiskILScore)}
                          size={14}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          color={setColorByScore(strategyScore.assetRiskILScore)}
                          size={12}
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
                          color={setColorByScore(strategyScore.assetRiskLiquidityScore)}
                          size={14}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          color={setColorByScore(strategyScore.assetRiskLiquidityScore)}
                          size={12}
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
                          color={setColorByScore(strategyScore.assetRiskMktCapScore)}
                          size={14}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          color={setColorByScore(strategyScore.assetRiskMktCapScore)}
                          size={12}
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
                          color={setColorByScore(strategyScore.assetRiskSupplyScore)}
                          size={14}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          color={setColorByScore(strategyScore.assetRiskSupplyScore)}
                          size={12}
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
                          color={setColorByScore(strategyScore.platformRiskReputationScore)}
                          size={14}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          color={setColorByScore(strategyScore.platformRiskReputationScore)}
                          size={12}
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
                          color={setColorByScore(strategyScore.platformRiskAuditScore)}
                          size={14}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          color={setColorByScore(strategyScore.platformRiskAuditScore)}
                          size={12}
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
                          color={setColorByScore(strategyScore.platformRiskContractsVerifiedScore)}
                          size={14}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          color={setColorByScore(strategyScore.platformRiskContractsVerifiedScore)}
                          size={12}
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
                          color={setColorByScore(strategyScore.platformRiskAdminWithTimelockScore)}
                          size={14}
                        />
                      </Center>
                    ) : (
                      <Center>
                        <BsTriangleFill
                          color={setColorByScore(strategyScore.platformRiskAdminWithTimelockScore)}
                          size={12}
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
                  <Link
                    href={`${scanUrl}/address/${asset.underlyingToken}`}
                    isExternal
                    rel="noreferrer"
                  >
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
        </GridItem>
        <GridItem>
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
                    <Text size="md">
                      No graph is available for this asset(&apos)s interest curves.
                    </Text>
                  </Center>
                ) : (
                  <UtilizationChart
                    currentUtilization={asset.utilization.toFixed(0)}
                    irmToCurve={data}
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
