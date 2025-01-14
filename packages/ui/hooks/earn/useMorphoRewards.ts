import { useQuery, useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { formatUnits } from 'viem';

import type { Hex } from 'viem';

interface RewardAsset {
  id: string;
  address: string;
  chain_id: number;
}

interface RewardDistributor {
  id: string;
  address: Hex;
  chain_id: number;
}

export interface RewardData {
  user: string;
  asset: RewardAsset;
  distributor: RewardDistributor;
  claimable: string;
  proof: string[];
  tx_data: string;
}

interface MorphoRewardsResponse {
  timestamp: string;
  data: RewardData[];
}

interface FormattedReward {
  token: string;
  amount: string;
  usdValue: number;
  distributorAddress: Hex;
  txData: string;
  chainId: number;
}

// Map asset addresses to token configurations
const TOKEN_CONFIG = {
  '0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842': {
    symbol: 'MORPHO',
    decimals: 18,
    isAddress: false,
    id: 'morpho' // CoinGecko ID for MORPHO
  },
  '0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5': {
    symbol: 'ION',
    decimals: 18,
    isAddress: true,
    id: 'base:0x3ee5e23eee121094f1cfc0ccc79d6c809ebd22e5' // DefiLlama format for Base chain ION
  }
};

const DEFI_LLAMA_API = 'https://coins.llama.fi/prices/current/';
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

const fetchTokenPrice = async (
  config: (typeof TOKEN_CONFIG)[keyof typeof TOKEN_CONFIG]
): Promise<number> => {
  if (config.isAddress) {
    // Use DefiLlama for address-based queries
    try {
      const { data } = await axios.get(`${DEFI_LLAMA_API}${config.id}`);
      if (data.coins[config.id]?.price) {
        return data.coins[config.id].price;
      }
    } catch (e) {
      console.warn('DefiLlama query failed:', e);
    }
  } else {
    // Use CoinGecko for ID-based queries
    try {
      const { data } = await axios.get(
        `${COINGECKO_API}?ids=${config.id}&vs_currencies=usd`
      );
      if (data[config.id]?.usd) {
        return data[config.id].usd;
      }
    } catch (e) {
      // Fallback to DefiLlama for CoinGecko tokens
      try {
        const { data } = await axios.get(
          `${DEFI_LLAMA_API}coingecko:${config.id}`
        );
        if (data.coins[`coingecko:${config.id}`]?.price) {
          return data.coins[`coingecko:${config.id}`].price;
        }
      } catch (defiFallbackError) {
        console.warn('DefiLlama fallback failed:', defiFallbackError);
      }
    }
  }
  return 0;
};

const fetchRewardsData = async (
  address: string
): Promise<MorphoRewardsResponse> => {
  const response = await fetch(
    `https://rewards.morpho.org/v1/users/${address}/distributions`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch rewards data');
  }
  return response.json();
};

const formatRewardAmount = (amount: string, decimals: number): string => {
  return parseFloat(formatUnits(BigInt(amount), decimals)).toFixed(4);
};

export const useMorphoRewards = (address: string | undefined) => {
  // Fetch prices for tokens
  const tokenQueries = useQueries({
    queries: Object.values(TOKEN_CONFIG).map((token) => ({
      queryKey: ['tokenPrice', token.id],
      queryFn: () => fetchTokenPrice(token),
      staleTime: 30000,
      refetchInterval: 60000
    }))
  });

  const tokenPrices = Object.values(TOKEN_CONFIG).reduce(
    (acc, token, index) => {
      acc[token.symbol] = tokenQueries[index].data ?? 0;
      return acc;
    },
    {} as Record<string, number>
  );

  const {
    data,
    isLoading: rewardsLoading,
    error
  } = useQuery({
    queryKey: ['morphoRewards', address],
    queryFn: () =>
      address ? fetchRewardsData(address) : Promise.reject('No address'),
    enabled: !!address,
    staleTime: 30000,
    refetchInterval: 60000,
    select: (data: MorphoRewardsResponse) => {
      const formattedRewards = data.data.reduce<{
        [key: string]: FormattedReward;
      }>((acc, reward) => {
        const config =
          TOKEN_CONFIG[reward.asset.address as keyof typeof TOKEN_CONFIG];
        if (!config) {
          console.warn('Unknown token address:', reward.asset.address);
          return acc;
        }

        const amount = formatRewardAmount(reward.claimable, config.decimals);
        const usdValue = parseFloat(amount) * (tokenPrices[config.symbol] ?? 0);

        acc[config.symbol] = {
          token: config.symbol,
          amount,
          usdValue,
          distributorAddress: reward.distributor.address,
          txData: reward.tx_data,
          chainId: reward.distributor.chain_id
        };

        return acc;
      }, {});

      return formattedRewards;
    }
  });

  const totalUsdValue = Object.values(data || {}).reduce(
    (sum, reward) => sum + reward.usdValue,
    0
  );

  const isLoading =
    rewardsLoading || tokenQueries.some((query) => query.isLoading);

  return {
    rewards: data || {},
    isLoading,
    error,
    totalUsdValue,
    canClaim: true
  };
};
