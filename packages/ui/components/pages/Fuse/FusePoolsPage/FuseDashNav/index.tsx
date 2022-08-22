import queryString from 'querystring';

import { SearchIcon } from '@chakra-ui/icons';
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  Select,
  Text,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { PoolButtons } from '@ui/components/pages/Fuse/FusePoolsPage/FuseDashNav/PoolButtons';
import { useMidas } from '@ui/context/MidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useIsSmallScreen } from '@ui/hooks/useScreenSize';
import { joinIfArray } from '@ui/utils/joinIfArray';

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
