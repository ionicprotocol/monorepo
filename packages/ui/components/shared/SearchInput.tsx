import { SearchIcon } from '@chakra-ui/icons';
import type { InputProps } from '@chakra-ui/react';
import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import { IONIC_LOCALSTORAGE_KEYS } from '@ui/constants/index';
import { useDebounce } from '@ui/hooks/useDebounce';

export const SearchInput = ({
  inputProps,
  localStorageKey,
  onSearch,
  placeholder
}: {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText]);

  useEffect(() => {
    if (localStorageKey) {
      mounted.current = true;

      const data = localStorage.getItem(IONIC_LOCALSTORAGE_KEYS);
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
    <InputGroup variant="ghost">
      <InputLeftAddon>
        <SearchIcon height="16px" width="16px" />
      </InputLeftAddon>
      <Input
        _focusVisible={{}}
        maxW={60}
        onChange={_onSearch}
        placeholder={placeholder ?? 'Search'}
        type="text"
        value={searchText}
        {...inputProps}
      />
    </InputGroup>
  );
};
