import queryString from 'querystring';

import { SearchIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Icon,
  IconButton,
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

import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';
import { useDebounce } from '@hooks/useDebounce';
import { useIsSmallScreen } from '@hooks/useIsSmallScreen';

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
  const { setViewMode: _setViewMode } = useRari();
  const { bgColor, textColor, borderColor, selectBgColor, selectTextColor } = useColors();

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
      router.push('');
    }
  }, [debouncedSearchTerm, sortBy]);

  return (
    <>
      <Box
        color={textColor}
        overflowX="visible"
        overflowY="visible"
        w="100%"
        alignSelf="center"
        backgroundColor={bgColor}
      >
        <Flex
          direction={isMobile ? 'column' : 'row'}
          justifyContent={isMobile ? 'center' : 'space-between'}
          alignItems={isMobile ? 'center' : 'space-between'}
          flexFlow={isMobile ? 'column wrap' : 'row wrap'}
          mt={2}
        >
          <PoolButtons
            searchText={Array.isArray(searchText) ? searchText[0] : searchText}
            viewMode={viewMode}
            setSearchText={setSearchText}
            setViewMode={setViewMode}
          />
          <Box display="flex" mt={2}>
            <InputGroup mr={3} width="auto" display={{ base: 'none', lg: 'flex' }}>
              <InputLeftElement pointerEvents="none" width={'3.5rem'}>
                <Text>Sort By</Text>
              </InputLeftElement>
              <Select
                bg={selectBgColor}
                color={selectTextColor}
                ml={'4.5rem'}
                width="175px"
                borderRadius={12}
                borderColor={borderColor}
                borderWidth={2}
                _focus={{}}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                value={sortBy}
                fontWeight="bold"
                _hover={{
                  borderColor: borderColor,
                  opacity: 0.8,
                }}
                _active={{ opacity: 1 }}
                cursor="pointer"
              >
                <option
                  value="supply"
                  style={{
                    color: textColor,
                    background: bgColor,
                    borderRadius: 10,
                  }}
                >
                  Highest Supply
                </option>
                <option
                  value="borrow"
                  style={{
                    color: textColor,
                    background: bgColor,
                  }}
                >
                  Highest Borrow
                </option>
              </Select>
            </InputGroup>

            <span style={{ display: 'inline-block' }}>
              <InputGroup maxWidth={'250px'}>
                <InputLeftAddon
                  pointerEvents="none"
                  backgroundColor={selectBgColor}
                  border="2px solid"
                  borderColor={borderColor}
                  borderRadius="12px"
                >
                  <SearchIcon color={selectTextColor} />
                </InputLeftAddon>
                <Input
                  bg={selectBgColor}
                  color={textColor}
                  borderRadius="12px"
                  _focus={{}}
                  _hover={{}}
                  border="2px solid"
                  borderColor={borderColor}
                  fontSize="18px"
                  borderLeft="none"
                  paddingLeft="0px"
                  type="text"
                  value={searchText ?? ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchText(event.target.value)
                  }
                  placeholder="ETH, DAI, FRAX, etc."
                  _placeholder={{ color: borderColor, opacity: 0.6 }}
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
  const { setLoading } = useRari();
  const {
    solidBtnTextColor,
    solidBtnActiveBgColor,
    outlineBtnActiveBgColor,
    outlineBtnTextColor,
    outlineBtnActiveTextColor,
    outlineBtnBorderColor,
    outlineBtnActiveBorderColor,
  } = useColors();

  return (
    <ButtonGroup spacing={0} flexFlow={'row wrap'} justifyContent="center">
      {!isMobile && (
        <ButtonGroup
          mt={2}
          mr={4}
          isAttached
          spacing={0}
          flexFlow={'row wrap'}
          justifyContent="center"
        >
          <IconButton
            variant="outline"
            color={viewMode === 'list' ? outlineBtnActiveTextColor : outlineBtnTextColor}
            background={viewMode === 'list' ? outlineBtnActiveBgColor : 'false'}
            _hover={{
              background: outlineBtnActiveBgColor,
              color: outlineBtnActiveTextColor,
              borderColor: outlineBtnActiveBgColor,
            }}
            aria-label="List View"
            icon={<Icon as={MdViewList} w={8} h={8} />}
            onClick={() => setViewMode('list')}
            disabled={isMobile}
            borderRadius={12}
            borderColor={viewMode === 'list' ? outlineBtnActiveBorderColor : outlineBtnBorderColor}
            _active={{ opacity: 0.8 }}
            mr="-px"
          />
          <IconButton
            variant="outline"
            color={viewMode === 'card' ? outlineBtnActiveTextColor : outlineBtnTextColor}
            background={viewMode === 'card' ? outlineBtnActiveBgColor : 'false'}
            _hover={{
              background: outlineBtnActiveBgColor,
              color: outlineBtnActiveTextColor,
              borderColor: outlineBtnActiveBgColor,
            }}
            aria-label="Card View"
            icon={<Icon as={MdViewModule} w={8} h={8} />}
            value="card"
            onClick={() => setViewMode('card')}
            borderRadius={12}
            borderColor={viewMode === 'card' ? outlineBtnActiveBorderColor : outlineBtnBorderColor}
            _active={{ opacity: 0.8 }}
          />
        </ButtonGroup>
      )}
      <ButtonGroup isAttached spacing={0} flexFlow={'row wrap'} justifyContent="center" mx={4}>
        <Button
          bgColor={isAllPoolSelected ? outlineBtnActiveBgColor : undefined}
          borderColor={isAllPoolSelected ? outlineBtnActiveBorderColor : outlineBtnBorderColor}
          borderRadius={'xl'}
          color={isAllPoolSelected ? outlineBtnActiveTextColor : outlineBtnTextColor}
          fontFamily={'heading'}
          onClick={() => setSearchText('')}
          variant="outline"
          _active={{ opacity: 0.8 }}
          _hover={{
            background: outlineBtnActiveBgColor,
            color: outlineBtnActiveTextColor,
            borderColor: outlineBtnActiveBgColor,
          }}
          mt={2}
          mr="-px"
        >
          All Pools
        </Button>
        <Button
          bgColor={isCreatedPoolSelected ? outlineBtnActiveBgColor : undefined}
          borderColor={isCreatedPoolSelected ? outlineBtnActiveBorderColor : outlineBtnBorderColor}
          borderRadius={'xl'}
          color={isCreatedPoolSelected ? outlineBtnActiveTextColor : outlineBtnTextColor}
          fontFamily={'heading'}
          onClick={() => setSearchText('created-pools')}
          variant="outline"
          _active={{ opacity: 0.8 }}
          _hover={{
            background: outlineBtnActiveBgColor,
            color: outlineBtnActiveTextColor,
            borderColor: outlineBtnActiveBgColor,
          }}
          mt={2}
          mr="-px"
        >
          Created Pools
        </Button>
        <Button
          bgColor={isVerifiedPoolSelected ? outlineBtnActiveBgColor : undefined}
          borderColor={isVerifiedPoolSelected ? outlineBtnActiveBorderColor : outlineBtnBorderColor}
          borderRadius={'xl'}
          color={isVerifiedPoolSelected ? outlineBtnActiveTextColor : outlineBtnTextColor}
          fontFamily={'heading'}
          onClick={() => setSearchText('verified-pools')}
          variant="outline"
          _active={{ opacity: 0.8 }}
          _hover={{
            background: outlineBtnActiveBgColor,
            color: outlineBtnActiveTextColor,
            borderColor: outlineBtnActiveBgColor,
          }}
          mt={2}
          mr="-px"
        >
          Verified Pools
        </Button>
        <Button
          bgColor={isUnverifiedPoolSelected ? outlineBtnActiveBgColor : undefined}
          borderColor={
            isUnverifiedPoolSelected ? outlineBtnActiveBorderColor : outlineBtnBorderColor
          }
          borderRadius={'xl'}
          color={isUnverifiedPoolSelected ? outlineBtnActiveTextColor : outlineBtnTextColor}
          fontFamily={'heading'}
          onClick={() => setSearchText('unverified-pools')}
          variant="outline"
          _active={{ opacity: 0.8 }}
          _hover={{
            background: outlineBtnActiveBgColor,
            color: outlineBtnActiveTextColor,
            borderColor: outlineBtnActiveBgColor,
          }}
          mt={2}
        >
          Unverified Pools
        </Button>
      </ButtonGroup>
      <Button
        onClick={() => {
          setLoading(true);
          router.push('/new-pool');
        }}
        opacity={'1'}
        fontFamily={'heading'}
        color={solidBtnTextColor}
        bgColor={solidBtnActiveBgColor}
        _hover={{
          background: solidBtnActiveBgColor,
          color: solidBtnTextColor,
        }}
        borderRadius={'xl'}
        _active={{
          opacity: '0.8',
        }}
        mt={2}
      >
        + Create Pool
      </Button>
    </ButtonGroup>
  );
};
