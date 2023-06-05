import { Box, Flex, Grid, GridItem, HStack, Input, Skeleton, Text } from '@chakra-ui/react';
import type { SupportedChains } from '@midas-capital/types';
import type { SortingState, VisibilityState } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';

import { ChainFilterButtons } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/ChainFilterButtons';
import { ChainFilterDropdown } from '@ui/components/pages/Fuse/FusePoolsPage/FusePoolList/FusePoolRow/ChainFilterDropdown';
import { CreatedPositionComp } from '@ui/components/pages/LeveragePage/LeverageList/CreatedPosition/index';
import { PositionCreationComp } from '@ui/components/pages/LeveragePage/LeverageList/PositionCreation/index';
import {
  ALL,
  COLLATERAL_ASSET,
  CREATED_POSITIONS_COLUMNS,
  MIDAS_LOCALSTORAGE_KEYS,
  POSITION_CREATION_COLUMNS,
  SEARCH,
} from '@ui/constants/index';
import { useLeveragesPerChain } from '@ui/hooks/leverage/useLeveragesPerChain';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useIsMobile } from '@ui/hooks/useScreenSize';

export const LeverageList = () => {
  const [initSortingPositionCreation, setInitSortingPositionCreation] = useState<
    SortingState | undefined
  >();
  const [initColumnVisibilityPositionCreation, setInitColumnVisibilityPositionCreation] = useState<
    VisibilityState | undefined
  >();

  const [initSortingCreatedPosition, setInitSortingCreatedPosition] = useState<
    SortingState | undefined
  >();
  const [initColumnVisibilityCreatedPosition, setInitColumnVisibilityCreatedPosition] = useState<
    VisibilityState | undefined
  >();

  const enabledChains = useEnabledChains();
  const { isLoading, leveragesPerChain } = useLeveragesPerChain([...enabledChains]);

  const loadingStatusPerChain = useMemo(() => {
    const _loadingStatusPerChain: { [chainId: string]: boolean } = {};

    Object.entries(leveragesPerChain).map(([chainId, leverage]) => {
      _loadingStatusPerChain[chainId] = leverage.isLoading;
    });

    return _loadingStatusPerChain;
  }, [leveragesPerChain]);

  const [globalFilter, setGlobalFilter] = useState<(SupportedChains | string)[]>([ALL]);
  const [searchText, setSearchText] = useState('');

  const onFilter = (filter: SupportedChains | string) => {
    let _globalFilter: (SupportedChains | string)[] = [];

    if (globalFilter.includes(filter)) {
      if (filter === ALL) {
        _globalFilter = [enabledChains[0]];
      } else {
        _globalFilter = globalFilter.filter((f) => f !== filter);

        if (_globalFilter.length === 0) {
          _globalFilter = [ALL];
        }
      }
    } else {
      if (globalFilter.includes(ALL)) {
        _globalFilter = [filter];
      } else if (
        filter === ALL ||
        enabledChains.length === globalFilter.filter((f) => f !== ALL && f != SEARCH).length + 1
      ) {
        _globalFilter = [ALL];
      } else {
        _globalFilter = [...globalFilter, filter];
      }
    }

    if (globalFilter.includes(SEARCH)) {
      setGlobalFilter([..._globalFilter, SEARCH]);
    } else {
      setGlobalFilter([..._globalFilter]);
    }
  };

  const onSearchFiltered = () => {
    if (searchText) {
      setGlobalFilter([...globalFilter, SEARCH]);
    } else {
      setGlobalFilter(globalFilter.filter((f) => f !== SEARCH));
    }
  };

  useEffect(() => {
    const oldData = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);

    // for Position Creation Panel
    if (
      oldData &&
      JSON.parse(oldData).positionCreationSorting &&
      POSITION_CREATION_COLUMNS.includes(JSON.parse(oldData).positionCreationSorting[0].id)
    ) {
      setInitSortingPositionCreation(JSON.parse(oldData).positionCreationSorting);
    } else {
      setInitSortingPositionCreation([{ desc: true, id: COLLATERAL_ASSET }]);
    }

    const columnVisibilityPositionCreation: VisibilityState = {};

    if (
      oldData &&
      JSON.parse(oldData).positionCreationColumnVisibility &&
      JSON.parse(oldData).positionCreationColumnVisibility.length > 0
    ) {
      POSITION_CREATION_COLUMNS.map((columnId) => {
        if (JSON.parse(oldData).positionCreationColumnVisibility.includes(columnId)) {
          columnVisibilityPositionCreation[columnId] = true;
        } else {
          columnVisibilityPositionCreation[columnId] = false;
        }
      });
    }

    setInitColumnVisibilityPositionCreation(columnVisibilityPositionCreation);

    // for Created Position Panel

    if (
      oldData &&
      JSON.parse(oldData).createdPositionSorting &&
      CREATED_POSITIONS_COLUMNS.includes(JSON.parse(oldData).createdPositionSorting[0].id)
    ) {
      setInitSortingCreatedPosition(JSON.parse(oldData).createdPositionSorting);
    } else {
      setInitSortingCreatedPosition([{ desc: true, id: COLLATERAL_ASSET }]);
    }

    const columnVisibilityCreatedPosition: VisibilityState = {};

    if (
      oldData &&
      JSON.parse(oldData).createdPositionColumnVisibility &&
      JSON.parse(oldData).createdPositionColumnVisibility.length > 0
    ) {
      CREATED_POSITIONS_COLUMNS.map((columnId) => {
        if (JSON.parse(oldData).createdPositionColumnVisibility.includes(columnId)) {
          columnVisibilityCreatedPosition[columnId] = true;
        } else {
          columnVisibilityCreatedPosition[columnId] = false;
        }
      });
    }

    setInitColumnVisibilityCreatedPosition(columnVisibilityCreatedPosition);
  }, []);

  useEffect(() => {
    onSearchFiltered();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return (
    <Box>
      <Flex
        alignItems={'center'}
        flexDirection={'row'}
        flexWrap="wrap-reverse"
        gap={4}
        justifyContent={['center', 'center', 'space-between']}
      >
        <Flex
          alignItems="center"
          flexWrap="wrap-reverse"
          gap={3}
          justifyContent={['center', 'center', 'space-between']}
          mb={3}
          width="100%"
        >
          <ChainFilterButtons
            globalFilter={globalFilter}
            isLoading={isLoading}
            loadingStatusPerChain={loadingStatusPerChain}
            onFilter={onFilter}
            props={{ display: { base: 'none', lg: 'inline-flex' } }}
          />
          <ChainFilterDropdown
            globalFilter={globalFilter}
            isLoading={isLoading}
            loadingStatusPerChain={loadingStatusPerChain}
            onFilter={onFilter}
            props={{ display: { base: 'inline-flex', lg: 'none' } }}
          />

          <Flex alignItems="flex-end" className="searchAsset" gap={2} justifyContent="center">
            <ControlledSearchInput onUpdate={(searchText) => setSearchText(searchText)} />
          </Flex>
        </Flex>
      </Flex>
      <Flex justifyContent="center" pb={6} width="100%">
        <Grid
          gap={4}
          templateColumns={{
            base: 'repeat(1, 1fr)',
            lg: 'repeat(2, 1fr)',
          }}
          width="100%"
        >
          <GridItem colSpan={1}>
            {leveragesPerChain &&
            initSortingPositionCreation &&
            initColumnVisibilityPositionCreation ? (
              <PositionCreationComp
                initColumnVisibility={initColumnVisibilityPositionCreation}
                initGlobalFilter={globalFilter}
                initSearchText={searchText}
                initSorting={initSortingPositionCreation}
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
          </GridItem>
          <GridItem colSpan={1}>
            {leveragesPerChain &&
            initSortingCreatedPosition &&
            initColumnVisibilityCreatedPosition ? (
              <CreatedPositionComp
                initColumnVisibility={initColumnVisibilityCreatedPosition}
                initGlobalFilter={globalFilter}
                initSearchText={searchText}
                initSorting={initSortingCreatedPosition}
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
          </GridItem>
        </Grid>
      </Flex>
    </Box>
  );
};

const ControlledSearchInput = ({ onUpdate }: { onUpdate: (value: string) => void }) => {
  const [searchText, setSearchText] = useState('');
  const isMobile = useIsMobile();
  const debouncedText = useDebounce(searchText, 400);

  useEffect(() => {
    onUpdate(debouncedText);
  }, [debouncedText, onUpdate]);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <HStack width="100%">
      {!isMobile && <Text>Search</Text>}
      <Input
        _focusVisible={{}}
        maxWidth={{ base: '100%', lg: 60, md: 60, sm: 290 }}
        onChange={onSearch}
        placeholder="Token, Name"
        type="text"
        value={searchText}
      />
    </HStack>
  );
};
