import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface CoinGeckoResponse {
  ethereum: {
    usd: number;
  };
}

interface LlamaResponse {
  coins: {
    [key: string]: {
      price: number;
      symbol: string;
      timestamp: number;
      confidence: number;
    };
  };
}

export function useEthPrice() {
  return useQuery({
    queryKey: ['ethPrice'],
    queryFn: async () => {
      try {
        const res = await axios.get<CoinGeckoResponse>(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );

        return res.data.ethereum.usd;
      } catch (error) {
        try {
          const res = await axios.get<LlamaResponse>(
            'https://coins.llama.fi/prices/current/coingecko:ethereum'
          );

          return res.data.coins['coingecko:ethereum'].price;
        } catch (fallbackError) {
          console.warn('Failed to fetch ETH price:', fallbackError);
          return 0;
        }
      }
    },
    staleTime: Infinity
  });
}
