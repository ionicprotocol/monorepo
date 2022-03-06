import {
  Box,
  Divider,
  SimpleGrid as Grid,
  Skeleton,
  Stack,
  Text,
  TextProps,
} from '@chakra-ui/react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FuseDashNav } from '@components/pages/Fuse/FuseDashNav';
import FusePageLayout from '@components/pages/Fuse/FusePageLayout';
import PoolCard from '@components/pages/Fuse/FusePoolCard';
import PoolRow from '@components/pages/Fuse/FusePoolRow';
import FuseStatsBar from '@components/pages/Fuse/FuseStatsBar';
import PageTransitionLayout from '@components/shared/PageTransitionLayout';
import { useRari } from '@context/RariContext';
import { useFusePools } from '@hooks/fuse/useFusePools';
import { useColors } from '@hooks/useColors';
import { useFilter } from '@hooks/useFilter';
import { useIsSmallScreen } from '@hooks/useIsSmallScreen';
import { useSort } from '@hooks/useSort';
import { Column, Row } from '@utils/chakraUtils';

const FusePoolsPage = memo(() => {
  return (
    <PageTransitionLayout>
      <FusePageLayout>
        <FuseStatsBar />
        <Divider />
        <FuseDashNav />
        <PoolList />
      </FusePageLayout>
    </PageTransitionLayout>
  );
});

export default FusePoolsPage;

const usePoolSorting = (pools: any, sortBy: string | null): any => {
  return useMemo(() => {
    pools?.sort((a: any, b: any) => {
      if (!sortBy || sortBy.toLowerCase() === 'supply') {
        if (b.suppliedUSD > a.suppliedUSD) {
          return 1;
        }

        if (b.suppliedUSD < a.suppliedUSD) {
          return -1;
        }
      } else {
        if (b.borrowedUSD > a.borrowedUSD) {
          return 1;
        }

        if (b.borrowedUSD < a.borrowedUSD) {
          return -1;
        }
      }
      return b.id > a.id ? 1 : -1;
    });

    return pools.map((pool: any) => pool);
  }, [pools, sortBy]);
};

const PoolList = () => {
  const filter = useFilter();
  const sortBy = useSort();
  const isMobile = useIsSmallScreen();
  const { isLoading, filteredPools: filteredPoolsList } = useFusePools(filter);
  const filteredPools = usePoolSorting(filteredPoolsList, sortBy);
  const sortedBySupplyPools = usePoolSorting(filteredPoolsList, 'supply');
  const mostSuppliedPool = sortedBySupplyPools && sortedBySupplyPools[0];

  const [currentPage, setCurrentPage] = useState(1);
  const poolsPerPage = 6;
  const indexOfLastPool = currentPage * poolsPerPage;
  const indexOfFirstPool = indexOfLastPool - poolsPerPage;
  const currentPools = filteredPools?.slice(indexOfFirstPool, indexOfLastPool);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const { t } = useTranslation();
  const { viewMode } = useRari();
  const { dividerColor } = useColors();

  return isLoading ? (
    <>
      {viewMode === 'list' && !isMobile && (
        <Stack width="100%" mx="auto" mt={12}>
          <Skeleton height="80px" />
          <Skeleton height="80px" />
          <Skeleton height="80px" />
        </Stack>
      )}
      {(viewMode === 'card' || isMobile) && (
        <Stack direction={['column', 'row']} width="100%" mx="auto" mt={12} spacing={8}>
          <Skeleton width="50%" height="400px" />
          <Skeleton width="50%" height="400px" />
          {!isMobile && <Skeleton width="50%" height="400px" />}
        </Stack>
      )}
    </>
  ) : filteredPools.length ? (
    <>
      {currentPools.length ? (
        <>
          {(viewMode === 'card' || isMobile) && (
            <Grid
              templateRows={{
                base: 'repeat(1, minmax(0, 1fr))',
                lg: 'repeat(2, minmax(0, 1fr))',
              }}
              autoFlow="row"
              columns={{ base: 1, md: 2, lg: 2, xl: 3 }}
              my={8}
              w={'100%'}
              mx="auto"
              gridGap="8"
              gridRowGap="8"
            >
              {currentPools.map((pool: any) => {
                return <PoolCard data={pool} key={pool.id} />;
              })}
            </Grid>
          )}
          {viewMode === 'list' && !isMobile && (
            <Grid mt={8} w={'100%'} mx="auto" gap={4}>
              <Row crossAxisAlignment="center" mainAxisAlignment="flex-start">
                <Column mainAxisAlignment="center" crossAxisAlignment="center" width="30%">
                  <Text fontWeight="bold" textAlign="center">
                    {t('The Most Supplied Pool Name')}
                  </Text>
                </Column>
                <Column mainAxisAlignment="center" crossAxisAlignment="center" width="15%">
                  <Text fontWeight="bold" textAlign="center">
                    {t('Risk Score')}
                  </Text>
                </Column>
                <Column mainAxisAlignment="center" crossAxisAlignment="center" width="20%">
                  <Text fontWeight="bold" textAlign="center">
                    {t('Assets')}
                  </Text>
                </Column>
                <Column mainAxisAlignment="center" crossAxisAlignment="center" width="10%">
                  <Text fontWeight="bold" textAlign="center">
                    {t('Total Supplied')}
                  </Text>
                </Column>
                <Column mainAxisAlignment="center" crossAxisAlignment="center" width="13%">
                  <Text fontWeight="bold" textAlign="center">
                    {t('Total Borrowed')}
                  </Text>
                </Column>
                <Column mainAxisAlignment="center" crossAxisAlignment="center" width="10%"></Column>
              </Row>
              {mostSuppliedPool && (
                <>
                  <PoolRow data={mostSuppliedPool} isMostSupplied />
                  <Divider
                    width={'100%'}
                    height={4}
                    mb={4}
                    borderBottomWidth={2}
                    borderStyle="dashed"
                    opacity="1"
                    borderColor={dividerColor}
                  />
                </>
              )}
              {currentPools.map((pool: any) => {
                if (mostSuppliedPool.id !== pool.id) {
                  return <PoolRow data={pool} key={pool.id} />;
                }
              })}
            </Grid>
          )}
        </>
      ) : (
        <>
          {viewMode === 'list' && !isMobile && (
            <Stack width="100%" mx="auto" mt={12}>
              <Skeleton height="80px" />
              <Skeleton height="80px" />
              <Skeleton height="80px" />
            </Stack>
          )}
          {(viewMode === 'card' || isMobile) && (
            <Stack direction={['column', 'row']} width="100%" mx="auto" mt={12} spacing={8}>
              <Skeleton width="50%" height="400px" />
              <Skeleton width="50%" height="400px" />
              {!isMobile && <Skeleton width="50%" height="400px" />}
            </Stack>
          )}
        </>
      )}
      <Box w="100%" mx="auto" mb="10" mt={10} textAlign="center">
        <Pagination
          currentPage={currentPage}
          poolsPerPage={poolsPerPage}
          totalPools={filteredPools.length}
          paginate={paginate}
        />
      </Box>
    </>
  ) : (
    <Text width="100%" textAlign="center" fontWeight="bold" fontSize={24} my={24}>
      No pools found
    </Text>
  );
};

const Pagination = ({ totalPools, poolsPerPage, paginate, currentPage }: any) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalPools / poolsPerPage); i++) {
    pageNumbers.push(i);
  }

  const {
    outlineBtnBorderColor,
    outlineBtnTextColor,
    outlineBtnActiveBgColor,
    outlineBtnActiveTextColor,
    outlineBtnActiveBorderColor,
  } = useColors();

  const selectedProps: TextProps = {
    bg: outlineBtnActiveBgColor,
    color: outlineBtnActiveTextColor,
    borderColor: outlineBtnActiveBorderColor,
  };
  const unSelectedProps: TextProps = {
    _hover: {
      bg: outlineBtnActiveBgColor,
      color: outlineBtnActiveTextColor,
      borderColor: outlineBtnActiveBorderColor,
    },
    color: outlineBtnTextColor,
  };

  return (
    <Box py="4" width="100%">
      {pageNumbers.map((num: any) => (
        <Text
          fontSize="lg"
          display="inline"
          px="4"
          py="2"
          borderRadius="5px"
          onClick={() => paginate(num)}
          cursor="pointer"
          shadow="lg"
          mx="2"
          fontWeight={'bold'}
          borderColor={outlineBtnBorderColor}
          borderWidth={2}
          key={num}
          {...(currentPage === num ? selectedProps : unSelectedProps)}
        >
          {num}
        </Text>
      ))}
    </Box>
  );
};
