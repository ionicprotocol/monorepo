import { ExternalLinkIcon, QuestionIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  HStack,
  Link,
  Spinner,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { STRATEGY_HELP } from '@midas-capital/security';
import { FundOperationMode } from '@midas-capital/types';
import { Row } from '@tanstack/react-table';
import { utils } from 'ethers';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useSwitchNetwork } from 'wagmi';

import { Market } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList';
import { FundButton } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList/FundButton';
import CaptionedStat from '@ui/components/shared/CaptionedStat';
import ClaimAssetRewardsButton from '@ui/components/shared/ClaimAssetRewardsButton';
import ConnectWalletModal from '@ui/components/shared/ConnectWalletModal';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import SwitchNetworkModal from '@ui/components/shared/SwitchNetworkModal';
import {
  ADMIN_FEE_TOOLTIP,
  LOAN_TO_VALUE_TOOLTIP,
  MIDAS_SECURITY_DOCS_URL,
  RESERVE_FACTOR_TOOLTIP,
  SCORE_LIMIT,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useStrategyRating } from '@ui/hooks/fuse/useStrategyRating';
import { useChartData } from '@ui/hooks/useChartData';
import { useColors } from '@ui/hooks/useColors';
import { MarketData } from '@ui/types/TokensDataMap';
import { midUsdFormatter } from '@ui/utils/bigUtils';
import { getChainConfig, getScanUrlByChainId } from '@ui/utils/networkData';

const UtilizationChart = dynamic(() => import('@ui/components/shared/UtilizationChart'), {
  ssr: false,
});

export const AdditionalInfo = ({
  row,
  rows,
  comptrollerAddress,
  supplyBalanceFiat,
  poolChainId,
}: {
  row: Row<Market>;
  rows: Row<Market>[];
  comptrollerAddress: string;
  supplyBalanceFiat: number;
  poolChainId: number;
}) => {
  const scanUrl = useMemo(() => getScanUrlByChainId(poolChainId), [poolChainId]);
  const asset: MarketData = row.original.market;
  const assets: MarketData[] = rows.map((row) => row.original.market);

  const { data } = useChartData(asset.cToken, poolChainId);
  const { currentChain } = useMultiMidas();
  const { cCard } = useColors();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const chainConfig = useMemo(() => getChainConfig(poolChainId), [poolChainId]);
  const { switchNetworkAsync } = useSwitchNetwork();
  const strategyScore = useStrategyRating(poolChainId, asset.plugin);
  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else {
      onOpen();
    }
  };
  const setColorByScore = (score: number) => {
    return score > 0.8 ? 'green' : score > 0.6 ? 'yellow' : 'red';
  };

  return (
    <Box>
      <Flex
        gap={4}
        justifyContent={'space-between'}
        alignItems="center"
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        <HStack>
          <Link href={`${scanUrl}/address/${asset.underlyingToken}`} isExternal rel="noreferrer">
            <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
              Token Contract
            </Button>
          </Link>
          <Link href={`${scanUrl}/address/${asset.cToken}`} isExternal rel="noreferrer">
            <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
              Market Contract
            </Button>
          </Link>
          {asset.plugin && (
            <Link href={`${scanUrl}/address/${asset.plugin}`} isExternal rel="noreferrer">
              <Button variant={'external'} size="xs" rightIcon={<ExternalLinkIcon />}>
                Plugin Contract
              </Button>
            </Link>
          )}
        </HStack>
        {!currentChain ? (
          <Box>
            <Button variant="_solid" onClick={onOpen}>
              Connect Wallet
            </Button>
            <ConnectWalletModal isOpen={isOpen} onClose={onClose} />
          </Box>
        ) : currentChain.unsupported || currentChain.id !== poolChainId ? (
          <Box>
            <Button variant="_solid" onClick={handleSwitch}>
              Switch {chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
            </Button>
            <SwitchNetworkModal isOpen={isOpen} onClose={onClose} />
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
              supplyBalanceFiat={supplyBalanceFiat}
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
            />
            <FundButton
              mode={FundOperationMode.REPAY}
              comptrollerAddress={comptrollerAddress}
              assets={assets}
              asset={asset}
              isDisabled={asset.borrowBalanceFiat === 0}
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
        alignItems="flex-end"
        mt={4}
      >
        <VStack width="100%" spacing={0} borderRadius="20">
          <Box
            width="100%"
            p={4}
            background={cCard.headingBgColor}
            borderWidth={2}
            borderColor={cCard.headingBgColor}
          >
            <Text>Utilization Rate</Text>
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
                <Text variant="smText">This asset is not borrowable.</Text>
              </Center>
            ) : data ? (
              data.rates === null ? (
                <Center height="100%">
                  <Text variant="smText">
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
        <VStack width="100%" spacing={0} borderRadius="20">
          <Box
            width="100%"
            p={4}
            background={cCard.headingBgColor}
            borderWidth={2}
            borderColor={cCard.headingBgColor}
          >
            <Text>Asset Info</Text>
          </Box>
          <Box width="100%" height="250px" borderWidth={2} borderColor={cCard.headingBgColor}>
            <Grid
              templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
              gap={2}
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
            </Grid>
          </Box>
        </VStack>
        {strategyScore !== undefined && (
          <VStack width="100%" spacing={0} borderRadius="20">
            <Box
              width="100%"
              p={4}
              background={cCard.headingBgColor}
              borderWidth={2}
              borderColor={cCard.headingBgColor}
            >
              <Flex justifyContent="space-between">
                <Text>Safety Score</Text>
                <Link href={MIDAS_SECURITY_DOCS_URL} isExternal>
                  How it works
                </Link>
              </Flex>
            </Box>
            <Box width="100%" borderWidth={2} borderColor={cCard.headingBgColor}>
              <VStack alignItems="flex-start" p={4} gap={2}>
                <Flex gap={4}>
                  <Text>Strategy Total Score</Text>
                  <Text
                    fontWeight="bold"
                    variant="mdText"
                    color={setColorByScore(strategyScore.totalScore)}
                  >
                    {strategyScore.totalScore}
                  </Text>
                </Flex>
                <Flex gap={4}>
                  {strategyScore.complexityScore > SCORE_LIMIT ? (
                    <TriangleUpIcon color={setColorByScore(strategyScore.complexityScore)} />
                  ) : (
                    <TriangleDownIcon color={setColorByScore(strategyScore.complexityScore)} />
                  )}
                  <Text>{STRATEGY_HELP.complexity[strategyScore.strategy.complexity].title}</Text>
                  <PopoverTooltip
                    body={
                      <VStack alignItems="flex-start">
                        <Text fontWeight="bold">Score: {strategyScore.complexityScore}</Text>
                        <Text>
                          {STRATEGY_HELP.complexity[strategyScore.strategy.complexity].explanation}
                        </Text>
                      </VStack>
                    }
                  >
                    <Text fontWeight="bold">
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                      />
                    </Text>
                  </PopoverTooltip>
                </Flex>
                <Flex gap={4}>
                  {strategyScore.timeInMarketScore > SCORE_LIMIT ? (
                    <TriangleUpIcon color={setColorByScore(strategyScore.timeInMarketScore)} />
                  ) : (
                    <TriangleDownIcon color={setColorByScore(strategyScore.timeInMarketScore)} />
                  )}
                  <Text>
                    {STRATEGY_HELP.timeInMarket[strategyScore.strategy.timeInMarket].title}
                  </Text>
                  <PopoverTooltip
                    body={
                      <VStack alignItems="flex-start">
                        <Text fontWeight="bold">Score: {strategyScore.timeInMarketScore}</Text>
                        <Text>
                          {
                            STRATEGY_HELP.timeInMarket[strategyScore.strategy.timeInMarket]
                              .explanation
                          }
                        </Text>
                      </VStack>
                    }
                  >
                    <Text fontWeight="bold">
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                      />
                    </Text>
                  </PopoverTooltip>
                </Flex>
                <Flex gap={4}>
                  {strategyScore.assetRiskILScore > SCORE_LIMIT ? (
                    <TriangleUpIcon color={setColorByScore(strategyScore.assetRiskILScore)} />
                  ) : (
                    <TriangleDownIcon color={setColorByScore(strategyScore.assetRiskILScore)} />
                  )}
                  <Text>{STRATEGY_HELP.riskIL[strategyScore.strategy.riskIL].title}</Text>

                  <PopoverTooltip
                    body={
                      <VStack alignItems="flex-start">
                        <Text fontWeight="bold">Score: {strategyScore.assetRiskILScore}</Text>
                        <Text>
                          {STRATEGY_HELP.riskIL[strategyScore.strategy.riskIL].explanation}
                        </Text>
                      </VStack>
                    }
                  >
                    <Text fontWeight="bold">
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                      />
                    </Text>
                  </PopoverTooltip>
                </Flex>
                <Flex gap={4}>
                  {strategyScore.assetRiskLiquidityScore > SCORE_LIMIT ? (
                    <TriangleUpIcon
                      color={setColorByScore(strategyScore.assetRiskLiquidityScore)}
                    />
                  ) : (
                    <TriangleDownIcon
                      color={setColorByScore(strategyScore.assetRiskLiquidityScore)}
                    />
                  )}
                  <Text>{STRATEGY_HELP.liquidity[strategyScore.strategy.liquidity].title}</Text>
                  <PopoverTooltip
                    body={
                      <VStack alignItems="flex-start">
                        <Text fontWeight="bold">
                          Score: {strategyScore.assetRiskLiquidityScore}
                        </Text>
                        <Text>
                          {STRATEGY_HELP.liquidity[strategyScore.strategy.liquidity].explanation}
                        </Text>
                      </VStack>
                    }
                  >
                    <Text fontWeight="bold">
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                      />
                    </Text>
                  </PopoverTooltip>
                </Flex>
                <Flex gap={4}>
                  {strategyScore.assetRiskMktCapScore > SCORE_LIMIT ? (
                    <TriangleUpIcon color={setColorByScore(strategyScore.assetRiskMktCapScore)} />
                  ) : (
                    <TriangleDownIcon color={setColorByScore(strategyScore.assetRiskMktCapScore)} />
                  )}
                  <Text>{STRATEGY_HELP.mktCap[strategyScore.strategy.mktCap].title}</Text>
                  <PopoverTooltip
                    body={
                      <VStack alignItems="flex-start">
                        <Text fontWeight="bold">Score: {strategyScore.assetRiskMktCapScore}</Text>
                        <Text>
                          {STRATEGY_HELP.mktCap[strategyScore.strategy.mktCap].explanation}
                        </Text>
                      </VStack>
                    }
                  >
                    <Text fontWeight="bold">
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                      />
                    </Text>
                  </PopoverTooltip>
                </Flex>
                <Flex gap={4}>
                  {strategyScore.assetRiskSupplyScore > SCORE_LIMIT ? (
                    <TriangleUpIcon color={setColorByScore(strategyScore.assetRiskSupplyScore)} />
                  ) : (
                    <TriangleDownIcon color={setColorByScore(strategyScore.assetRiskSupplyScore)} />
                  )}
                  <Text>
                    {
                      STRATEGY_HELP.supplyCentralised[strategyScore.strategy.supplyCentralised]
                        .title
                    }
                  </Text>
                  <PopoverTooltip
                    body={
                      <VStack alignItems="flex-start">
                        <Text fontWeight="bold">Score: {strategyScore.assetRiskSupplyScore}</Text>
                        <Text>
                          {
                            STRATEGY_HELP.supplyCentralised[
                              strategyScore.strategy.supplyCentralised
                            ].explanation
                          }
                        </Text>
                      </VStack>
                    }
                  >
                    <Text fontWeight="bold">
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                      />
                    </Text>
                  </PopoverTooltip>
                </Flex>
                <Flex gap={4}>
                  {strategyScore.platformRiskReputationScore > SCORE_LIMIT ? (
                    <TriangleUpIcon
                      color={setColorByScore(strategyScore.platformRiskReputationScore)}
                    />
                  ) : (
                    <TriangleDownIcon
                      color={setColorByScore(strategyScore.platformRiskReputationScore)}
                    />
                  )}
                  <Text>{STRATEGY_HELP.reputation[strategyScore.strategy.reputation].title}</Text>
                  <PopoverTooltip
                    body={
                      <VStack alignItems="flex-start">
                        <Text fontWeight="bold">
                          Score: {strategyScore.platformRiskReputationScore}
                        </Text>
                        <Text>
                          {STRATEGY_HELP.reputation[strategyScore.strategy.reputation].explanation}
                        </Text>
                      </VStack>
                    }
                  >
                    <Text fontWeight="bold">
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                      />
                    </Text>
                  </PopoverTooltip>
                </Flex>
                <Flex gap={4}>
                  {strategyScore.platformRiskAuditScore > SCORE_LIMIT ? (
                    <TriangleUpIcon color={setColorByScore(strategyScore.platformRiskAuditScore)} />
                  ) : (
                    <TriangleDownIcon
                      color={setColorByScore(strategyScore.platformRiskAuditScore)}
                    />
                  )}
                  <Text>{STRATEGY_HELP.audit[strategyScore.strategy.audit].title}</Text>
                  <PopoverTooltip
                    body={
                      <VStack alignItems="flex-start">
                        <Text fontWeight="bold">Score: {strategyScore.platformRiskAuditScore}</Text>
                        <Text>{STRATEGY_HELP.audit[strategyScore.strategy.audit].explanation}</Text>
                      </VStack>
                    }
                  >
                    <Text fontWeight="bold">
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                      />
                    </Text>
                  </PopoverTooltip>
                </Flex>
                <Flex gap={4}>
                  {strategyScore.platformRiskContractsVerifiedScore > SCORE_LIMIT ? (
                    <TriangleUpIcon
                      color={setColorByScore(strategyScore.platformRiskContractsVerifiedScore)}
                    />
                  ) : (
                    <TriangleDownIcon
                      color={setColorByScore(strategyScore.platformRiskContractsVerifiedScore)}
                    />
                  )}
                  <Text>
                    {
                      STRATEGY_HELP.contractsVerified[strategyScore.strategy.contractsVerified]
                        .title
                    }
                  </Text>
                  <PopoverTooltip
                    body={
                      <VStack alignItems="flex-start">
                        <Text fontWeight="bold">
                          Score: {strategyScore.platformRiskContractsVerifiedScore}
                        </Text>
                        <Text>
                          {
                            STRATEGY_HELP.contractsVerified[
                              strategyScore.strategy.contractsVerified
                            ].explanation
                          }
                        </Text>
                      </VStack>
                    }
                  >
                    <Text fontWeight="bold">
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                      />
                    </Text>
                  </PopoverTooltip>
                </Flex>
                <Flex gap={4}>
                  {strategyScore.platformRiskAdminWithTimelockScore > SCORE_LIMIT ? (
                    <TriangleUpIcon
                      color={setColorByScore(strategyScore.platformRiskAdminWithTimelockScore)}
                    />
                  ) : (
                    <TriangleDownIcon
                      color={setColorByScore(strategyScore.platformRiskAdminWithTimelockScore)}
                    />
                  )}
                  <Text>
                    {
                      STRATEGY_HELP.adminWithTimelock[strategyScore.strategy.adminWithTimelock]
                        .title
                    }
                  </Text>
                  <PopoverTooltip
                    body={
                      <VStack alignItems="flex-start">
                        <Text fontWeight="bold">
                          Score: {strategyScore.platformRiskAdminWithTimelockScore}
                        </Text>
                        <Text>
                          {
                            STRATEGY_HELP.adminWithTimelock[
                              strategyScore.strategy.adminWithTimelock
                            ].explanation
                          }
                        </Text>
                      </VStack>
                    }
                  >
                    <Text fontWeight="bold">
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                      />
                    </Text>
                  </PopoverTooltip>
                </Flex>
              </VStack>
            </Box>
          </VStack>
        )}
      </Grid>
    </Box>
  );
};
