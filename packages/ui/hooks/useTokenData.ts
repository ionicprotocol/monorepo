import axios from 'axios';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import { useQueries, useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';
import { chainIdToConfig } from '@ui/types/ChainMetaData';
import { TokenData } from '@ui/types/ComponentPropsType';
import { TokensDataMap } from '@ui/types/TokensDataMap';

export const fetchTokenData = async (
  address: string,
  chainId: number | undefined
): Promise<TokenData> => {
  let data;
  if (chainId) {
    const wrappedNativeCurrencyConfig =
      chainIdToConfig[chainId].specificParams.metadata.wrappedNativeCurrency;
    if (address !== wrappedNativeCurrencyConfig.address) {
      const tokenData = await axios.post('/api/tokenData', {
        address: address,
        chain: chainId,
      });

      data = {
        ...tokenData.data,
        address: address,
      };
    } else {
      data = wrappedNativeCurrencyConfig;
    }
  }

  return data as TokenData;
};

export const useTokenData = (address: string | undefined) => {
  const {
    currentChain: { id },
  } = useRari();
  const validAddress = useMemo(() => {
    if (address) {
      try {
        return ethers.utils.getAddress(address);
      } catch {}
    }
    return undefined;
  }, [address]);

  return useQuery<TokenData | undefined>(
    ['useTokenData', id, validAddress],
    async () => {
      if (validAddress && id) {
        return fetchTokenData(validAddress, id);
      }
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!validAddress && !!id }
  );
};

export const useTokensDataAsMap = (addresses: string[] = []): TokensDataMap => {
  const { currentChain } = useRari();

  const tokensData = useQueries(
    addresses.map((address: string) => {
      return {
        queryKey: ['tokenData', address],
        queryFn: async () => await fetchTokenData(address, currentChain.id),
        cacheTime: Infinity,
        staleTime: Infinity,
      };
    })
  );

  return useMemo(() => {
    const ret: TokensDataMap = {};
    if (!tokensData.length) return {};
    tokensData.forEach(({ data }) => {
      const _data = data;
      if (_data && _data.address) {
        ret[_data.address] = {
          address: _data.address,
          color: _data.color ?? '',
          decimals: _data.decimals ?? 18,
          logoURL: _data.logoURL ?? '',
          name: _data.name ?? '',
          overlayTextColor: _data.overlayTextColor ?? '',
          symbol: _data.symbol ?? '',
        };
      }
    });

    return ret;
  }, [tokensData]);
};
