import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { COINGECKO_API, DEFI_LLAMA_API } from '@ui/constants/index';

export interface TokenConfig {
  cgId: string;
  symbol: string;
  address?: string;
}

interface TokenPrice {
  symbol: string;
  price: number;
}

export function useTokenPrices(tokens: TokenConfig[]) {
  return useQuery({
    queryKey: ['tokenPrices', tokens.map((t) => t.cgId).sort()],

    queryFn: async () => {
      const prices: Record<string, TokenPrice> = {};

      if (tokens.length === 0) return prices;

      const cgIds = tokens.map((t) => t.cgId).join(',');

      try {
        // Try CoinGecko first
        const { data } = await axios.get(`${COINGECKO_API}${cgIds}`);

        tokens.forEach((token) => {
          const price = data[token.cgId]?.usd ?? 0;
          prices[token.symbol] = {
            symbol: token.symbol,
            price: Number.isFinite(price) ? price : 0
          };
        });

        // For any tokens with zero price, try DefiLlama as fallback
        const missingTokens = tokens.filter(
          (token) => !prices[token.symbol]?.price
        );

        if (missingTokens.length > 0) {
          await Promise.all(
            missingTokens.map(async (token) => {
              try {
                const { data } = await axios.get(
                  `${DEFI_LLAMA_API}coingecko:${token.cgId}`
                );

                const price = data.coins[`coingecko:${token.cgId}`]?.price ?? 0;
                prices[token.symbol] = {
                  symbol: token.symbol,
                  price: Number.isFinite(price) ? price : 0
                };

                // Set default price of 1 for stablecoins if we got 0
                if (
                  price === 0 &&
                  (token.symbol === 'USDC' ||
                    token.symbol === 'USDT' ||
                    token.symbol === 'DAI')
                ) {
                  prices[token.symbol].price = 1;
                }
              } catch (e) {
                console.warn(
                  `Failed to fetch price for ${token.symbol} from DefiLlama`
                );
                // Set default price of 1 for stablecoins, 0 for others
                prices[token.symbol] = {
                  symbol: token.symbol,
                  price:
                    token.symbol === 'USDC' ||
                    token.symbol === 'USDT' ||
                    token.symbol === 'DAI'
                      ? 1
                      : 0
                };
              }
            })
          );
        }

        return prices;
      } catch (error) {
        console.error('Failed to fetch token prices:', error);

        // Return default prices in case of complete failure
        tokens.forEach((token) => {
          prices[token.symbol] = {
            symbol: token.symbol,
            price:
              token.symbol === 'USDC' ||
              token.symbol === 'USDT' ||
              token.symbol === 'DAI'
                ? 1
                : 0
          };
        });

        return prices;
      }
    },

    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });
}
