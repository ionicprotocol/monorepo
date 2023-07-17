import { ExternalLinkIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Link,
  Text,
  useColorModeValue,
  VStack
} from '@chakra-ui/react';
import { STRATEGY_HELP } from '@ionicprotocol/security';
import type { Strategy, StrategyScore } from '@ionicprotocol/types';
import { useMemo } from 'react';
import { BsTriangleFill } from 'react-icons/bs';

import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { MIDAS_SECURITY_DOCS_URL, SCORE_LIMIT, SCORE_RANGE_MAX } from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';
import type { MarketData } from '@ui/types/TokensDataMap';
import { deployedPlugins, getScanUrlByChainId } from '@ui/utils/networkData';

export const StrategySafetyScore = ({
  asset,
  poolChainId,
  strategyScore
}: {
  asset: MarketData;
  poolChainId: number;
  strategyScore: StrategyScore;
}) => {
  const vaultUrl = useMemo(() => {
    if (strategyScore.strategy.address) {
      return deployedPlugins[poolChainId][strategyScore.strategy.address].apyDocsUrl;
    }
  }, [strategyScore, poolChainId]);
  const scanUrl = useMemo(() => getScanUrlByChainId(poolChainId), [poolChainId]);
  const { cCard } = useColors();
  const greenColor = useColorModeValue('#38A169', 'green');
  const yellowColor = useColorModeValue('#D69E2E', 'yellow');
  const redColor = useColorModeValue('#E53E3E', 'red');
  const setColorByScore = (score: number) => {
    return score >= 0.8 ? greenColor : score >= 0.6 ? yellowColor : redColor;
  };

  return (
    <VStack borderRadius="20" height="100%" spacing={0} width="100%">
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
            <Text color={setColorByScore(strategyScore.totalScore)} fontWeight="bold" size="md">
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
                <BsTriangleFill color={setColorByScore(strategyScore.complexityScore)} size={14} />
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
                      STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].timeInMarket[
                        strategyScore.strategy.timeInMarket
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
            {strategyScore.assetRiskILScore >= SCORE_LIMIT ? (
              <Center>
                <BsTriangleFill color={setColorByScore(strategyScore.assetRiskILScore)} size={14} />
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
                STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].supplyCentralised[
                  strategyScore.strategy.supplyCentralised
                ].title
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
                      STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].supplyCentralised[
                        strategyScore.strategy.supplyCentralised
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
                STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].contractsVerified[
                  strategyScore.strategy.contractsVerified
                ].title
              }
            </Text>
            <PopoverTooltip
              body={
                <VStack alignItems="flex-start">
                  <Text fontWeight="bold">
                    Score: {strategyScore.platformRiskContractsVerifiedScore * SCORE_RANGE_MAX}
                  </Text>
                  <Text>
                    {
                      STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].contractsVerified[
                        strategyScore.strategy.contractsVerified
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
                STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].adminWithTimelock[
                  strategyScore.strategy.adminWithTimelock
                ].title
              }
            </Text>
            <PopoverTooltip
              body={
                <VStack alignItems="flex-start">
                  <Text fontWeight="bold">
                    Score: {strategyScore.platformRiskAdminWithTimelockScore * SCORE_RANGE_MAX}
                  </Text>
                  <Text>
                    {
                      STRATEGY_HELP[strategyScore.strategy.strategy as Strategy].adminWithTimelock[
                        strategyScore.strategy.adminWithTimelock
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
        </VStack>
      </Box>
    </VStack>
  );
};
