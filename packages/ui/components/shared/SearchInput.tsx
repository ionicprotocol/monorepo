import type { FlexProps, InputProps } from '@chakra-ui/react';
import { Flex, Input } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import { MIDAS_LOCALSTORAGE_KEYS } from '@ui/constants/index';
import { useDebounce } from '@ui/hooks/useDebounce';

export const SearchInput = ({
  flexProps,
  inputProps,
  localStorageKey,
  onSearch,
  placeholder,
}: {
  flexProps?: FlexProps;
  inputProps?: InputProps;
  localStorageKey?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}) => {
  const [searchText, setSearchText] = useState('');
  const mounted = useRef(false);
  const debouncedText = useDebounce(searchText, 400);

  useEffect(() => {
    onSearch(debouncedText);
  }, [debouncedText, onSearch]);

  useEffect(() => {
    if (localStorageKey) {
      mounted.current = true;

      const data = localStorage.getItem(MIDAS_LOCALSTORAGE_KEYS);
      if (data && mounted.current) {
        const obj = JSON.parse(data);
        const _searchText = obj[localStorageKey] || '';

        setSearchText(_searchText);
      }

      return () => {
        mounted.current = false;
      };
    }
  }, [localStorageKey]);

  const _onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <Flex {...flexProps}>
      <Input
        _focusVisible={{}}
        maxW={80}
        onChange={_onSearch}
        placeholder={placeholder ?? 'Search'}
        type="text"
        value={searchText}
        {...inputProps}
      />
    </Flex>
  );
};
