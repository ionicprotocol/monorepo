import queryString from 'querystring';

import { SearchIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  Select,
  Text,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Dispatch, useEffect, useState } from 'react';
import { MdViewList, MdViewModule } from 'react-icons/md';

import { FilterButton, FilterIconButton } from '@ui/components/shared/Button';
import { useMidas } from '@ui/context/MidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';

const joinIfArray = (value: string | string[] | undefined, separator = ''): string => {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(separator);
  return value;
};

export const FuseDashNav = () => {
  const router = useRouter();

  const [searchText, setSearchText] = useState<string>(() => {
    return joinIfArray(router.query.filter);
  });

  const [sortBy, setSortBy] = useState<string>(() => {
    const { sortBy } = router.query;
    return sortBy ? (Array.isArray(sortBy) ? sortBy[0] : sortBy) : 'supply';
  });

  const [viewMode, setViewMode] = useState<string>('');
  const { setViewMode: _setViewMode, currentChain } = useMidas();
  const { cPage, cInput } = useColors();

  const debouncedSearchTerm = useDebounce(searchText, 400);
  const isMobile = useIsSmallScreen();

  useEffect(() => {
    const viewMode = localStorage.getItem('viewMode') || 'list';
    setViewMode(viewMode);
  }, []);

  useEffect(() => {
    if (viewMode) {
      localStorage.setItem('viewMode', viewMode);
      _setViewMode(viewMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  useEffect(() => {
    const searchValue = encodeURIComponent(debouncedSearchTerm);
    const sortValue = encodeURIComponent(sortBy);
    const urlSearchParams = new URLSearchParams(queryString.stringify(router.query));
    if (searchValue) {
      urlSearchParams.set('filter', searchValue);
    } else {
      urlSearchParams.delete('filter');
    }
    if (sortValue) {
      urlSearchParams.set('sortBy', sortValue);
    } else {
      urlSearchParams.delete('sortBy');
    }
    if (urlSearchParams.toString()) {
      router.push('?' + urlSearchParams.toString(), undefined, { shallow: true });
    } else {
      router.push(`/${currentChain.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, sortBy]);

  return (
    <>
      <Box
        color={cPage.primary.txtColor}
        overflowX="visible"
        overflowY="visible"
        w="100%"
        alignSelf="center"
        backgroundColor={cPage.primary.bgColor}
      >
        <Flex
          direction={isMobile ? 'column' : 'row'}
          justifyContent={isMobile ? 'center' : 'space-between'}
          alignItems={isMobile ? 'center' : 'space-between'}
          flexFlow={isMobile ? 'column wrap' : 'row wrap'}
          pt={2}
        >
          <PoolButtons
            searchText={Array.isArray(searchText) ? searchText[0] : searchText}
            viewMode={viewMode}
            setSearchText={setSearchText}
            setViewMode={setViewMode}
          />
          <Box display="flex" mt={2}>
            <InputGroup mr={3} width="auto" display={{ base: 'none', lg: 'flex' }}>
              <InputLeftElement>
                <Text>Sort By</Text>
              </InputLeftElement>
              <Select
                ml={'4.5rem'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                value={sortBy}
              >
                <option value="supply">Highest Supply</option>
                <option value="borrow">Highest Borrow</option>
              </Select>
            </InputGroup>

            <span style={{ display: 'inline-block' }}>
              <InputGroup maxWidth={'250px'} variant="outlineLeftAddon">
                <InputLeftAddon>
                  <SearchIcon color={cInput.txtColor} />
                </InputLeftAddon>
                <Input
                  type="text"
                  value={searchText ?? ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchText(event.target.value)
                  }
                  placeholder="ETH, DAI, FRAX, etc."
                />
              </InputGroup>
            </span>
          </Box>
        </Flex>
      </Box>
    </>
  );
};

const PoolButtons = ({
  searchText,
  viewMode,
  setSearchText,
  setViewMode,
}: {
  searchText: string;
  viewMode: string;
  setSearchText: Dispatch<string>;
  setViewMode: Dispatch<string>;
}) => {
  const isAllPoolSelected = searchText === '';
  const isCreatedPoolSelected = searchText === 'created-pools';
  const isVerifiedPoolSelected = searchText === 'verified-pools';
  const isUnverifiedPoolSelected = searchText === 'unverified-pools';
  const router = useRouter();
  const isMobile = useIsSmallScreen();
  const { setLoading, currentChain } = useMidas();

  return (
    <ButtonGroup spacing={0} flexFlow={'row wrap'} justifyContent="center">
      {!isMobile && (
        <>
          <ButtonGroup
            mr={4}
            isAttached
            spacing={0}
            flexFlow={'row wrap'}
            justifyContent="center"
            mt={2}
          >
            <FilterIconButton
              aria-label="List View"
              variant="filter"
              isSelected={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              icon={<Icon as={MdViewList} w={8} h={8} />}
            />
            <FilterIconButton
              aria-label="List View"
              variant="filter"
              isSelected={viewMode === 'card'}
              onClick={() => setViewMode('card')}
              icon={<Icon as={MdViewModule} w={8} h={8} />}
            />
          </ButtonGroup>
          <ButtonGroup
            isAttached
            spacing={0}
            flexFlow={'row wrap'}
            justifyContent="center"
            mx={4}
            mt={2}
          >
            <FilterButton
              isSelected={isAllPoolSelected}
              onClick={() => setSearchText('')}
              variant="filter"
            >
              All Pools
            </FilterButton>
            <FilterButton
              isSelected={isCreatedPoolSelected}
              onClick={() => setSearchText('created-pools')}
              variant="filter"
            >
              Created Pools
            </FilterButton>
            <FilterButton
              isSelected={isVerifiedPoolSelected}
              onClick={() => setSearchText('verified-pools')}
              variant="filter"
            >
              Verified Pools
            </FilterButton>
            <FilterButton
              isSelected={isUnverifiedPoolSelected}
              onClick={() => setSearchText('unverified-pools')}
              variant="filter"
            >
              Unverified Pools
            </FilterButton>
          </ButtonGroup>
        </>
      )}
      {isMobile && (
        <Grid
          templateColumns={{ base: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }}
          gap={2}
          mt={2}
          mr={2}
        >
          <FilterButton
            isSelected={isAllPoolSelected}
            onClick={() => setSearchText('')}
            variant="filter"
          >
            All Pools
          </FilterButton>
          <FilterButton
            isSelected={isCreatedPoolSelected}
            onClick={() => setSearchText('created-pools')}
            variant="filter"
          >
            Created Pools
          </FilterButton>
          <FilterButton
            isSelected={isVerifiedPoolSelected}
            onClick={() => setSearchText('verified-pools')}
            variant="filter"
          >
            Verified Pools
          </FilterButton>
          <FilterButton
            isSelected={isUnverifiedPoolSelected}
            onClick={() => setSearchText('unverified-pools')}
            variant="filter"
          >
            Unverified Pools
          </FilterButton>
        </Grid>
      )}
      <Button
        mt={2}
        onClick={() => {
          setLoading(true);
          router.push(`${currentChain.id}/create-pool`);
        }}
      >
        + Create Pool
      </Button>
    </ButtonGroup>
  );
};
