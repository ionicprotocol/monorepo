import axios from 'axios';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import { useQueries, useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';
import { NATIVE_TOKEN_DATA } from '@ui/networkData/index';
import { TokenData } from '@ui/types/ComponentPropsType';
import { TokensDataMap } from '@ui/types/TokensDataMap';

export const fetchTokenData = async (
  address: string,
  chainId: number | undefined
): Promise<TokenData> => {
  let data;

  if (chainId) {
    if (address !== NATIVE_TOKEN_DATA[chainId].address) {
      try {
        const tokenData = await axios.post('/api/tokenData', {
          address: address,
          chain: chainId,
        });

        data = {
          ...tokenData.data,
          address: address,
        };
      } catch {
        throw 'Not a valid token address';
      }
    } else {
      data = NATIVE_TOKEN_DATA[chainId];
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
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!validAddress }
  );
};

export const useTokensData = (addresses: string[]): TokenData[] | null => {
  const { currentChain } = useRari();

  const tokensData = useQueries(
    addresses.map((address: string) => {
      return {
        queryKey: ['useTokensData', currentChain, address],
        queryFn: async () => await fetchTokenData(address, currentChain.id),
        cacheTime: Infinity,
        staleTime: Infinity,
      };
    })
  );

  return useMemo(() => {
    const ret: any[] = [];

    if (!tokensData.length) return null;

    // Return null altogether
    tokensData.forEach(({ data }) => {
      if (!data) return null;
      ret.push(data);
    });

    if (!ret.length) return null;

    return ret;
  }, [tokensData]);
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
