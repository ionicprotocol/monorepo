import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, Flex, Grid, HStack, Skeleton, Text } from '@chakra-ui/react';
import { SortingState, VisibilityState } from '@tanstack/react-table';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';

import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import { UserStat } from '@ui/components/pages/PoolPage/UserStats/UserStat';
import { VaultsList } from '@ui/components/pages/VaultsPage/VaultsList/index';
import { Banner } from '@ui/components/shared/Banner';
import { MidasBox } from '@ui/components/shared/Box';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import {
  LIQUIDITY,
  MARKET_COLUMNS,
  MARKET_LTV,
  MIDAS_LOCALSTORAGE_KEYS,
  TOTAL_BORROW,
  TOTAL_SUPPLY,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useAllFundedInfo } from '@ui/hooks/useAllFundedInfo';

const VaultsPage = memo(() => {
  const { setGlobalLoading, address } = useMultiMidas();
  const router = useRouter();
  const [initSorting, setInitSorting] = useState<SortingState | undefined>();
  const [initColumnVisibility, setInitColumnVisibility] = useState<VisibilityState | undefined>();
  const { data: info } = useAllFundedInfo();

  useEffect(() => {
    const oldData = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);

    if (
      oldData &&
      JSON.parse(oldData).userMarketSorting &&
      MARKET_COLUMNS.includes(JSON.parse(oldData).userMarketSorting[0].id)
    ) {
      setInitSorting(JSON.parse(oldData).userMarketSorting);
    } else {
      setInitSorting([{ id: MARKET_LTV, desc: true }]);
    }

    const columnVisibility: VisibilityState = {};

    if (
      oldData &&
      JSON.parse(oldData).userMarketColumnVisibility &&
      JSON.parse(oldData).userMarketColumnVisibility.length > 0
    ) {
      MARKET_COLUMNS.map((columnId) => {
        if (JSON.parse(oldData).userMarketColumnVisibility.includes(columnId)) {
          columnVisibility[columnId] = true;
        } else {
          columnVisibility[columnId] = false;
        }
      });
    } else {
      MARKET_COLUMNS.map((columnId) => {
        if (columnId === TOTAL_SUPPLY || columnId === TOTAL_BORROW || columnId === LIQUIDITY) {
          columnVisibility[columnId] = false;
        } else {
          columnVisibility[columnId] = true;
        }
      });
    }

    setInitColumnVisibility(columnVisibility);
  }, []);

  return (
    <>
      <Head>
        <title key="title">Vaults</title>
      </Head>

      <PageTransitionLayout>
        <FusePageLayout>
          {address ? (
            <>
              <HStack mb={4} mx="auto" spacing={4} width={'100%'}>
                <ArrowBackIcon
                  cursor="pointer"
                  fontSize="2xl"
                  fontWeight="extrabold"
                  onClick={() => {
                    setGlobalLoading(true);
                    router.push('/');
                  }}
                />
                <Text fontWeight="bold" size="xl" textAlign="left">
                  Vaults
                </Text>
              </HStack>

              <MidasBox mb="4" overflowX="auto" width="100%">
                {info && initSorting && initColumnVisibility ? (
                  <VaultsList
                    info={info}
                    initColumnVisibility={initColumnVisibility}
                    initSorting={initSorting}
                  />
                ) : (
                  <>
                    <Box gap={4} p={4}>
                      {address ? (
                        <>
                          <Grid
                            gap={4}
                            mb={4}
                            templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }}
                            w="100%"
                          >
                            <UserStat label="Your Supply" />
                            <UserStat label="Effective Supply APY" />
                          </Grid>
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
              </MidasBox>
            </>
          ) : (
            <Banner
              alertDescriptionProps={{ fontSize: 'lg' }}
              alertIconProps={{ boxSize: 12 }}
              alertProps={{
                status: 'warning',
                flexDirection: 'column',
                height: '2xs',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 4,
              }}
              descriptions={[
                {
                  text: `Please connect your wallet.`,
                },
              ]}
              title="Wallet not detected!"
            />
          )}
        </FusePageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default VaultsPage;
