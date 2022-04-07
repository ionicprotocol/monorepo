import { AvatarGroup, Box, Button, chakra, Flex, Heading, Text, Tooltip } from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/sdk/dist/cjs/src/Fuse/types';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { CTokenIcon } from '@components/shared/CTokenIcon';
import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';
import { useFusePoolData } from '@hooks/useFusePoolData';
import { letterScore, usePoolRSS } from '@hooks/useRSS';
import { smallUsdFormatter } from '@utils/bigUtils';
import { Column, Row } from '@utils/chakraUtils';

export const usePoolRiskScoreGradient = (rssScore: ReturnType<typeof letterScore> | '?') => {
  const { cRssScore } = useColors();
  return useMemo(() => {
    return {
      'A++': cRssScore.bgColor,
      'A+': cRssScore.bgColor,
      A: cRssScore.bgColor,
      'A-': cRssScore.bgColor,
      B: cRssScore.bgColor,
      C: cRssScore.bgColor,
      D: cRssScore.bgColor,
      F: cRssScore.bgColor,
      UNSAFE: cRssScore.bgColor,
      '?': cRssScore.bgColor,
    }[rssScore];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rssScore]);
};

const PoolCard = ({ data: pool }: { data: FusePoolData }) => {
  const { data: fusePoolData } = useFusePoolData(pool.id.toString());
  const rss = usePoolRSS(pool.id);
  const rssScore = rss ? letterScore(rss.totalScore) : '?';
  const tokens = useMemo(() => {
    return pool.underlyingTokens.map((address, index) => ({
      address,
      symbol: pool.underlyingSymbols[index],
    }));
  }, [pool.underlyingSymbols, pool.underlyingTokens]);
  const scoreGradient = usePoolRiskScoreGradient(rssScore);

  const { cSolidBtn, cCard } = useColors();

  const router = useRouter();
  const { setLoading, currentChain } = useRari();

  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Flex
        w="100%"
        key={pool.id}
        pt={6}
        bgColor={cCard.bgColor}
        borderColor={cCard.borderColor}
        borderWidth={4}
        borderRadius={12}
        flexDir="column"
        gridGap="6"
      >
        <Row
          mainAxisAlignment="space-between"
          crossAxisAlignment="flex-start"
          gridGap="6"
          mx="6"
          justifyContent="center"
        >
          <Heading fontWeight="bold" fontSize={'xl'} ml="2" color={cCard.txtColor}>
            {pool.name}
          </Heading>
        </Row>
        <Row crossAxisAlignment="center" mainAxisAlignment="space-between" mx="6">
          {pool.underlyingTokens.length === 0 ? null : (
            <AvatarGroup size="sm" max={30}>
              {tokens.slice(0, 10).map(({ address }) => {
                return <CTokenIcon key={address} address={address} />;
              })}
            </AvatarGroup>
          )}
          <Row mainAxisAlignment="center" crossAxisAlignment="center">
            <Tooltip
              label={'Underlying RSS: ' + (rss ? rss.totalScore.toFixed(2) : '?') + '%'}
              placement="top"
              hasArrow
            >
              <Box ml="4" background={scoreGradient} px="4" py="2" borderRadius="5px">
                <Text fontSize="lg" textColor="white" fontWeight="semibold">
                  {rssScore}
                </Text>
              </Box>
            </Tooltip>
          </Row>
        </Row>
        <chakra.div w="100%" h="1px" bgColor={cCard.dividerColor} />
        <Row mx="6" mainAxisAlignment="center" crossAxisAlignment="center" gridGap="6">
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text fontWeight="normal" textAlign="center">
              Total Supply
            </Text>
            <Text mt="1.5" fontWeight="bold" fontFamily="Manrope">
              {smallUsdFormatter(pool.totalSuppliedUSD)}
            </Text>
          </Column>
          <chakra.div h="16" w="1px" bgColor={cCard.dividerColor} />
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text fontWeight="normal" textAlign="center">
              Total borrowed
            </Text>
            <Text mt="1.5" fontWeight="bold" fontFamily="Manrope">
              {smallUsdFormatter(pool.totalBorrowedUSD)}
            </Text>
          </Column>
        </Row>
        <chakra.div w="100%" h="1px" bgColor={cCard.dividerColor} />
        <Row mx="6" mainAxisAlignment="center" crossAxisAlignment="center" gridGap="6">
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text fontWeight="normal" textAlign="center">
              Your Supply <br></br> Balance
            </Text>
            <Text mt="1.5" fontWeight="bold" fontFamily="Manrope">
              {fusePoolData && smallUsdFormatter(fusePoolData.totalSupplyBalanceUSD)}
            </Text>
          </Column>
          <chakra.div h="16" w="1px" bgColor={cCard.dividerColor} />
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text fontWeight="normal" textAlign="center">
              Your borrowed <br></br> Balance
            </Text>
            <Text mt="1.5" fontWeight="bold" fontFamily="Manrope">
              {fusePoolData && smallUsdFormatter(fusePoolData.totalBorrowBalanceUSD)}
            </Text>
          </Column>
        </Row>
        <Row py="6" mainAxisAlignment="center" crossAxisAlignment="center">
          <Button
            as={'button'}
            px={4}
            bgColor={cSolidBtn.primary.bgColor}
            fontFamily={'heading'}
            _hover={{
              opacity: '0.8',
            }}
            fontWeight={'bold'}
            color="black"
            bgClip={'border-box'}
            _active={{
              opacity: '0.8',
            }}
            onClick={() => {
              setLoading(true);
              router.push(`/${currentChain.id}/pool/` + pool.id);
            }}
            cursor="pointer"
            width={32}
          >
            View Details
          </Button>
        </Row>
      </Flex>
    </motion.div>
  );
};

export default PoolCard;
