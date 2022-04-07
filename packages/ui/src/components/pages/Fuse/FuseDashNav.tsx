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
  const { setViewMode: _setViewMode, currentChain } = useRari();
  const { cPage, cSelect, cInput } = useColors();

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
                bg={cSelect.bgColor}
                color={cSelect.txtColor}
                ml={'4.5rem'}
                width="175px"
                borderRadius={12}
                borderColor={cSelect.borderColor}
                borderWidth={2}
                _focus={{ outline: 'none' }}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                value={sortBy}
                fontWeight="bold"
                cursor="pointer"
                _hover={{ background: cSelect.hoverBgColor }}
              >
                <option
                  value="supply"
                  style={{
                    color: cSelect.txtColor,
                    background: cSelect.bgColor,
                    borderRadius: 10,
                  }}
                >
                  Highest Supply
                </option>
                <option
                  value="borrow"
                  style={{
                    color: cSelect.txtColor,
                    background: cSelect.bgColor,
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
                  backgroundColor={cInput.bgColor}
                  border="2px solid"
                  borderColor={cInput.borderColor}
                  borderRadius="12px"
                >
                  <SearchIcon color={cInput.txtColor} />
                </InputLeftAddon>
                <Input
                  bg={cInput.bgColor}
                  color={cInput.txtColor}
                  borderRadius="12px"
                  _focus={{}}
                  _hover={{}}
                  border="2px solid"
                  borderColor={cInput.borderColor}
                  fontSize="18px"
                  borderLeft="none"
                  paddingLeft="0px"
                  type="text"
                  value={searchText ?? ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchText(event.target.value)
                  }
                  placeholder="ETH, DAI, FRAX, etc."
                  _placeholder={{ color: cInput.placeHolderTxtColor }}
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
  const { setLoading, currentChain } = useRari();
  const { cOutlineBtn, cSolidBtn } = useColors();

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
            color={
              viewMode === 'list'
                ? cOutlineBtn.primary.selectedTxtColor
                : cOutlineBtn.primary.txtColor
            }
            background={viewMode === 'list' ? cOutlineBtn.primary.hoverBgColor : 'false'}
            _hover={{
              background: cOutlineBtn.primary.hoverBgColor,
              color: cOutlineBtn.primary.selectedTxtColor,
              borderColor: cOutlineBtn.primary.hoverBgColor,
            }}
            aria-label="List View"
            icon={<Icon as={MdViewList} w={8} h={8} />}
            onClick={() => setViewMode('list')}
            disabled={isMobile}
            borderRadius={12}
            borderColor={
              viewMode === 'list'
                ? cOutlineBtn.primary.borderColor
                : cOutlineBtn.primary.borderColor
            }
            _active={{ opacity: 0.8 }}
            mr="-px"
          />
          <IconButton
            variant="outline"
            color={
              viewMode === 'card'
                ? cOutlineBtn.primary.selectedTxtColor
                : cOutlineBtn.primary.txtColor
            }
            background={viewMode === 'card' ? cOutlineBtn.primary.hoverBgColor : 'false'}
            _hover={{
              background: cOutlineBtn.primary.hoverBgColor,
              color: cOutlineBtn.primary.selectedTxtColor,
              borderColor: cOutlineBtn.primary.hoverBgColor,
            }}
            aria-label="Card View"
            icon={<Icon as={MdViewModule} w={8} h={8} />}
            value="card"
            onClick={() => setViewMode('card')}
            borderRadius={12}
            borderColor={
              viewMode === 'card'
                ? cOutlineBtn.primary.borderColor
                : cOutlineBtn.primary.borderColor
            }
            _active={{ opacity: 0.8 }}
          />
        </ButtonGroup>
      )}
      <ButtonGroup isAttached spacing={0} flexFlow={'row wrap'} justifyContent="center" mx={4}>
        <Button
          bgColor={isAllPoolSelected ? cOutlineBtn.primary.hoverBgColor : undefined}
          borderColor={
            isAllPoolSelected ? cOutlineBtn.primary.borderColor : cOutlineBtn.primary.borderColor
          }
          borderRadius={'xl'}
          color={
            isAllPoolSelected ? cOutlineBtn.primary.selectedTxtColor : cOutlineBtn.primary.txtColor
          }
          fontFamily={'heading'}
          onClick={() => setSearchText('')}
          variant="outline"
          _active={{ opacity: 0.8 }}
          _hover={{
            background: cOutlineBtn.primary.hoverBgColor,
            color: cOutlineBtn.primary.selectedTxtColor,
            borderColor: cOutlineBtn.primary.hoverBgColor,
          }}
          mt={2}
          mr="-px"
        >
          All Pools
        </Button>
        <Button
          bgColor={isCreatedPoolSelected ? cOutlineBtn.primary.hoverBgColor : undefined}
          borderColor={
            isCreatedPoolSelected
              ? cOutlineBtn.primary.borderColor
              : cOutlineBtn.primary.borderColor
          }
          borderRadius={'xl'}
          color={
            isCreatedPoolSelected
              ? cOutlineBtn.primary.selectedTxtColor
              : cOutlineBtn.primary.txtColor
          }
          fontFamily={'heading'}
          onClick={() => setSearchText('created-pools')}
          variant="outline"
          _active={{ opacity: 0.8 }}
          _hover={{
            background: cOutlineBtn.primary.hoverBgColor,
            color: cOutlineBtn.primary.selectedTxtColor,
            borderColor: cOutlineBtn.primary.hoverBgColor,
          }}
          mt={2}
          mr="-px"
        >
          Created Pools
        </Button>
        <Button
          bgColor={isVerifiedPoolSelected ? cOutlineBtn.primary.hoverBgColor : undefined}
          borderColor={
            isVerifiedPoolSelected
              ? cOutlineBtn.primary.borderColor
              : cOutlineBtn.primary.borderColor
          }
          borderRadius={'xl'}
          color={
            isVerifiedPoolSelected
              ? cOutlineBtn.primary.selectedTxtColor
              : cOutlineBtn.primary.txtColor
          }
          fontFamily={'heading'}
          onClick={() => setSearchText('verified-pools')}
          variant="outline"
          _active={{ opacity: 0.8 }}
          _hover={{
            background: cOutlineBtn.primary.hoverBgColor,
            color: cOutlineBtn.primary.selectedTxtColor,
            borderColor: cOutlineBtn.primary.hoverBgColor,
          }}
          mt={2}
          mr="-px"
        >
          Verified Pools
        </Button>
        <Button
          bgColor={isUnverifiedPoolSelected ? cOutlineBtn.primary.hoverBgColor : undefined}
          borderColor={
            isUnverifiedPoolSelected
              ? cOutlineBtn.primary.borderColor
              : cOutlineBtn.primary.borderColor
          }
          borderRadius={'xl'}
          color={
            isUnverifiedPoolSelected
              ? cOutlineBtn.primary.selectedTxtColor
              : cOutlineBtn.primary.txtColor
          }
          fontFamily={'heading'}
          onClick={() => setSearchText('unverified-pools')}
          variant="outline"
          _active={{ opacity: 0.8 }}
          _hover={{
            background: cOutlineBtn.primary.hoverBgColor,
            color: cOutlineBtn.primary.selectedTxtColor,
            borderColor: cOutlineBtn.primary.hoverBgColor,
          }}
          mt={2}
        >
          Unverified Pools
        </Button>
      </ButtonGroup>
      <Button
        onClick={() => {
          setLoading(true);
          router.push(`${currentChain.id}/create-pool`);
        }}
        opacity={'1'}
        fontFamily={'heading'}
        color={cSolidBtn.primary.txtColor}
        bgColor={cSolidBtn.primary.bgColor}
        _hover={{
          background: cSolidBtn.primary.hoverBgColor,
          color: cSolidBtn.primary.hoverTxtColor,
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
