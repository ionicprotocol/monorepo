import { AvatarGroup, Box, Button, chakra, Flex, Heading, Text, Tooltip } from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/types';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { Column, Row } from '@ui/components/shared/Flex';
import { config } from '@ui/config/index';
import { useMidas } from '@ui/context/MidasContext';
import { usePoolRiskScoreGradient } from '@ui/hooks/fuse/usePoolRiskScoreGradient';
import { useColors } from '@ui/hooks/useColors';
import { letterScore, usePoolRSS } from '@ui/hooks/useRSS';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { smallUsdFormatter } from '@ui/utils/bigUtils';

interface PoolCardProps {
  data: FusePoolData;
  isMostSupplied?: boolean;
}

const PoolCard = ({ data }: PoolCardProps) => {
  const { data: rss, error: rssError } = usePoolRSS(data.id);
  const rssScore = !rssError && rss ? letterScore(rss.totalScore) : '?';
  const tokens = useMemo(() => {
    return data.underlyingTokens.map((address, index) => ({
      address,
      symbol: data.underlyingSymbols[index],
    }));
  }, [data.underlyingSymbols, data.underlyingTokens]);
  const scoreGradient = usePoolRiskScoreGradient(rssScore);

  const { cCard } = useColors();

  const router = useRouter();
  const { setLoading, currentChain, coingeckoId } = useMidas();

  const { data: usdPrice } = useUSDPrice(coingeckoId);
  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Flex
        w="100%"
        key={data.id}
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
            {data.name}
          </Heading>
        </Row>
        <Row crossAxisAlignment="center" mainAxisAlignment="space-between" mx="6">
          {data.underlyingTokens.length === 0 ? null : (
            <AvatarGroup size="sm" max={30}>
              {tokens.slice(0, 10).map(({ address }) => {
                return <CTokenIcon key={address} address={address} />;
              })}
            </AvatarGroup>
          )}
          {config.isRssScoreEnabled && (
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
          )}
        </Row>
        <chakra.div w="100%" h="1px" bgColor={cCard.dividerColor} />
        <Row mx="6" mainAxisAlignment="center" crossAxisAlignment="center" gridGap="6">
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text fontWeight="normal" textAlign="center">
              Total Supply
            </Text>
            <Text mt="1.5" fontWeight="bold">
              {usdPrice && smallUsdFormatter(data.totalSuppliedNative * usdPrice)}
            </Text>
          </Column>
          <chakra.div h="16" w="1px" bgColor={cCard.dividerColor} />
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text fontWeight="normal" textAlign="center">
              Total borrowed
            </Text>
            <Text mt="1.5" fontWeight="bold">
              {usdPrice && smallUsdFormatter(data.totalBorrowedNative * usdPrice)}
            </Text>
          </Column>
        </Row>
        <chakra.div w="100%" h="1px" bgColor={cCard.dividerColor} />
        <Row mx="6" mainAxisAlignment="center" crossAxisAlignment="center" gridGap="6">
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text fontWeight="normal" textAlign="center">
              Your Supply <br></br> Balance
            </Text>
            <Text mt="1.5" fontWeight="bold">
              {usdPrice && smallUsdFormatter(data.totalSupplyBalanceNative * usdPrice)}
            </Text>
          </Column>
          <chakra.div h="16" w="1px" bgColor={cCard.dividerColor} />
          <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" color={cCard.txtColor}>
            <Text fontWeight="normal" textAlign="center">
              Your borrowed <br></br> Balance
            </Text>
            <Text mt="1.5" fontWeight="bold">
              {usdPrice && smallUsdFormatter(data.totalBorrowBalanceNative * usdPrice)}
            </Text>
          </Column>
        </Row>
        <Row py="6" mainAxisAlignment="center" crossAxisAlignment="center">
          <Button
            onClick={() => {
              setLoading(true);
              router.push(`/${currentChain.id}/pool/` + data.id);
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
