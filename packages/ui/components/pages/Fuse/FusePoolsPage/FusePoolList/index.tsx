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
import { FusePoolData } from '@midas-capital/types';
import { useEffect, useState } from 'react';

import PoolCard from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolCard';
import PoolRow from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow';
import { AlertHero } from '@ui/components/shared/Alert';
import { config } from '@ui/config/index';
import { POOLS_PER_PAGE } from '@ui/constants/index';
import { useMidas } from '@ui/context/MidasContext';
import { useFusePools } from '@ui/hooks/fuse/useFusePools';
import usePoolSorting from '@ui/hooks/fuse/usePoolSorting';
import { useColors } from '@ui/hooks/useColors';
import { useFilter } from '@ui/hooks/useFilter';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';
import { useSort } from '@ui/hooks/useSort';

export type Err = Error & { code?: string; reason?: string };

const FusePoolList = () => {
  const filter = useFilter();
  const sortBy = useSort();
  const isMobile = useIsSmallScreen();
  const { isLoading, filteredPools: filteredPoolsList, error } = useFusePools(filter);
  const [err, setErr] = useState<Err | undefined>(error as Err);
  const [poolsUserSupplied, setPoolsUserSupplied] = useState<FusePoolData[]>();
  const [poolsUserNotSupplied, setPoolsUserNotSupplied] = useState<FusePoolData[]>();
  const filteredPools = usePoolSorting(filteredPoolsList, sortBy);

  const { viewMode } = useMidas();
  const { cPage, cOutlineBtn } = useColors();

  const { pages, pagesCount, currentPage, setCurrentPage } = usePagination({
    total: poolsUserNotSupplied ? poolsUserNotSupplied.length : 0,
    limits: {
      outer: 1,
      inner: 1,
    },
    initialState: {
      pageSize: POOLS_PER_PAGE,
      currentPage: 1,
    },
  });

  const indexOfLastPool = currentPage * POOLS_PER_PAGE;
  const indexOfFirstPool = indexOfLastPool - POOLS_PER_PAGE;
  const currentPools = poolsUserNotSupplied?.slice(indexOfFirstPool, indexOfLastPool);

  const handlePageChange = (nextPage: number): void => {
    setCurrentPage(nextPage);
  };

  useEffect(() => {
    setErr(error as Err);
  }, [error]);

  useEffect(() => {
    const res = filteredPools.reduce<{
      poolsUserSupplied: FusePoolData[];
      poolsUserNotSupplied: FusePoolData[];
    }>(
      (r, pool) => {
        let totalSuppliedAmount = 0;

        pool.assets.map((asset) => {
          totalSuppliedAmount += asset.supplyBalanceNative;
        });

        r[totalSuppliedAmount !== 0 ? 'poolsUserSupplied' : 'poolsUserNotSupplied'].push(pool);

        return r;
      },
      {
        poolsUserSupplied: [],
        poolsUserNotSupplied: [],
      }
    );

    setPoolsUserSupplied(res.poolsUserSupplied);
    setPoolsUserNotSupplied(res.poolsUserNotSupplied);
  }, [filteredPools]);

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
          <>
            {poolsUserSupplied && poolsUserSupplied.length !== 0 && (
              <>
                <Grid
                  templateRows={{
                    base: 'repeat(1, minmax(0, 1fr))',
                    lg: 'repeat(1, minmax(0, 1fr))',
                  }}
                  autoFlow="row"
                  columns={{ base: 1, md: 2, lg: 2, xl: 3 }}
                  my={8}
                  w={'100%'}
                  mx="auto"
                  gridGap="8"
                  gridRowGap="8"
                >
                  {poolsUserSupplied.map((pool, index: number) => {
                    return <PoolCard data={pool} key={index} />;
                  })}
                </Grid>
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

            {currentPools && currentPools.length !== 0 && (
              <>
                <Grid
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
            )}
            {filteredPools.length === 0 && (
              <Text width="100%" textAlign="center" fontWeight="bold" fontSize={24} mt={12}>
                No pools found
              </Text>
            )}
          </>
        ) : (
          <Flex direction={{ base: 'column', sm: 'row', md: 'row' }} width="100%" mt={12} gap={4}>
            <Skeleton width={{ base: '100%', sm: '50%', md: '33%' }} height="400px" />
            <Skeleton width={{ base: '0px', sm: '50%', md: '33%' }} height="400px" />
            <Skeleton width={{ base: '0px', sm: '0px', md: '33%' }} height="400px" />
          </Flex>
        ))}
      {viewMode === 'list' && !isMobile && (
        <Grid mt={8} w={'100%'} mx="auto" gap={4}>
          {!isLoading ? (
            <>
              {filteredPools.length > 0 ? (
                <>
                  <HStack px={6} alignItems={'flex-end'}>
                    <VStack flex={5}>
                      <Text fontWeight="bold" textAlign="center">
                        Pool Name
                      </Text>
                    </VStack>
                    <VStack flex={3}></VStack>
                    {config.isRssScoreEnabled && (
                      <VStack flex={2}>
                        <Text fontWeight="bold" textAlign="center">
                          Risk Score
                        </Text>
                      </VStack>
                    )}
                    <VStack flex={config.isRssScoreEnabled ? 4 : 6} alignItems="flex-start">
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

                  {poolsUserSupplied && poolsUserSupplied.length !== 0 && (
                    <>
                      {poolsUserSupplied.map((pool: FusePoolData, index: number) => (
                        <PoolRow data={pool} key={index} />
                      ))}
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
                  {currentPools && currentPools.length !== 0 && (
                    <>
                      {currentPools.map((pool: FusePoolData, index: number) => (
                        <PoolRow data={pool} key={index} />
                      ))}
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
                                    page === currentPage
                                      ? cOutlineBtn.primary.selectedBgColor
                                      : undefined
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
                  )}
                </>
              ) : (
                <>
                  {filteredPools.length === 0 && (
                    <Text width="100%" textAlign="center" fontWeight="bold" fontSize={24} my={24}>
                      No pools found
                    </Text>
                  )}
                </>
              )}
            </>
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
