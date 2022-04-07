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
import { FusePoolData } from '@midas-capital/sdk/dist/cjs/src/Fuse/types';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CTokenIcon } from '@components/shared/CTokenIcon';
import { SimpleTooltip } from '@components/shared/SimpleTooltip';
import { useRari } from '@context/RariContext';
import {
  RewardsDistributor,
  useRewardsDistributorsForPool,
} from '@hooks/rewards/useRewardsDistributorsForPool';
import { useColors } from '@hooks/useColors';
import { useFusePoolData } from '@hooks/useFusePoolData';
import { letterScore, usePoolRSS } from '@hooks/useRSS';
import { convertMantissaToAPR, convertMantissaToAPY } from '@utils/apyUtils';
import { smallUsdFormatter } from '@utils/bigUtils';
import { Column, Row } from '@utils/chakraUtils';
import { shortAddress } from '@utils/shortAddress';

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
  data: FusePoolData;
  isMostSupplied?: boolean;
}) => {
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
  const poolDetails = usePoolDetails(fusePoolData?.assets);

  const { data: rewardsDistributors } = useRewardsDistributorsForPool(fusePoolData?.comptroller);

  const { cCard, cOutlineBtn } = useColors();

  const [showItem, setShowItem] = useState<{ [key: string]: boolean }>({});

  const handleToggle = (id: string) => {
    setShowItem({ ...showItem, [id]: !showItem[id] });
  };

  const router = useRouter();
  const { t } = useTranslation();
  const { scanUrl, setLoading, currentChain } = useRari();
  return (
    <Row crossAxisAlignment="center" mainAxisAlignment="space-around" position="relative">
      <Column
        crossAxisAlignment="center"
        mainAxisAlignment="space-around"
        borderWidth={4}
        borderRadius={12}
        borderColor={
          (isMostSupplied && showItem[`${pool.id}`]) ||
          (rewardsDistributors && rewardsDistributors.length !== 0)
            ? 'transparent'
            : cCard.borderColor
        }
        background={
          showItem[`${pool.id}`] || (rewardsDistributors && rewardsDistributors.length !== 0)
            ? `linear-gradient(${cCard.bgColor}, ${cCard.bgColor}) padding-box, conic-gradient(red, orange, yellow, lime, aqua, blue, magenta, red) border-box`
            : isMostSupplied
            ? cCard.hoverBgColor
            : cCard.bgColor
        }
        width="100%"
        _hover={
          !showItem[`${pool.id}`]
            ? rewardsDistributors && rewardsDistributors.length !== 0
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
        <Row
          borderBottomWidth={showItem[`${pool.id}`] ? 2 : 0}
          borderColor={cCard.borderColor}
          borderStyle="dashed"
          crossAxisAlignment="center"
          cursor="pointer"
          mainAxisAlignment="flex-start"
          onClick={() => {
            setLoading(true);
            router.push(`/${currentChain.id}/pool/` + pool.id);
          }}
          py={4}
          width="100%"
        >
          <Column mainAxisAlignment="center" crossAxisAlignment="flex-start" width="30%" pl="5%">
            <Heading
              fontWeight="bold"
              fontSize={'xl'}
              mt={rewardsDistributors && rewardsDistributors.length !== 0 ? 3 : 0}
            >
              {pool.name}
            </Heading>
            {rewardsDistributors && rewardsDistributors.length !== 0 && (
              <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%" mt={2}>
                <Column mainAxisAlignment="center" crossAxisAlignment="center" mr={4}>
                  <Text fontWeight="bold">{t('This pool is offering rewards')}</Text>
                </Column>
                <Column mainAxisAlignment="center" crossAxisAlignment="center">
                  <AvatarGroup size="sm" max={30}>
                    {rewardsDistributors.map((rD: RewardsDistributor, index: number) => {
                      return <CTokenIcon key={index} address={rD.rewardToken} />;
                    })}
                  </AvatarGroup>
                </Column>
              </Row>
            )}
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
              <AvatarGroup size="sm" max={30}>
                {tokens.slice(0, 10).map(({ address }) => {
                  return <CTokenIcon key={address} address={address} />;
                })}
              </AvatarGroup>
            )}
          </Column>
          <Column mainAxisAlignment="center" crossAxisAlignment="center" width="10%">
            <Text fontWeight="bold" textAlign="center">
              {smallUsdFormatter(pool.totalSuppliedUSD)}
            </Text>
          </Column>
          <Column mainAxisAlignment="center" crossAxisAlignment="center" width="13%">
            <Text fontWeight="bold" textAlign="center">
              {smallUsdFormatter(pool.totalBorrowedUSD)}
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
            py={4}
            alignItems="baseline"
          >
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="center" width={400}>
              <Row crossAxisAlignment="center" mainAxisAlignment="space-between" width="100%">
                <Column mainAxisAlignment="center" crossAxisAlignment="center" gap={2}>
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
                <Column mainAxisAlignment="center" crossAxisAlignment="center" gap={2}>
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
              <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%" pt={8}>
                {rewardsDistributors && rewardsDistributors.length !== 0 ? (
                  <>
                    <Text fontWeight="bold" textAlign="center" mr={4}>
                      {t('Rewards')}:
                    </Text>
                    <AvatarGroup size="sm" max={30}>
                      {rewardsDistributors.map((rD, index) => {
                        return <CTokenIcon key={index} address={rD.rewardToken} />;
                      })}
                    </AvatarGroup>
                  </>
                ) : (
                  <Text fontWeight="bold" textAlign="center">
                    {t('Rewards ( Not available )')}
                  </Text>
                )}
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
                        {shortAddress(fusePoolData?.comptroller, 4, 2)}
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
        top={rewardsDistributors && rewardsDistributors.length !== 0 ? 10 : 5}
        onClick={() => handleToggle(`${pool.id}`)}
        px={4}
        py={4}
        disabled={!poolDetails ? true : false}
        variant="outline"
        color={cOutlineBtn.primary.txtColor}
        aria-label="detail view"
        fontSize="20px"
        borderRadius="50%"
        borderWidth={3}
        borderColor={cOutlineBtn.primary.borderColor}
        background={cOutlineBtn.primary.bgColor}
        icon={
          !showItem[`${pool.id}`] ? (
            <ChevronDownIcon fontSize={30} />
          ) : (
            <ChevronUpIcon fontSize={30} />
          )
        }
        _hover={{
          background: cOutlineBtn.primary.hoverBgColor,
          color: cOutlineBtn.primary.hoverTxtColor,
        }}
        _active={{}}
      />
    </Row>
  );
};

export default PoolRow;
