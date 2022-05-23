import { AvatarGroup, Box, Button, chakra, Flex, Heading, Text, Tooltip } from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/sdk';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { useRari } from '@ui/context/RariContext';
import { usePoolRiskScoreGradient } from '@ui/hooks/fuse/usePoolRiskScoreGradient';
import { useColors } from '@ui/hooks/useColors';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { letterScore, usePoolRSS } from '@ui/hooks/useRSS';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { Column, Row } from '@ui/utils/chakraUtils';

const PoolCard = ({ data: pool }: { data: FusePoolData }) => {
  const { data: fusePoolData } = useFusePoolData(pool.id.toString());
  const { data: rss, error: rssError } = usePoolRSS(pool.id);
  const rssScore = !rssError && rss ? letterScore(rss.totalScore) : '?';
  const tokens = useMemo(() => {
    return pool.underlyingTokens.map((address, index) => ({
      address,
      symbol: pool.underlyingSymbols[index],
    }));
  }, [pool.underlyingSymbols, pool.underlyingTokens]);
  const scoreGradient = usePoolRiskScoreGradient(rssScore);

  const { cCard } = useColors();

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
              {smallUsdFormatter(pool.totalSuppliedNative)}
            </Text>
          </Column>
          <chakra.div h="16" w="1px" bgColor={cCard.dividerColor} />
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text fontWeight="normal" textAlign="center">
              Total borrowed
            </Text>
            <Text mt="1.5" fontWeight="bold" fontFamily="Manrope">
              {smallUsdFormatter(pool.totalBorrowedNative)}
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
              {fusePoolData && smallUsdFormatter(fusePoolData.totalSupplyBalanceNative)}
            </Text>
          </Column>
          <chakra.div h="16" w="1px" bgColor={cCard.dividerColor} />
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text fontWeight="normal" textAlign="center">
              Your borrowed <br></br> Balance
            </Text>
            <Text mt="1.5" fontWeight="bold" fontFamily="Manrope">
              {fusePoolData && smallUsdFormatter(fusePoolData.totalBorrowBalanceNative)}
            </Text>
          </Column>
        </Row>
        <Row py="6" mainAxisAlignment="center" crossAxisAlignment="center">
          <Button
            onClick={() => {
              setLoading(true);
              router.push(`/${currentChain.id}/pool/` + pool.id);
            }}
          >
            View Details
          </Button>
        </Row>
      </Flex>
    </motion.div>
  );
};

export default PoolCard;
