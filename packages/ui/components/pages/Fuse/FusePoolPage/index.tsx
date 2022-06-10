import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  AvatarGroup,
  Box,
  Divider,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo } from 'react';

import FuseNavbar from '@ui/components/pages/Fuse/FuseNavbar';
import { BorrowList } from '@ui/components/pages/Fuse/FusePoolPage/BorrowList';
import { CollateralRatioBar } from '@ui/components/pages/Fuse/FusePoolPage/CollateralRatioBar';
import { PoolDashboardBox } from '@ui/components/pages/Fuse/FusePoolPage/PoolDashboardBox';
import { PoolInfoBox } from '@ui/components/pages/Fuse/FusePoolPage/PoolInfoBox';
import { PoolStat } from '@ui/components/pages/Fuse/FusePoolPage/PoolStat';
import { RewardsBanner } from '@ui/components/pages/Fuse/FusePoolPage/RewardsBanner';
import { SupplyList } from '@ui/components/pages/Fuse/FusePoolPage/SupplyList';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { useRari } from '@ui/context/RariContext';
import { useFlywheelRewardsForPool } from '@ui/hooks/rewards/useFlywheelRewardsForPool';
import { useRewardTokensOfPool } from '@ui/hooks/rewards/useRewardTokensOfPool';
import { useColors } from '@ui/hooks/useColors';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useIsSemiSmallScreen } from '@ui/hooks/useIsSemiSmallScreen';
import { midUsdFormatter } from '@ui/utils/bigUtils';
import { Column, RowOrColumn } from '@ui/utils/chakraUtils';

const FusePoolPage = memo(() => {
  const { setLoading } = useRari();
  const isMobile = useIsSemiSmallScreen();
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

          <Box as="section" bg={cPage.primary.bgColor} py="4" width={'100%'} alignSelf={'center'}>
            <Box mx="auto">
              <Heading marginBottom={'4'} fontWeight="semibold" fontSize={'2xl'}>
                Pool Statistics
              </Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing="4">
                <PoolStat
                  label="Total Supply"
                  value={data ? midUsdFormatter(data.totalSuppliedNative) : undefined}
                />
                <PoolStat
                  label="Total Borrow"
                  value={data ? midUsdFormatter(data?.totalBorrowedNative) : undefined}
                />
                <PoolStat
                  label="Liquidity"
                  value={data ? midUsdFormatter(data?.totalLiquidityNative) : undefined}
                />
                <PoolStat
                  label="Utilization"
                  value={
                    data
                      ? data.totalSuppliedNative.toString() === '0'
                        ? '0%'
                        : ((data?.totalBorrowedNative / data?.totalSuppliedNative) * 100).toFixed(
                            2
                          ) + '%'
                      : undefined
                  }
                />
              </SimpleGrid>
            </Box>
          </Box>
          {
            /* If they have some asset enabled as collateral, show the collateral ratio bar */
            data && data.assets.some((asset) => asset.membership) ? (
              <CollateralRatioBar assets={data.assets} borrowUSD={data.totalBorrowBalanceNative} />
            ) : null
          }
          <RowOrColumn
            width={'100%'}
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            bgColor={cPage.primary.bgColor}
            color={cPage.primary.txtColor}
            mx="auto"
            mt={4}
            pb={4}
            isRow={!isMobile}
            alignItems="stretch"
          >
            <PoolDashboardBox pb={2} width={isMobile ? '100%' : '50%'} borderRadius={12}>
              {data ? (
                <SupplyList
                  assets={data.assets}
                  comptrollerAddress={data.comptroller}
                  supplyBalanceNative={data.totalSupplyBalanceNative}
                  rewards={marketRewards}
                />
              ) : (
                <TableSkeleton tableHeading="Your Supply Balance" />
              )}
            </PoolDashboardBox>

            <PoolDashboardBox
              ml={isMobile ? 0 : 4}
              mt={isMobile ? 4 : 0}
              pb={2}
              borderRadius={12}
              width={isMobile ? '100%' : '50%'}
            >
              {data ? (
                <BorrowList
                  comptrollerAddress={data.comptroller}
                  assets={data.assets}
                  borrowBalanceNative={data.totalBorrowBalanceNative}
                />
              ) : (
                <TableSkeleton tableHeading="Your Borrow Balance" />
              )}
            </PoolDashboardBox>
          </RowOrColumn>

          <PoolInfoBox data={data} />
          <Box h={'20'} />
        </Flex>
      </PageTransitionLayout>
    </>
  );
});

export default FusePoolPage;

const TableSkeleton = ({ tableHeading }: { tableHeading: string }) => (
  <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" height="100%" pb={1}>
    <Heading size="md" px={4} py={3}>
      {tableHeading}: <Skeleton display="inline">Loading</Skeleton>
    </Heading>

    <Divider color="#F4F6F9" />

    <Skeleton w="100%" h="40" />
  </Column>
);
