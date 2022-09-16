import { ArrowBackIcon } from '@chakra-ui/icons';
import { AvatarGroup, Flex, Grid, Heading, HStack, Skeleton } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo } from 'react';

import { AssetDetails } from '@ui/components/pages/Fuse/FusePoolPage/AssetDetails';
import { BorrowList } from '@ui/components/pages/Fuse/FusePoolPage/BorrowList';
import { CollateralRatioBar } from '@ui/components/pages/Fuse/FusePoolPage/CollateralRatioBar';
import { MarketsList } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList';
import PoolDetails from '@ui/components/pages/Fuse/FusePoolPage/PoolDetails';
import { PoolStats } from '@ui/components/pages/Fuse/FusePoolPage/PoolStats';
import { RewardsBanner } from '@ui/components/pages/Fuse/FusePoolPage/RewardsBanner';
import { SupplyList } from '@ui/components/pages/Fuse/FusePoolPage/SupplyList';
import FuseNavbar from '@ui/components/pages/Layout/FuseNavbar';
import { MidasBox } from '@ui/components/shared/Box';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { TableSkeleton } from '@ui/components/shared/TableSkeleton';
import { useMidas } from '@ui/context/MidasContext';
import { useFlywheelRewardsForPool } from '@ui/hooks/rewards/useFlywheelRewardsForPool';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { useColors } from '@ui/hooks/useColors';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';

const FusePoolPage = memo(() => {
  const { setLoading } = useMidas();

  const router = useRouter();
  const poolId = router.query.poolId as string;
  const { data } = useFusePoolData(poolId);
  const { data: marketRewards } = useFlywheelRewardsForPool(data?.comptroller);
  const rewardTokens = useRewardTokensOfPool(data?.comptroller);

  const { cPage } = useColors();

  return (
    <>
      {data && (
        <Head>
          <title key="title">{data.name}</title>
        </Head>
      )}

      <PageTransitionLayout>
        <Flex
          minH="100vh"
          flexDir="column"
          alignItems="flex-start"
          bgColor={cPage.primary.bgColor}
          justifyContent="flex-start"
          mb={20}
        >
          <FuseNavbar />
          <HStack width={'100%'} mx="auto" spacing={6}>
            <ArrowBackIcon
              fontSize="2xl"
              fontWeight="extrabold"
              cursor="pointer"
              onClick={() => {
                setLoading(true);
                router.back();
              }}
            />
            {data ? (
              <Heading textAlign="left" fontSize="xl" fontWeight="bold">
                {data.name}
              </Heading>
            ) : (
              <Skeleton>Pool Name</Skeleton>
            )}
            {data?.assets && data?.assets?.length > 0 ? (
              <>
                <AvatarGroup size="sm" max={30}>
                  {data?.assets.map(
                    ({ underlyingToken, cToken }: { underlyingToken: string; cToken: string }) => {
                      return <CTokenIcon key={cToken} address={underlyingToken} />;
                    }
                  )}
                </AvatarGroup>
              </>
            ) : null}
          </HStack>

          {rewardTokens.length > 0 && <RewardsBanner tokens={rewardTokens} />}

          <PoolStats poolData={data} />

          {data && data.assets.some((asset) => asset.membership) && (
            <CollateralRatioBar
              assets={data.assets}
              borrowFiat={data.totalBorrowBalanceFiat}
              mb={4}
            />
          )}

          <Grid w="100%" gap={4} mb={4}>
            <MidasBox pb={3}>
              {data ? (
                <MarketsList
                  assets={data.assets}
                  rewards={marketRewards}
                  comptrollerAddress={data.comptroller}
                />
              ) : (
                <TableSkeleton tableHeading="Your Supply Balance" />
              )}
            </MidasBox>
          </Grid>
          <Grid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              lg: 'repeat(2, 1fr)',
            }}
            templateRows={{
              base: 'repeat(4, auto)',
              lg: 'repeat(2, auto)',
            }}
            w="100%"
            gap={4}
          >
            <MidasBox pb={3}>
              {data ? (
                <SupplyList
                  assets={data.assets}
                  comptrollerAddress={data.comptroller}
                  supplyBalanceFiat={data.totalSupplyBalanceFiat}
                  rewards={marketRewards}
                />
              ) : (
                <TableSkeleton tableHeading="Your Supply Balance" />
              )}
            </MidasBox>

            <MidasBox pb={3}>
              {data ? (
                <BorrowList
                  comptrollerAddress={data.comptroller}
                  assets={data.assets}
                  borrowBalanceFiat={data.totalBorrowBalanceFiat}
                />
              ) : (
                <TableSkeleton tableHeading="Your Borrow Balance" />
              )}
            </MidasBox>

            <PoolDetails data={data} />

            <AssetDetails data={data} />
          </Grid>
        </Flex>
      </PageTransitionLayout>
    </>
  );
});

export default FusePoolPage;
