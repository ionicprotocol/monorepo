import { MidasSdk } from '@midas-capital/sdk';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { utils } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const fetchFuseNumberTVL = async (midasSdk: MidasSdk) => {
  const tvlNative = await midasSdk.getTotalValueLocked(false);
  const decimals = midasSdk.chainSpecificParams.metadata.wrappedNativeCurrency.decimals;

  return Number(utils.formatUnits(tvlNative, decimals));
};

interface CrossChainTVL {
  [chainId: string]: {
    value: number;
    symbol: string;
    name: string;
    logo: string;
  };
}

export const useTVL = () => {
  const { chainIds } = useMultiMidas();

  return useQuery<CrossChainTVL | null | undefined>(
    ['useTVL', ...chainIds],
    async () => {
      if (chainIds.length > 0) {
        const { data } = await axios.post('/api/tvl', {
          chains: chainIds,
        });

        return data.chainTVLs as CrossChainTVL;
      } else {
        return null;
      }
    },
    { enabled: chainIds.length > 0 }
  );
};
