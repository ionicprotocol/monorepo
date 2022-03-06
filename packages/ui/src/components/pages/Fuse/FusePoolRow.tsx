import { ChevronDownIcon, ChevronUpIcon, LinkIcon } from '@chakra-ui/icons';
import {
  AvatarGroup,
  Box,
  Button,
  Link as ChakraLink,
  Heading,
  IconButton,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { USDPricedFuseAsset } from '@midas-capital/sdk';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CTokenIcon from '@components/pages/Fuse/CTokenIcon';
import { SimpleTooltip } from '@components/shared/SimpleTooltip';
import { useRari } from '@context/RariContext';
import { MergedPool } from '@hooks/fuse/useFusePools';
import { useColors } from '@hooks/useColors';
import { useFusePoolData } from '@hooks/useFusePoolData';
import { letterScore, usePoolRSS } from '@hooks/useRSS';
import { convertMantissaToAPR, convertMantissaToAPY } from '@utils/apyUtils';
import { smallUsdFormatter } from '@utils/bigUtils';
import { Column, Row } from '@utils/chakraUtils';
import { shortAddress } from '@utils/shortAddress';

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

export const usePoolDetails = (assets: USDPricedFuseAsset[] | undefined) => {
  return useMemo(() => {
    if (assets && assets.length) {
      let mostSuppliedAsset = assets[0];
      let topLendingAPYAsset = assets[0];
      let topBorrowAPRAsset = assets[0];
      assets.map((asset) => {
        if (asset.totalSupplyUSD > mostSuppliedAsset.totalSupplyUSD) {
          mostSuppliedAsset = asset;
        }
        if (
          convertMantissaToAPY(asset.supplyRatePerBlock, 365) >
          convertMantissaToAPY(topLendingAPYAsset.supplyRatePerBlock, 365)
        ) {
          topLendingAPYAsset = asset;
        }
        if (
          convertMantissaToAPR(asset.borrowRatePerBlock) >
          convertMantissaToAPR(topBorrowAPRAsset.borrowRatePerBlock)
        ) {
          topBorrowAPRAsset = asset;
        }
      });

      return {
        mostSuppliedAsset,
        topLendingAPYAsset,
        topBorrowAPRAsset,
      };
    } else {
      return null;
    }
  }, [assets]);
};

const PoolRow = ({
  data: pool,
  isMostSupplied,
}: {
  data: MergedPool;
  isMostSupplied?: boolean;
}) => {
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
  const poolDetails = usePoolDetails(fusePoolData?.assets);
  const {
    borderColor,
    solidBtnActiveBgColor,
    bgColor,
    cardBgColor,
    cardTextColor,
    cardHoverBgColor,
    cardBorderColor,
  } = useColors();

  const [showItem, setShowItem] = useState<{ [key: string]: boolean }>({});

  const handleToggle = (id: string) => {
    setShowItem({ ...showItem, [id]: !showItem[id] });
  };

  const router = useRouter();
  const { t } = useTranslation();
  const { scanUrl, setLoading } = useRari();

  return (
    <Row crossAxisAlignment="center" mainAxisAlignment="space-around" position="relative">
      <Column
        crossAxisAlignment="center"
        mainAxisAlignment="space-around"
        borderWidth={4}
        borderRadius={12}
        borderColor={isMostSupplied && showItem[`${pool.id}`] ? 'transparent' : cardBorderColor}
        background={
          showItem[`${pool.id}`]
            ? `linear-gradient(${cardBgColor}, ${cardBgColor}) padding-box, conic-gradient(red, orange, yellow, lime, aqua, blue, magenta, red) border-box`
            : isMostSupplied
            ? cardHoverBgColor
            : cardBgColor
        }
        width="100%"
        _hover={
          !showItem[`${pool.id}`]
            ? isMostSupplied
              ? { background: cardBgColor }
              : { background: cardHoverBgColor }
            : undefined
        }
        color={cardTextColor}
      >
        <Row
          borderBottomWidth={showItem[`${pool.id}`] ? 2 : 0}
          borderColor={borderColor}
          borderStyle="dashed"
          crossAxisAlignment="center"
          cursor="pointer"
          mainAxisAlignment="flex-start"
          onClick={() => {
            setLoading(true);
            router.push('/pool/' + pool.id);
          }}
          py={4}
          width="100%"
        >
          <Column mainAxisAlignment="center" crossAxisAlignment="center" width="30%">
            <Heading fontWeight="bold" fontSize={'xl'}>
              {pool.name}
            </Heading>
          </Column>
          <Column mainAxisAlignment="center" crossAxisAlignment="center" width="15%">
            <Tooltip
              label={'Underlying RSS: ' + (rss ? rss.totalScore.toFixed(2) : '?') + '%'}
              placement="top"
              hasArrow
            >
              <Box background={scoreGradient} px="4" py="2" borderRadius="5px">
                <Text fontSize="lg" textColor="white" fontWeight="semibold">
                  {rssScore}
                </Text>
              </Box>
            </Tooltip>
          </Column>
          <Column mainAxisAlignment="center" crossAxisAlignment="center" width="20%">
            {pool.underlyingTokens.length === 0 ? null : (
              <Tooltip label={tokens.map((item) => item.symbol).join(' / ')}>
                <AvatarGroup size="sm" max={30}>
                  {tokens.slice(0, 10).map(({ address }) => {
                    return <CTokenIcon key={address} address={address} />;
                  })}
                </AvatarGroup>
              </Tooltip>
            )}
          </Column>
          <Column mainAxisAlignment="center" crossAxisAlignment="center" width="10%">
            <Text fontWeight="bold" textAlign="center">
              {smallUsdFormatter(pool.suppliedUSD)}
            </Text>
          </Column>
          <Column mainAxisAlignment="center" crossAxisAlignment="center" width="13%">
            <Text fontWeight="bold" textAlign="center">
              {smallUsdFormatter(pool.borrowedUSD)}
            </Text>
          </Column>
        </Row>
        <motion.div
          animate={showItem[`${pool.id}`] ? { height: 'auto' } : { height: '0px' }}
          transition={{ ease: 'easeOut', duration: 0.2 }}
          initial={{ height: '0px' }}
          style={{ overflow: 'hidden', width: '100%' }}
        >
          <Row
            crossAxisAlignment="center"
            mainAxisAlignment="space-evenly"
            width="100%"
            py={8}
            alignItems="baseline"
          >
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" width={400}>
              <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%">
                <Column mainAxisAlignment="center" crossAxisAlignment="center" gap={3}>
                  <Row crossAxisAlignment="center" mainAxisAlignment="center" width="100%">
                    <Text fontWeight="bold" textAlign="center">
                      {t('Your Borrow Balance')}
                    </Text>
                  </Row>
                  <Row crossAxisAlignment="center" mainAxisAlignment="center" width="100%">
                    <Text fontWeight="bold" textAlign="center">
                      {isMostSupplied
                        ? fusePoolData && smallUsdFormatter(fusePoolData.totalBorrowBalanceUSD)
                        : '$0.00'}
                    </Text>
                  </Row>
                </Column>
                <Column mainAxisAlignment="center" crossAxisAlignment="center" gap={3} pl="15%">
                  <Row crossAxisAlignment="center" mainAxisAlignment="center" width="100%">
                    <Text fontWeight="bold" textAlign="center">
                      {t('Your Supply Balance')}
                    </Text>
                  </Row>
                  <Row crossAxisAlignment="center" mainAxisAlignment="center" width="100%">
                    <Text fontWeight="bold" textAlign="center">
                      {isMostSupplied
                        ? fusePoolData && smallUsdFormatter(fusePoolData.totalSupplyBalanceUSD)
                        : '$0.00'}
                    </Text>
                  </Row>
                </Column>
              </Row>
              <Row
                crossAxisAlignment="center"
                mainAxisAlignment="flex-start"
                width="100%"
                pt={8}
                opacity={0.7}
              >
                <Text fontWeight="bold" textAlign="center">
                  {t('Claimable Rewards')} :
                </Text>
                <Text fontWeight="bold" textAlign="center" ml={4}>
                  {0}
                </Text>
              </Row>
              <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%" pt={4}>
                <Button
                  variant="outline"
                  bg={solidBtnActiveBgColor}
                  color="black"
                  height={8}
                  width={24}
                  disabled={true}
                >
                  Claim
                </Button>
              </Row>
            </Column>
            <Column mainAxisAlignment="center" crossAxisAlignment="center">
              <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%">
                <Column mainAxisAlignment="center" crossAxisAlignment="flex-start" width={52}>
                  <Text fontWeight="bold" textAlign="center">
                    {t('Most Supplied Asset')}
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
                      smallUsdFormatter(poolDetails.mostSuppliedAsset.totalSupplyUSD)}
                  </Text>
                </Column>
              </Row>
              <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%" pt={2}>
                <Column mainAxisAlignment="center" crossAxisAlignment="flex-start" width={52}>
                  <Text fontWeight="bold" textAlign="center">
                    {t('Top Lending APY')}
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
                      convertMantissaToAPY(
                        poolDetails.topLendingAPYAsset.supplyRatePerBlock,
                        365
                      ).toFixed(2)}
                    % APY
                  </Text>
                </Column>
              </Row>
              <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%" pt={2}>
                <Column mainAxisAlignment="center" crossAxisAlignment="flex-start" width={52}>
                  <Text fontWeight="bold">{t('Top Stable Borrow APR')}</Text>
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
                      convertMantissaToAPR(
                        poolDetails.topBorrowAPRAsset.borrowRatePerBlock
                      ).toFixed(2)}
                    % APR
                  </Text>
                </Column>
              </Row>
              <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%" pt={2}>
                <Column mainAxisAlignment="center" crossAxisAlignment="flex-start" width="268px">
                  <Text fontWeight="bold" textAlign="center">
                    {t('Pool Address')}
                  </Text>
                </Column>
                {fusePoolData?.comptroller && (
                  <Column mainAxisAlignment="center" crossAxisAlignment="flex-start">
                    <Row crossAxisAlignment="center" mainAxisAlignment="flex-start">
                      <Text fontWeight="bold" textAlign="center">
                        {shortAddress(fusePoolData?.comptroller)}
                      </Text>
                      <SimpleTooltip
                        placement="top-start"
                        label={`${scanUrl}/address/${fusePoolData?.comptroller}`}
                      >
                        <Button
                          variant={'link'}
                          as={ChakraLink}
                          href={`${scanUrl}/address/${fusePoolData?.comptroller}`}
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
          </Row>
        </motion.div>
      </Column>
      <IconButton
        position="absolute"
        right={8}
        top={5}
        onClick={() => handleToggle(`${pool.id}`)}
        px={4}
        py={4}
        disabled={!poolDetails ? true : false}
        variant="outline"
        colorScheme={solidBtnActiveBgColor}
        aria-label="detail view"
        fontSize="20px"
        borderRadius="50%"
        background={bgColor}
        icon={
          !showItem[`${pool.id}`] ? (
            <ChevronDownIcon fontSize={30} />
          ) : (
            <ChevronUpIcon fontSize={30} />
          )
        }
        _hover={{ background: solidBtnActiveBgColor, color: 'black' }}
      />
    </Row>
  );
};

export default PoolRow;
