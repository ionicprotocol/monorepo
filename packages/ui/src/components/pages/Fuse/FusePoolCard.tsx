import { AvatarGroup, Box, Button, chakra, Flex, Heading, Text, Tooltip } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import CTokenIcon from '@components/pages/Fuse/CTokenIcon';
import { useRari } from '@context/RariContext';
import { MergedPool } from '@hooks/fuse/useFusePools';
import { useColors } from '@hooks/useColors';
import { useFusePoolData } from '@hooks/useFusePoolData';
import { letterScore, usePoolRSS } from '@hooks/useRSS';
import { smallUsdFormatter } from '@utils/bigUtils';
import { Column, Row } from '@utils/chakraUtils';

export const usePoolRiskScoreGradient = (rssScore: ReturnType<typeof letterScore> | '?') => {
  const { rssScoreColor } = useColors();
  return useMemo(() => {
    return {
      'A++': rssScoreColor,
      'A+': rssScoreColor,
      A: rssScoreColor,
      'A-': rssScoreColor,
      B: rssScoreColor,
      C: rssScoreColor,
      D: rssScoreColor,
      F: rssScoreColor,
      UNSAFE: rssScoreColor,
      '?': rssScoreColor,
    }[rssScore];
  }, [rssScore]);
};

const PoolCard = ({ data: pool }: { data: MergedPool }) => {
  const fusePoolData = useFusePoolData(pool.id.toString());
  const rss = usePoolRSS(pool.id);
  const rssScore = rss ? letterScore(rss.totalScore) : '?';
  const tokens = useMemo(() => {
    return pool.underlyingTokens.map((address, index) => ({
      address,
      symbol: pool.underlyingSymbols[index],
    }));
  }, [pool.underlyingSymbols, pool.underlyingTokens]);
  const scoreGradient = usePoolRiskScoreGradient(rssScore);

  const { solidBtnActiveBgColor, cardDividerColor, cardBgColor, cardTextColor, cardBorderColor } =
    useColors();

  const router = useRouter();
  const { setLoading } = useRari();

  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Flex
        w="100%"
        key={pool.id}
        pt={6}
        bgColor={cardBgColor}
        borderColor={cardBorderColor}
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
          <Heading fontWeight="bold" fontSize={'xl'} ml="2" color={cardTextColor}>
            {pool.name}
          </Heading>
        </Row>
        <Row crossAxisAlignment="center" mainAxisAlignment="space-between" mx="6">
          {pool.underlyingTokens.length === 0 ? null : (
            <Tooltip label={tokens.map((item) => item.symbol).join(' / ')}>
              <AvatarGroup size="sm" max={30}>
                {tokens.slice(0, 10).map(({ address }) => {
                  return <CTokenIcon key={address} address={address} />;
                })}
              </AvatarGroup>
            </Tooltip>
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
        <chakra.div w="100%" h="1px" bgColor={cardDividerColor} />
        <Row mx="6" mainAxisAlignment="center" crossAxisAlignment="center" gridGap="6">
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cardTextColor}>
            <Text fontWeight="normal" textAlign="center">
              Total Supply
            </Text>
            <Text mt="1.5" fontWeight="bold" fontFamily="Manrope">
              {smallUsdFormatter(pool.suppliedUSD)}
            </Text>
          </Column>
          <chakra.div h="16" w="1px" bgColor={cardDividerColor} />
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cardTextColor}>
            <Text fontWeight="normal" textAlign="center">
              Total borrowed
            </Text>
            <Text mt="1.5" fontWeight="bold" fontFamily="Manrope">
              {smallUsdFormatter(pool.borrowedUSD)}
            </Text>
          </Column>
        </Row>
        <chakra.div w="100%" h="1px" bgColor={cardDividerColor} />
        <Row mx="6" mainAxisAlignment="center" crossAxisAlignment="center" gridGap="6">
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cardTextColor}>
            <Text fontWeight="normal" textAlign="center">
              Your Supply <br></br> Balance
            </Text>
            <Text mt="1.5" fontWeight="bold" fontFamily="Manrope">
              {fusePoolData && smallUsdFormatter(fusePoolData.totalSupplyBalanceUSD)}
            </Text>
          </Column>
          <chakra.div h="16" w="1px" bgColor={cardDividerColor} />
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cardTextColor}>
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
            bgColor={solidBtnActiveBgColor}
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
              router.push('/pool/' + pool.id);
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
