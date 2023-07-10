import { ArrowBackIcon } from '@chakra-ui/icons';
import { AvatarGroup, Box, Flex, Grid, HStack, Skeleton, Stack, Text } from '@chakra-ui/react';
import type { SortingState, VisibilityState } from '@tanstack/react-table';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';

import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import { MarketsList } from '@ui/components/pages/PoolPage/MarketsList';
import PoolDetails from '@ui/components/pages/PoolPage/PoolDetails';
import { PoolStats } from '@ui/components/pages/PoolPage/PoolStats';
import { RewardsBanner } from '@ui/components/pages/PoolPage/RewardsBanner';
import { UserStat } from '@ui/components/pages/PoolPage/UserStats/UserStat';
import { CardBox } from '@ui/components/shared/IonicBox';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import {
  IONIC_LOCALSTORAGE_KEYS,
  MARKET_COLUMNS,
  MARKET_LTV,
  SHRINK_ASSETS,
} from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useRewards } from '@ui/hooks/useRewards';
import { useIsMobile } from '@ui/hooks/useScreenSize';

const PoolPage = memo(() => {
  const { setGlobalLoading, address } = useMultiIonic();

  const router = useRouter();
  const poolId = router.query.poolId as string;
  const chainId = router.query.chainId as string;
  const { data } = useFusePoolData(poolId, Number(chainId));
  const { data: allRewards } = useRewards({ chainId: Number(chainId), poolId: poolId });
  const rewardTokens = useRewardTokensOfPool(data?.comptroller, data?.chainId);
  const isMobile = useIsMobile();
  const [initSorting, setInitSorting] = useState<SortingState | undefined>();
  const [initColumnVisibility, setInitColumnVisibility] = useState<VisibilityState | undefined>();
  const [initHidden, setInitHidden] = useState<boolean | undefined>();

  useEffect(() => {
    const oldData = localStorage.getItem(IONIC_LOCALSTORAGE_KEYS);

    if (
      oldData &&
      JSON.parse(oldData).marketSorting &&
      MARKET_COLUMNS.includes(JSON.parse(oldData).marketSorting[0].id)
    ) {
      setInitSorting(JSON.parse(oldData).marketSorting);
    } else {
      setInitSorting([{ desc: true, id: MARKET_LTV }]);
    }

    const columnVisibility: VisibilityState = {};

    if (
      oldData &&
      JSON.parse(oldData).marketColumnVisibility &&
      JSON.parse(oldData).marketColumnVisibility.length > 0
    ) {
      MARKET_COLUMNS.map((columnId) => {
        if (JSON.parse(oldData).marketColumnVisibility.includes(columnId)) {
          columnVisibility[columnId] = true;
        } else {
          columnVisibility[columnId] = false;
        }
      });
    } else {
      MARKET_COLUMNS.map((columnId) => {
        columnVisibility[columnId] = true;
      });
    }

    setInitColumnVisibility(columnVisibility);

    if (oldData && JSON.parse(oldData).isHidden) {
      setInitHidden(true);
    } else {
      setInitHidden(false);
    }
  }, []);

  return (
    <>
      {data && (
        <Head>
          <title key="title">{data.name}</title>
        </Head>
      )}

      <PageTransitionLayout>
        <FusePageLayout>
          <Stack direction={{ base: 'column', sm: 'row' }} mx="auto" spacing={4} width={'100%'}>
            <HStack spacing={4}>
              <ArrowBackIcon
                cursor="pointer"
                fontSize="2xl"
                fontWeight="extrabold"
                onClick={() => {
                  setGlobalLoading(true);
                  router.back();
                }}
              />
              {data ? (
                <Text fontWeight="bold" size="2xl" textAlign="left">
                  {data.name}
                </Text>
              ) : (
                <Skeleton height="54px">Pool Name</Skeleton>
              )}
            </HStack>

            {data?.assets && data.assets.length > 0 ? (
              <HStack spacing={0}>
                <AvatarGroup max={30} size="sm">
                  {!isMobile
                    ? data.assets.map(
                        ({
                          underlyingToken,
                          cToken,
                        }: {
                          cToken: string;
                          underlyingToken: string;
                        }) => (
                          <TokenIcon
                            address={underlyingToken}
                            chainId={data.chainId}
                            key={cToken}
                          />
                        )
                      )
                    : data.assets
                        .slice(0, SHRINK_ASSETS)
                        .map(
                          ({
                            underlyingToken,
                            cToken,
                          }: {
                            cToken: string;
                            underlyingToken: string;
                          }) => {
                            return (
                              <TokenIcon
                                address={underlyingToken}
                                chainId={data.chainId}
                                key={cToken}
                              />
                            );
                          }
                        )}
                </AvatarGroup>
                {isMobile && data.assets.length > SHRINK_ASSETS && (
                  <Text fontWeight="bold" pt={1}>
                    +{data.assets.length - SHRINK_ASSETS}
                  </Text>
                )}
              </HStack>
            ) : null}
          </Stack>

          {rewardTokens.length > 0 && data && (
            <RewardsBanner poolChainId={data.chainId} tokens={rewardTokens} />
          )}

          <PoolStats poolData={data} />

          <CardBox mb="4" overflowX="auto" width="100%">
            {data &&
            initSorting &&
            initColumnVisibility &&
            allRewards &&
            initHidden !== undefined ? (
              <MarketsList
                initColumnVisibility={initColumnVisibility}
                initHidden={initHidden}
                initSorting={initSorting}
                poolData={data}
                rewards={allRewards}
              />
            ) : (
              <>
                <Box gap={4} p={4}>
                  {address ? (
                    <>
                      <Grid
                        gap={4}
                        mb={4}
                        templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
                        w="100%"
                      >
                        <UserStat label="Your Supply" />
                        <UserStat label="Your Borrow" />
                        <UserStat label="Effective Supply APY" />
                        <UserStat label="Effective Borrow APY" />
                      </Grid>
                      <Skeleton borderRadius={'xl'} height={'60px'} mb={4} width="100%" />
                    </>
                  ) : null}

                  <Flex alignItems="center" justifyContent={'space-between'}>
                    <Flex flexDirection={['row']} gap={0}>
                      <Skeleton
                        borderEndRadius={0}
                        borderStartRadius={'xl'}
                        height={'52px'}
                        width={'72px'}
                      />
                      <Skeleton borderRadius={0} height={'52px'} width={'120px'} />
                      <Skeleton
                        borderEndRadius={'xl'}
                        borderStartRadius={0}
                        height={'52px'}
                        width={'120px'}
                      />
                    </Flex>
                    <Skeleton height={'40px'} width={'320px'} />
                  </Flex>
                </Box>
                <Skeleton height={360} width="100%" />
              </>
            )}
          </CardBox>
          <PoolDetails data={data} />
        </FusePageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default PoolPage;
