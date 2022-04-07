import axios from 'axios';
import { useMemo } from 'react';
import { useQueries, useQuery } from 'react-query';

import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';
import { TokensDataMap } from '@type/tokens';

export interface TokenData {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  color: string;
  overlayTextColor: string;
  logoURL: string;
  extraData: ExtraData;
}

export interface ExtraData {
  partnerURL: string;
  hasAPY: boolean;
  shortName: string;
  apy: number;
}

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
      } catch (e) {
        data = {
          name: null,
          address: null,
          symbol: null,
          decimals: null,
          color: null,
          overlayTextColor: null,
          logoURL: null,
          extraData: {},
        };
      }
    } else {
      data = NATIVE_TOKEN_DATA[chainId];
    }
  }

  return data as TokenData;
};

export const useTokenData = (address: string | undefined) => {
  const { currentChain } = useRari();

  const queryResults = useQuery<TokenData | undefined>(
    ['TokenData', address],
    async () => {
      return !!address ? await fetchTokenData(address, currentChain.id) : undefined;
    },
    { cacheTime: Infinity, staleTime: Infinity }
  );
  return queryResults;
};

export const useTokensData = (addresses: string[]): TokenData[] | null => {
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
