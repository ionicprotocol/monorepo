import { ArrowBackIcon } from '@chakra-ui/icons';
import { AvatarGroup, Box, Flex, Grid, HStack, Skeleton, Text } from '@chakra-ui/react';
import { SortingState, VisibilityState } from '@tanstack/react-table';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';
import { SupportedChains } from 'types/dist/cjs';

import { UserStat } from './UserStats/UserStat';

import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import { MarketsList } from '@ui/components/pages/PoolPage/MarketsList';
import PoolDetails from '@ui/components/pages/PoolPage/PoolDetails';
import { PoolStats } from '@ui/components/pages/PoolPage/PoolStats';
import { RewardsBanner } from '@ui/components/pages/PoolPage/RewardsBanner';
import { Banner } from '@ui/components/shared/Banner';
import { MidasBox } from '@ui/components/shared/Box';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import {
  MARKET_COLUMNS,
  MARKET_LTV,
  MIDAS_LOCALSTORAGE_KEYS,
  SHRINK_ASSETS,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useRewards } from '@ui/hooks/useRewards';
import { useIsMobile } from '@ui/hooks/useScreenSize';

const PoolPage = memo(() => {
  const { setGlobalLoading, address } = useMultiMidas();

  const router = useRouter();
  const poolId = router.query.poolId as string;
  const chainId = router.query.chainId as string;
  const { data } = useFusePoolData(poolId, Number(chainId));
  const { data: allRewards } = useRewards({ poolId: poolId, chainId: Number(chainId) });
  const rewardTokens = useRewardTokensOfPool(data?.comptroller, data?.chainId);
  const isMobile = useIsMobile();
  const [initSorting, setInitSorting] = useState<SortingState | undefined>();
  const [initColumnVisibility, setInitColumnVisibility] = useState<VisibilityState | undefined>();
  const [initHidden, setInitHidden] = useState<boolean | undefined>();

  useEffect(() => {
    const oldData = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);

    if (
      oldData &&
      JSON.parse(oldData).marketSorting &&
      MARKET_COLUMNS.includes(JSON.parse(oldData).marketSorting[0].id)
    ) {
      setInitSorting(JSON.parse(oldData).marketSorting);
    } else {
      setInitSorting([{ id: MARKET_LTV, desc: true }]);
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
          <HStack width={'100%'} mx="auto" spacing={4}>
            <ArrowBackIcon
              fontSize="2xl"
              fontWeight="extrabold"
              cursor="pointer"
              onClick={() => {
                setGlobalLoading(true);
                router.back();
              }}
            />
            {data ? (
              <Text textAlign="left" size="2xl" fontWeight="bold">
                {data.name}
              </Text>
            ) : (
              <Skeleton height="54px">Pool Name</Skeleton>
            )}
            {data?.assets && data.assets.length > 0 ? (
              <HStack spacing={0}>
                <AvatarGroup size="sm" max={30}>
                  {!isMobile
                    ? data.assets.map(
                        ({
                          underlyingToken,
                          cToken,
                        }: {
                          underlyingToken: string;
                          cToken: string;
                        }) => (
                          <TokenIcon
                            key={cToken}
                            address={underlyingToken}
                            chainId={data.chainId}
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
                            underlyingToken: string;
                            cToken: string;
                          }) => {
                            return (
                              <TokenIcon
                                key={cToken}
                                address={underlyingToken}
                                chainId={data.chainId}
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
          </HStack>

          {chainId === SupportedChains.bsc.toString() && poolId === '7' && (
            <Banner
              text="Due to the exploit affecting aBNBc, this pool is currently paused. We are taking a snapshot for everyone that supplied to this pool. Handling of the situation is currently being done by Ankr. More information: "
              linkText="https://twitter.com/ankr/status/1598624443642703872"
              linkUrl="https://twitter.com/ankr/status/1598624443642703872"
              status="warning"
              mt={2}
            />
          )}

          {rewardTokens.length > 0 && data && (
            <RewardsBanner tokens={rewardTokens} poolChainId={data.chainId} />
          )}

          <PoolStats poolData={data} />

          <MidasBox overflowX="auto" width="100%" mb="4">
            {data &&
            initSorting &&
            initColumnVisibility &&
            allRewards &&
            initHidden !== undefined ? (
              <MarketsList
                poolData={data}
                rewards={allRewards}
                initSorting={initSorting}
                initColumnVisibility={initColumnVisibility}
                initHidden={initHidden}
              />
            ) : (
              <>
                <Box p={4} gap={4}>
                  {address ? (
                    <>
                      <Grid
                        templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
                        gap={4}
                        w="100%"
                        mb={4}
                      >
                        <UserStat label="Your Supply" />
                        <UserStat label="Your Borrow" />
                        <UserStat label="Effective Supply APY" />
                        <UserStat label="Effective Borrow APY" />
                      </Grid>
                      <Skeleton height={'60px'} width="100%" borderRadius={'xl'} mb={4} />
                    </>
                  ) : null}

                  <Flex alignItems="center" justifyContent={'space-between'}>
                    <Flex flexDirection={['row']} gap={0}>
                      <Skeleton
                        height={'52px'}
                        width={'72px'}
                        borderStartRadius={'xl'}
                        borderEndRadius={0}
                      />
                      <Skeleton height={'52px'} width={'120px'} borderRadius={0} />
                      <Skeleton
                        height={'52px'}
                        width={'120px'}
                        borderStartRadius={0}
                        borderEndRadius={'xl'}
                      />
                    </Flex>
                    <Skeleton height={'40px'} width={'320px'} />
                  </Flex>
                </Box>
                <Skeleton height={360} width="100%" />
              </>
            )}
          </MidasBox>
          <PoolDetails data={data} />
        </FusePageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default PoolPage;
