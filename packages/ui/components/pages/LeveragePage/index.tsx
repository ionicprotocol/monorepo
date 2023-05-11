import { Box, Flex, Skeleton } from '@chakra-ui/react';
import type { SortingState, VisibilityState } from '@tanstack/react-table';
import Head from 'next/head';
import { memo, useEffect, useState } from 'react';

import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import LeverageHero from '@ui/components/pages/LeveragePage/LeverageHero/index';
import { LeverageList } from '@ui/components/pages/LeveragePage/LeverageList/index';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { MIDAS_LOCALSTORAGE_KEYS, VAULT, VAULT_COLUMNS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useLeveragePerChain } from '@ui/hooks/leverage/useLeveragePerChain';
import { useEnabledChains } from '@ui/hooks/useChainConfig';

const LeveragePage = memo(() => {
  const { address } = useMultiMidas();

  const [initSorting, setInitSorting] = useState<SortingState | undefined>();
  const [initColumnVisibility, setInitColumnVisibility] = useState<VisibilityState | undefined>();
  const enabledChains = useEnabledChains();
  const { isLoading, leveragePerChain } = useLeveragePerChain([...enabledChains]);

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
        <title key="title">Leverage</title>
      </Head>
      <PageTransitionLayout>
        <FusePageLayout>
          <LeverageHero />
          {leveragePerChain && initSorting && initColumnVisibility ? (
            <LeverageList
              initColumnVisibility={initColumnVisibility}
              initSorting={initSorting}
              isLoading={isLoading}
              vaultsPerChain={leveragePerChain}
            />
          ) : (
            <>
              <Box gap={4} p={4}>
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
        </FusePageLayout>
      </PageTransitionLayout>
    </>
  );
});

export default LeveragePage;
