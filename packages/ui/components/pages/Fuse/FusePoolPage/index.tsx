import { ArrowBackIcon } from '@chakra-ui/icons';
import { AvatarGroup, HStack, Skeleton, Text } from '@chakra-ui/react';
import { SortingState, VisibilityState } from '@tanstack/react-table';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';

import { CollateralRatioBar } from '@ui/components/pages/Fuse/FusePoolPage/CollateralRatioBar';
import { MarketsList } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList';
import PoolDetails from '@ui/components/pages/Fuse/FusePoolPage/PoolDetails';
import { PoolStats } from '@ui/components/pages/Fuse/FusePoolPage/PoolStats';
import { RewardsBanner } from '@ui/components/pages/Fuse/FusePoolPage/RewardsBanner';
import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import { MidasBox } from '@ui/components/shared/Box';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { TableSkeleton } from '@ui/components/shared/TableSkeleton';
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

const FusePoolPage = memo(() => {
  const { setGlobalLoading } = useMultiMidas();

  const router = useRouter();
  const poolId = router.query.poolId as string;
  const chainId = router.query.chainId as string;
  const { data } = useFusePoolData(poolId, Number(chainId));
  const { data: allRewards } = useRewards({ poolId: poolId, chainId: Number(chainId) });
  const rewardTokens = useRewardTokensOfPool(data?.comptroller, data?.chainId);
  const isMobile = useIsMobile();
  const [initSorting, setInitSorting] = useState<SortingState | undefined>();
  const [initColumnVisibility, setInitColumnVisibility] = useState<VisibilityState | undefined>();

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
          <HStack width={'100%'} mx="auto" spacing={6}>
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
              <Text textAlign="left" variant="title" fontWeight="bold">
                {data.name}
              </Text>
            ) : (
              <Skeleton>Pool Name</Skeleton>
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

          {rewardTokens.length > 0 && data && (
            <RewardsBanner tokens={rewardTokens} poolChainId={data.chainId} />
          )}

          <PoolStats poolData={data} />

          {data && data.assets.some((asset) => asset.membership) && (
            <CollateralRatioBar
              assets={data.assets}
              borrowFiat={data.totalBorrowBalanceFiat}
              poolChainId={data.chainId}
              mb={4}
            />
          )}

          <MidasBox overflowX="auto" width="100%" mb="4">
            {data && initSorting && initColumnVisibility && allRewards ? (
              <MarketsList
                assets={data.assets}
                rewards={allRewards}
                comptrollerAddress={data.comptroller}
                supplyBalanceFiat={data.totalSupplyBalanceFiat}
                borrowBalanceFiat={data.totalBorrowBalanceFiat}
                poolChainId={data.chainId}
                initSorting={initSorting}
                initColumnVisibility={initColumnVisibility}
              />
            ) : (
              <TableSkeleton tableHeading="Assets" />
            )}
          </MidasBox>

          <PoolDetails data={data} />
        </FusePageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default FusePoolPage;
