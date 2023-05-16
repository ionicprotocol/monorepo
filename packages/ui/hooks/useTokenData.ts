import type { SupportedChains } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ethers } from 'ethers';
import { useMemo } from 'react';

import { config } from '@ui/config/index';
import type { TokenData } from '@ui/types/ComponentPropsType';
import { ChainSupportedAssets } from '@ui/utils/networkData';

export const fetchTokenData = async (
  addresses: string[],
  chainId: number
): Promise<TokenData[]> => {
  let data: Partial<TokenData>[] = [];

  const apiAddresses: string[] = [];

  if (addresses.length !== 0) {
    addresses.map(async (address) => {
      const asset = ChainSupportedAssets[chainId as SupportedChains].find(
        (asset) => address === asset.underlying
      );

      if (asset) {
        data.push({
          address: asset.underlying,
          decimals: asset.decimals,
          logoURL: config.iconServerURL + '/token/96x96/' + asset.symbol.toLowerCase() + '.png',
          name: asset.name,
          originalSymbol: asset.originalSymbol,
          symbol: asset.symbol,
        });
      } else {
        apiAddresses.push(address);
      }
    });

    if (apiAddresses.length !== 0) {
      const res = await axios.post('/api/tokenData', {
        addresses: apiAddresses,
        chain: chainId,
      });

      data = [...data, ...res.data];
    }
  }

  return data as TokenData[];
};

export const useTokenData = (address: string, chainId?: number) => {
  const validAddress = useMemo(() => {
    if (address) {
      try {
        return ethers.utils.getAddress(address);
      } catch {}
    }

    return undefined;
  }, [address]);

  return useQuery<TokenData | null>(
    ['useTokenData', chainId, validAddress],
    async () => {
      if (chainId && validAddress) {
        const res = await fetchTokenData([validAddress], chainId);

        return res[0] ? res[0] : null;
      } else {
        return null;
      }
    },
    { cacheTime: Infinity, enabled: !!chainId, staleTime: Infinity }
  );
};
