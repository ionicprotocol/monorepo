import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, Flex, Grid, HStack, Skeleton, Text } from '@chakra-ui/react';
import type { SortingState, VisibilityState } from '@tanstack/react-table';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';

import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import { UserStat } from '@ui/components/pages/PoolPage/UserStats/UserStat';
import { VaultsList } from '@ui/components/pages/VaultsPage/VaultsList/index';
import { Banner } from '@ui/components/shared/Banner';
import { MidasBox } from '@ui/components/shared/Box';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { MIDAS_LOCALSTORAGE_KEYS, VAULT, VAULT_COLUMNS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useVaultsPerChain } from '@ui/hooks/useVaultsPerChain';

const VaultsPage = memo(() => {
  const { setGlobalLoading, address } = useMultiMidas();
  const router = useRouter();
  const [initSorting, setInitSorting] = useState<SortingState | undefined>();
  const [initColumnVisibility, setInitColumnVisibility] = useState<VisibilityState | undefined>();
  const enabledChains = useEnabledChains();
  const { isLoading, vaultsPerChain, error } = useVaultsPerChain([...enabledChains]);

  useEffect(() => {
    const oldData = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);

    if (
      oldData &&
      JSON.parse(oldData).vaultSorting &&
      VAULT_COLUMNS.includes(JSON.parse(oldData).vaultSorting[0].id)
    ) {
      setInitSorting(JSON.parse(oldData).vaultSorting);
    } else {
      setInitSorting([{ desc: true, id: VAULT }]);
    }

    const columnVisibility: VisibilityState = {};

    if (
      oldData &&
      JSON.parse(oldData).vaultColumnVisibility &&
      JSON.parse(oldData).vaultColumnVisibility.length > 0
    ) {
      VAULT_COLUMNS.map((columnId) => {
        if (JSON.parse(oldData).vaultColumnVisibility.includes(columnId)) {
          columnVisibility[columnId] = true;
        } else {
          columnVisibility[columnId] = false;
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
          {error && error.code !== 'NETWORK_ERROR' ? (
            <Banner
              alertDescriptionProps={{ fontSize: 'lg' }}
              alertIconProps={{ boxSize: 12 }}
              alertProps={{
                alignItems: 'center',
                flexDirection: 'column',
                gap: 4,
                height: '2xs',
                justifyContent: 'center',
                status: 'warning',
                textAlign: 'center',
              }}
              descriptions={[
                {
                  text: `Unable to retrieve Pools. Please try again later.`,
                },
              ]}
              title={error.reason ? error.reason : 'Unexpected Error'}
            />
          ) : (
            <>
              <MidasBox mb="4" overflowX="auto" width="100%">
                {vaultsPerChain && initSorting && initColumnVisibility ? (
                  <VaultsList
                    initColumnVisibility={initColumnVisibility}
                    initSorting={initSorting}
                    isLoading={isLoading}
                    vaultsPerChain={vaultsPerChain}
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
          )}
        </FusePageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default VaultsPage;
