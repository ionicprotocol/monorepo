import { ChevronDownIcon, ChevronUpIcon, LinkIcon } from '@chakra-ui/icons';
import {
  AvatarGroup,
  Box,
  Button,
  Link as ChakraLink,
  Flex,
  Heading,
  HStack,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/types';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';

import ClaimPoolRewardsButton from '@ui/components/shared/ClaimPoolRewardsButton';
import ClipboardValue from '@ui/components/shared/ClipboardValue';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { Column, Row } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { config } from '@ui/config/index';
import { useRari } from '@ui/context/RariContext';
import { usePoolDetails } from '@ui/hooks/fuse/usePoolDetails';
import { usePoolRiskScoreGradient } from '@ui/hooks/fuse/usePoolRiskScoreGradient';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { useColors } from '@ui/hooks/useColors';
import { letterScore, usePoolRSS } from '@ui/hooks/useRSS';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { getBlockTimePerMinuteByChainId } from '@ui/networkData/index';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { shortAddress } from '@ui/utils/shortAddress';

interface PoolRowProps {
  data: FusePoolData;
  isMostSupplied?: boolean;
}

const PoolRow = ({ data, isMostSupplied }: PoolRowProps) => {
  const router = useRouter();
  const { data: rss, error: rssError } = usePoolRSS(data.id);
  const rssScore = !rssError && rss ? letterScore(rss.totalScore) : '?';
  const tokens = useMemo(() => {
    return data.underlyingTokens.map((address, index) => ({
      address,
      symbol: data.underlyingSymbols[index],
    }));
  }, [data.underlyingSymbols, data.underlyingTokens]);

  const scoreGradient = usePoolRiskScoreGradient(rssScore);
  const poolDetails = usePoolDetails(data.assets);
  const rewardTokens = useRewardTokensOfPool(data.comptroller);
  const { cCard, cOutlineBtn } = useColors();
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const toggleDetails = useCallback(() => {
    setShowDetails((previous) => !previous);
  }, [setShowDetails]);

  const { midasSdk, scanUrl, setLoading, currentChain, coingeckoId } = useRari();
  const { data: usdPrice } = useUSDPrice(coingeckoId);
  return (
    <VStack
      borderWidth={4}
      borderRadius={12}
      borderColor={rewardTokens.length ? 'transparent' : cCard.borderColor}
      background={
        rewardTokens.length > 0
          ? `linear-gradient(${cCard.bgColor}, ${cCard.bgColor}) padding-box, conic-gradient(red, orange, yellow, lime, aqua, blue, magenta, red) border-box`
          : cCard.bgColor
      }
      width="100%"
      _hover={
        !showDetails
          ? rewardTokens.length > 0
            ? {
                background: `linear-gradient(${cCard.hoverBgColor}, ${cCard.hoverBgColor}) padding-box, conic-gradient(red, orange, yellow, lime, aqua, blue, magenta, red) border-box`,
              }
            : isMostSupplied
            ? { background: cCard.bgColor }
            : { background: cCard.hoverBgColor }
          : undefined
      }
      color={cCard.txtColor}
    >
      <HStack
        borderBottomWidth={showDetails ? 2 : 0}
        borderColor={cCard.borderColor}
        borderStyle="dashed"
        cursor="pointer"
        onClick={() => {
          setLoading(true);
          router.push(`/${currentChain.id}/pool/` + data.id);
        }}
        py={4}
        px={6}
        width="100%"
      >
        <VStack flex={5} alignItems={'flex-start'} spacing={1}>
          <Flex>
            <Heading mt={rewardTokens.length ? 2 : 0} fontWeight="bold" fontSize={'xl'} mr={2}>
              {data.name}
            </Heading>
          </Flex>

          {rewardTokens.length && (
            <HStack m={0}>
              <Text fontWeight="bold">This pool is offering rewards</Text>
              <AvatarGroup size="xs" max={5}>
                {rewardTokens.map((token) => (
                  <CTokenIcon key={token} address={token} />
                ))}
              </AvatarGroup>
            </HStack>
          )}
        </VStack>
        <VStack flex={3} alignItems={'center'}>
          <ClaimPoolRewardsButton poolAddress={data.comptroller} />
        </VStack>

        {config.isRssScoreEnabled && (
          <VStack flex={2}>
            <SimpleTooltip
              label={'Underlying RSS: ' + (rss ? rss.totalScore.toFixed(2) : '?') + '%'}
            >
              <Box background={scoreGradient} px="4" py="2" borderRadius="5px">
                <Text fontSize="lg" textColor="white" fontWeight="semibold">
                  {rssScore}
                </Text>
              </Box>
            </SimpleTooltip>
          </VStack>
        )}

        <VStack flex={config.isRssScoreEnabled ? 4 : 6} alignItems="flex-start">
          {data.underlyingTokens.length === 0 ? null : (
            <AvatarGroup size="sm" max={30}>
              {tokens.slice(0, 10).map((token, i) => (
                <CTokenIcon key={i} address={token.address} />
              ))}
            </AvatarGroup>
          )}
        </VStack>

        <VStack flex={2}>
          <Text fontWeight="bold" textAlign="center">
            {usdPrice && smallUsdFormatter(data.totalSuppliedNative * usdPrice)}
          </Text>
        </VStack>

        <VStack flex={2}>
          <Text fontWeight="bold" textAlign="center">
            {usdPrice && smallUsdFormatter(data.totalBorrowedNative * usdPrice)}
          </Text>
        </VStack>

        <VStack flex={1}>
          <IconButton
            alignSelf="flex-end"
            onClick={(e) => {
              e.stopPropagation();
              toggleDetails();
            }}
            disabled={!poolDetails ? true : false}
            variant="outline"
            color={cOutlineBtn.primary.txtColor}
            aria-label="detail view"
            borderRadius="50%"
            borderWidth={3}
            borderColor={cOutlineBtn.primary.borderColor}
            background={cOutlineBtn.primary.bgColor}
            icon={
              !showDetails ? <ChevronDownIcon fontSize={30} /> : <ChevronUpIcon fontSize={30} />
            }
            _hover={{
              background: cOutlineBtn.primary.hoverBgColor,
              color: cOutlineBtn.primary.hoverTxtColor,
            }}
          />
        </VStack>
      </HStack>

      {/* Additional Info */}
      <motion.div
        animate={showDetails ? { height: 'auto' } : { height: '0px' }}
        transition={{ ease: 'easeOut', duration: 0.2 }}
        initial={{ height: '0px' }}
        style={{ overflow: 'hidden', width: '100%', margin: 0 }}
      >
        <HStack justifyContent={'space-evenly'} width="100%" py={4} alignItems="baseline">
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" width={400}>
            <Row crossAxisAlignment="center" mainAxisAlignment="space-between" width="100%">
              <Column mainAxisAlignment="center" crossAxisAlignment="center" gap={2}>
                <Row crossAxisAlignment="center" mainAxisAlignment="center" width="100%">
                  <Text fontWeight="bold" textAlign="center">
                    Your Borrow Balance
                  </Text>
                </Row>
                <Row crossAxisAlignment="center" mainAxisAlignment="center" width="100%">
                  <Text fontWeight="bold" textAlign="center">
                    {isMostSupplied && usdPrice
                      ? data && smallUsdFormatter(data.totalBorrowBalanceNative * usdPrice)
                      : '$0.00'}
                  </Text>
                </Row>
              </Column>
              <Column mainAxisAlignment="center" crossAxisAlignment="center" gap={2}>
                <Row crossAxisAlignment="center" mainAxisAlignment="center" width="100%">
                  <Text fontWeight="bold" textAlign="center">
                    Your Supply Balance
                  </Text>
                </Row>
                <Row crossAxisAlignment="center" mainAxisAlignment="center" width="100%">
                  <Text fontWeight="bold" textAlign="center">
                    {isMostSupplied && usdPrice
                      ? data && smallUsdFormatter(data.totalSupplyBalanceNative * usdPrice)
                      : '$0.00'}
                  </Text>
                </Row>
              </Column>
            </Row>
            <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%" pt={8}>
              {rewardTokens.length > 0 && (
                <>
                  <Text fontWeight="bold" textAlign="center" mr={4}>
                    Rewards:
                  </Text>
                  <AvatarGroup size="sm" max={30}>
                    {rewardTokens.map((token, i) => (
                      <CTokenIcon key={i} address={token} />
                    ))}
                  </AvatarGroup>
                </>
              )}
            </Row>
          </Column>
          <Column mainAxisAlignment="center" crossAxisAlignment="center">
            <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%">
              <Column mainAxisAlignment="center" crossAxisAlignment="flex-start" width={52}>
                <Text fontWeight="bold" textAlign="center">
                  Most Supplied Asset
                </Text>
              </Column>
              <Column mainAxisAlignment="center" crossAxisAlignment="flex-start" mr={6}>
                {poolDetails?.mostSuppliedAsset && (
                  <CTokenIcon
                    key={poolDetails.mostSuppliedAsset.underlyingToken}
                    address={poolDetails.mostSuppliedAsset.underlyingToken}
                    width={35}
                    height={35}
                  />
                )}
              </Column>
              <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
                <Text fontWeight="bold" textAlign="center">
                  {poolDetails?.mostSuppliedAsset &&
                    usdPrice &&
                    smallUsdFormatter(poolDetails.mostSuppliedAsset.totalSupplyNative * usdPrice)}
                </Text>
              </Column>
            </Row>
            <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%" pt={2}>
              <Column mainAxisAlignment="center" crossAxisAlignment="flex-start" width={52}>
                <Text fontWeight="bold" textAlign="center">
                  Top Lending APY
                </Text>
              </Column>
              <Column mainAxisAlignment="center" crossAxisAlignment="flex-start" mr={6}>
                {poolDetails?.topLendingAPYAsset && (
                  <CTokenIcon
                    key={poolDetails.topLendingAPYAsset.underlyingToken}
                    address={poolDetails.topLendingAPYAsset.underlyingToken}
                    width={35}
                    height={35}
                  />
                )}
              </Column>
              <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
                <Text fontWeight="bold" textAlign="center">
                  {poolDetails?.topLendingAPYAsset &&
                    midasSdk
                      .ratePerBlockToAPY(
                        poolDetails.topLendingAPYAsset.supplyRatePerBlock,
                        getBlockTimePerMinuteByChainId(currentChain.id)
                      )
                      .toFixed(2)}
                  % APY
                </Text>
              </Column>
            </Row>
            <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%" pt={2}>
              <Column mainAxisAlignment="center" crossAxisAlignment="flex-start" width={52}>
                <Text fontWeight="bold">Top Stable Borrow APR</Text>
              </Column>
              <Column mainAxisAlignment="center" crossAxisAlignment="flex-start" mr={6}>
                {poolDetails?.topBorrowAPRAsset && (
                  <CTokenIcon
                    key={poolDetails.topBorrowAPRAsset.underlyingToken}
                    address={poolDetails.topBorrowAPRAsset.underlyingToken}
                    width={35}
                    height={35}
                  />
                )}
              </Column>
              <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
                <Text fontWeight="bold" textAlign="center">
                  {poolDetails?.topBorrowAPRAsset &&
                    midasSdk
                      .ratePerBlockToAPY(
                        poolDetails.topBorrowAPRAsset.borrowRatePerBlock,
                        getBlockTimePerMinuteByChainId(currentChain.id)
                      )
                      .toFixed(2)}
                  % APR
                </Text>
              </Column>
            </Row>
            <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%" pt={2}>
              <Column mainAxisAlignment="center" crossAxisAlignment="flex-start" width="268px">
                <Text fontWeight="bold" textAlign="center">
                  Pool Address
                </Text>
              </Column>
              {data.comptroller && (
                <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
                  <Row crossAxisAlignment="center" mainAxisAlignment="flex-start">
                    <ClipboardValue
                      fontWeight="bold"
                      textAlign="center"
                      component={Text}
                      value={data.comptroller}
                      label={shortAddress(data.comptroller, 4, 4)}
                    />
                    <SimpleTooltip
                      placement="top-start"
                      label={`${scanUrl}/address/${data.comptroller}`}
                    >
                      <Button
                        variant={'link'}
                        as={ChakraLink}
                        href={`${scanUrl}/address/${data.comptroller}`}
                        isExternal
                      >
                        <LinkIcon h={{ base: 3, sm: 6 }} />
                      </Button>
                    </SimpleTooltip>
                  </Row>
                </Column>
              )}
            </Row>
          </Column>
        </HStack>
      </motion.div>
    </VStack>
  );
};

export default PoolRow;
