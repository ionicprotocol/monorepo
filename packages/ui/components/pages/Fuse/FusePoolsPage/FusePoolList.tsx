import {
  Pagination,
  PaginationContainer,
  PaginationNext,
  PaginationPage,
  PaginationPageGroup,
  PaginationPrevious,
  PaginationSeparator,
  usePagination,
} from '@ajna/pagination';
import {
  Divider,
  Flex,
  SimpleGrid as Grid,
  HStack,
  Skeleton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/sdk';
import { useEffect, useState } from 'react';

import PoolCard from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolCard';
import PoolRow from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolRow';
import { AlertHero } from '@ui/components/shared/AlertHero';
import { useRari } from '@ui/context/RariContext';
import { useFusePools } from '@ui/hooks/fuse/useFusePools';
import usePoolSorting from '@ui/hooks/fuse/usePoolSorting';
import { useColors } from '@ui/hooks/useColors';
import { useFilter } from '@ui/hooks/useFilter';
import { useIsSmallScreen } from '@ui/hooks/useIsSmallScreen';
import { useSort } from '@ui/hooks/useSort';

export type Err = Error & { code?: string; reason?: string };

const FusePoolList = () => {
  const filter = useFilter();
  const sortBy = useSort();
  const isMobile = useIsSmallScreen();
  const { isLoading, filteredPools: filteredPoolsList, error } = useFusePools(filter);
  const [err, setErr] = useState<Err | undefined>(error as Err);
  const filteredPools = usePoolSorting(filteredPoolsList, sortBy);
  const sortedBySupplyPools = usePoolSorting(filteredPoolsList, 'supply');
  const mostSuppliedPool = sortedBySupplyPools && sortedBySupplyPools[0];

  const { viewMode } = useRari();
  const { cPage, cOutlineBtn } = useColors();
  const poolsPerPage = 5;
  const outerLimit = 1;
  const innerLimit = 1;
  const { pages, pagesCount, currentPage, setCurrentPage } = usePagination({
    total: filteredPools.length,
    limits: {
      outer: outerLimit,
      inner: innerLimit,
    },
    initialState: {
      pageSize: poolsPerPage,
      currentPage: 1,
    },
  });

  const indexOfLastPool = currentPage * poolsPerPage;
  const indexOfFirstPool = indexOfLastPool - poolsPerPage;
  const currentPools = filteredPools?.slice(indexOfFirstPool, indexOfLastPool);

  const handlePageChange = (nextPage: number): void => {
    setCurrentPage(nextPage);
  };

  useEffect(() => {
    setErr(error as Err);
  }, [error]);

  if (err && err.code !== 'NETWORK_ERROR') {
    return (
      <AlertHero
        status="warning"
        variant="subtle"
        title={err.reason ? err.reason : 'Unexpected Error'}
        description="Unable to retrieve Pools. Please try again later."
      />
    );
  }

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
              {currentPools.map((pool, index: number) => {
                return <PoolCard data={pool} key={index} />;
              })}
            </Grid>
          ) : (
            <Text width="100%" textAlign="center" fontWeight="bold" fontSize={24} mt={12}>
              No pools found
            </Text>
          )
        ) : (
          <Flex direction={{ base: 'column', sm: 'row', md: 'row' }} width="100%" mt={12} gap={4}>
            <Skeleton width={{ base: '100%', sm: '50%', md: '33%' }} height="400px" />
            <Skeleton width={{ base: '0px', sm: '50%', md: '33%' }} height="400px" />
            <Skeleton width={{ base: '0px', sm: '0px', md: '33%' }} height="400px" />
          </Flex>
        ))}
      {viewMode === 'list' && !isMobile && (
        <Grid mt={8} w={'100%'} mx="auto" gap={4}>
          <HStack px={6} alignItems={'flex-end'}>
            <VStack flex={6}>
              <Text fontWeight="bold" textAlign="center">
                Pool Name
              </Text>
            </VStack>
            <VStack flex={2}>
              <Text fontWeight="bold" textAlign="center">
                Risk Score
              </Text>
            </VStack>
            <VStack flex={4} alignItems="flex-start">
              <Text fontWeight="bold" textAlign="center">
                Assets
              </Text>
            </VStack>
            <VStack flex={2}>
              <Text fontWeight="bold" textAlign="center">
                Total Supplied
              </Text>
            </VStack>
            <VStack flex={2}>
              <Text fontWeight="bold" textAlign="center">
                Total Borrowed
              </Text>
            </VStack>
            <VStack flex={1}></VStack>
          </HStack>
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
                <Stack my={12} width="100%">
                  <Pagination
                    pagesCount={pagesCount}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  >
                    <PaginationContainer align="center" justify="center" w="full">
                      <PaginationPrevious mr={4} fontSize="lg" height={10}>
                        <Text>Previous</Text>
                      </PaginationPrevious>
                      <PaginationPageGroup
                        isInline
                        align="center"
                        separator={
                          <PaginationSeparator
                            variant="outline"
                            bg={cOutlineBtn.primary.bgColor}
                            jumpSize={3}
                            fontSize="lg"
                            width={10}
                            height={10}
                          />
                        }
                      >
                        {pages.map((page: number) => (
                          <PaginationPage
                            variant="outline"
                            bg={
                              page === currentPage ? cOutlineBtn.primary.selectedBgColor : undefined
                            }
                            color={
                              page === currentPage
                                ? cOutlineBtn.primary.selectedTxtColor
                                : undefined
                            }
                            key={`pagination_page_${page}`}
                            page={page}
                            fontSize="lg"
                            width={10}
                            pt={4}
                          />
                        ))}
                      </PaginationPageGroup>
                      <PaginationNext ml={4} fontSize="lg" height={10}>
                        <Text>Next</Text>
                      </PaginationNext>
                    </PaginationContainer>
                  </Pagination>
                </Stack>
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
    </>
  );
};

export default FusePoolList;
