import { bsc, moonbeam, polygon } from '@midas-capital/chains';
import {
  ChainSupportedAssets as ChainSupportedAssetsType,
  SupportedChains,
} from '@midas-capital/types';
import axios from 'axios';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { config } from '@ui/config/index';
import { useMidas } from '@ui/context/MidasContext';
import { chainIdToConfig } from '@ui/types/ChainMetaData';
import { TokenData } from '@ui/types/ComponentPropsType';
import { TokensDataMap } from '@ui/types/TokensDataMap';

const ChainSupportedAssets: ChainSupportedAssetsType = {
  [SupportedChains.bsc]: bsc.assets,
  [SupportedChains.polygon]: polygon.assets,
  [SupportedChains.ganache]: [],
  [SupportedChains.evmos]: [],
  [SupportedChains.chapel]: [],
  [SupportedChains.moonbeam]: moonbeam.assets,
  [SupportedChains.neon_devnet]: [],
  [SupportedChains.arbitrum]: [],
};

export const fetchTokenData = async (
  addresses: string[],
  chainId: number | undefined
): Promise<TokenData[]> => {
  let data: Partial<TokenData>[] = [];

  const apiAddresses: string[] = [];

  if (chainId && addresses.length !== 0) {
    addresses.map(async (address) => {
      const wrappedNativeCurrencyConfig =
        chainIdToConfig[chainId].specificParams.metadata.wrappedNativeCurrency;

      if (address !== wrappedNativeCurrencyConfig.address) {
        const asset = ChainSupportedAssets[chainId as SupportedChains].find(
          (asset) => address === asset.underlying
        );

        if (asset) {
          data.push({
            address: asset.underlying,
            symbol: asset.symbol,
            decimals: asset.decimals,
            name: asset.name,
            logoURL: config.iconServerURL + '/token/96x96/' + asset.symbol.toLowerCase() + '.png',
          });
        } else {
          apiAddresses.push(address);
        }
      } else {
        data.push(wrappedNativeCurrencyConfig);
      }
    });

    if (apiAddresses.length !== 0) {
      const res = await axios.post('/api/tokenData', {
        chain: chainId,
        addresses: apiAddresses,
      });

      data = [...data, ...res.data];
    }
  }

  return data as TokenData[];
};

export const useTokenData = (address: string | undefined) => {
  const {
    currentChain: { id },
  } = useMidas();
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
        const res = await fetchTokenData([validAddress], id);

        return res[0];
      }
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!validAddress && !!id }
  );
};

export const useTokensDataAsMap = (addresses: string[] = []): TokensDataMap => {
  const { currentChain } = useMidas();

  const { data: tokensData } = useQuery(
    ['useTokensDataAsMap', addresses, currentChain.id],
    async () => {
      if (addresses && currentChain.id) {
        return await fetchTokenData(addresses, currentChain.id);
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!addresses && addresses.length !== 0 && !!currentChain.id,
    }
  );

  return useMemo(() => {
    const ret: TokensDataMap = {};
    if (!tokensData || tokensData.length === 0) return {};

    tokensData.forEach((data) => {
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
