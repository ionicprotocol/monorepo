import {
  Box,
  Divider,
  SimpleGrid as Grid,
  Skeleton,
  Stack,
  Text,
  TextProps,
} from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/sdk/dist/cjs/src/Fuse/types';
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

const usePoolSorting = (pools: FusePoolData[], sortBy: string | null): FusePoolData[] => {
  return useMemo(() => {
    pools?.sort((a: FusePoolData, b: FusePoolData) => {
      if (!sortBy || sortBy.toLowerCase() === 'supply') {
        if (b.totalSuppliedUSD > a.totalSuppliedUSD) {
          return 1;
        }

        if (b.totalSuppliedUSD < a.totalSuppliedUSD) {
          return -1;
        }
      } else {
        if (b.totalBorrowedUSD > a.totalBorrowedUSD) {
          return 1;
        }

        if (b.totalBorrowedUSD < a.totalBorrowedUSD) {
          return -1;
        }
      }
      return b.id > a.id ? 1 : -1;
    });

    return pools.map((pool: FusePoolData) => pool);
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
  const { cPage } = useColors();

  return (
    <>
      {(viewMode === 'card' || isMobile) &&
        (!isLoading ? (
          currentPools.length ? (
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
              {currentPools.map((pool: FusePoolData, index: number) => {
                return <PoolCard data={pool} key={index} />;
              })}
            </Grid>
          ) : (
            <Text width="100%" textAlign="center" fontWeight="bold" fontSize={24} mt={12}>
              No pools found
            </Text>
          )
        ) : (
          <Stack direction={['column', 'row']} width="100%" mx="auto" mt={12} spacing={8}>
            <Skeleton width="50%" height="400px" />
            <Skeleton width="50%" height="400px" />
            {!isMobile && <Skeleton width="50%" height="400px" />}
          </Stack>
        ))}
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
          {!isLoading ? (
            currentPools.length ? (
              <>
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
                      borderColor={cPage.primary.borderColor}
                    />
                  </>
                )}
                {currentPools.map((pool: FusePoolData, index: number) => {
                  if (mostSuppliedPool.id !== pool.id) {
                    return <PoolRow data={pool} key={index} />;
                  }
                })}
              </>
            ) : (
              <Text width="100%" textAlign="center" fontWeight="bold" fontSize={24} my={24}>
                No pools found
              </Text>
            )
          ) : (
            <Stack width="100%" mx="auto" mt={2}>
              <Skeleton height="80px" borderRadius={12} />
              <Skeleton height="80px" borderRadius={12} />
              <Skeleton height="80px" borderRadius={12} />
            </Stack>
          )}
        </Grid>
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
  );
};

const Pagination = ({
  totalPools,
  poolsPerPage,
  paginate,
  currentPage,
}: {
  totalPools: number;
  poolsPerPage: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalPools / poolsPerPage); i++) {
    pageNumbers.push(i);
  }

  const { cOutlineBtn } = useColors();

  const selectedProps: TextProps = {
    bg: cOutlineBtn.primary.selectedBgColor,
    color: cOutlineBtn.primary.selectedTxtColor,
    borderColor: cOutlineBtn.primary.borderColor,
  };
  const unSelectedProps: TextProps = {
    _hover: {
      bg: cOutlineBtn.primary.hoverBgColor,
      color: cOutlineBtn.primary.hoverTxtColor,
      borderColor: cOutlineBtn.primary.borderColor,
    },
    color: cOutlineBtn.primary.txtColor,
  };

  return (
    <Box py="4" width="100%">
      {pageNumbers.map((num: number, index: number) => (
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
          borderColor={cOutlineBtn.primary.borderColor}
          borderWidth={2}
          key={index}
          {...(currentPage === num ? selectedProps : unSelectedProps)}
        >
          {num}
        </Text>
      ))}
    </Box>
  );
};
