import { ArrowBackIcon } from '@chakra-ui/icons';
import { AvatarGroup, HStack, Skeleton, Text } from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo } from 'react';

import { CollateralRatioBar } from '@ui/components/pages/Fuse/FusePoolPage/CollateralRatioBar';
import { MarketsList } from '@ui/components/pages/Fuse/FusePoolPage/MarketsList';
import PoolDetails from '@ui/components/pages/Fuse/FusePoolPage/PoolDetails';
import { PoolStats } from '@ui/components/pages/Fuse/FusePoolPage/PoolStats';
import { RewardsBanner } from '@ui/components/pages/Fuse/FusePoolPage/RewardsBanner';
import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import { MidasBox } from '@ui/components/shared/Box';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { TableSkeleton } from '@ui/components/shared/TableSkeleton';
import { useMidas } from '@ui/context/MidasContext';
import { useFlywheelRewardsForPool } from '@ui/hooks/rewards/useFlywheelRewardsForPool';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';

const FusePoolPage = memo(() => {
  const { setLoading } = useMidas();

  const router = useRouter();
  const poolId = router.query.poolId as string;
  const { data } = useFusePoolData(poolId);
  const { data: marketRewards } = useFlywheelRewardsForPool(data?.comptroller);
  const rewardTokens = useRewardTokensOfPool(data?.comptroller);

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
                setLoading(true);
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

          <MidasBox overflowX="auto" width="100%" mb="4">
            {data ? (
              <MarketsList
                assets={data.assets}
                rewards={marketRewards}
                comptrollerAddress={data.comptroller}
                supplyBalanceFiat={data.totalSupplyBalanceFiat}
                borrowBalanceFiat={data.totalBorrowBalanceFiat}
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
