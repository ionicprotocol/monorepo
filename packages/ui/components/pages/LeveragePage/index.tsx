import { Box, Flex, Skeleton } from '@chakra-ui/react';
import type { SortingState, VisibilityState } from '@tanstack/react-table';
import Head from 'next/head';
import { memo, useEffect, useState } from 'react';

import FusePageLayout from '@ui/components/pages/Layout/FusePageLayout';
import LeverageHero from '@ui/components/pages/LeveragePage/LeverageHero/index';
import { LeverageList } from '@ui/components/pages/LeveragePage/LeverageList/index';
import PageTransitionLayout from '@ui/components/shared/PageTransitionLayout';
import { COLLATERAL_ASSET, LEVERAGE_COLUMNS, MIDAS_LOCALSTORAGE_KEYS } from '@ui/constants/index';
import { useLeveragesPerChain } from '@ui/hooks/leverage/useLeveragesPerChain';
import { useEnabledChains } from '@ui/hooks/useChainConfig';

const LeveragePage = memo(() => {
  const [initSorting, setInitSorting] = useState<SortingState | undefined>();
  const [initColumnVisibility, setInitColumnVisibility] = useState<VisibilityState | undefined>();
  const enabledChains = useEnabledChains();
  const { isLoading, leveragesPerChain } = useLeveragesPerChain([...enabledChains]);

  useEffect(() => {
    const oldData = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);

    if (
      oldData &&
      JSON.parse(oldData).leverageSorting &&
      LEVERAGE_COLUMNS.includes(JSON.parse(oldData).leverageSorting[0].id)
    ) {
      setInitSorting(JSON.parse(oldData).leverageSorting);
    } else {
      setInitSorting([{ desc: true, id: COLLATERAL_ASSET }]);
    }

    const columnVisibility: VisibilityState = {};

    if (
      oldData &&
      JSON.parse(oldData).leverageColumnVisibility &&
      JSON.parse(oldData).leverageColumnVisibility.length > 0
    ) {
      LEVERAGE_COLUMNS.map((columnId) => {
        if (JSON.parse(oldData).leverageColumnVisibility.includes(columnId)) {
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
          {leveragesPerChain && initSorting && initColumnVisibility ? (
            <LeverageList
              initColumnVisibility={initColumnVisibility}
              initSorting={initSorting}
              isLoading={isLoading}
              leveragesPerChain={leveragesPerChain}
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
