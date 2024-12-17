import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';
import { utils } from 'ethers';
import axios from 'axios';

import { morphoVaults } from '@ui/utils/morphoUtils';

const MORPHO_API_URL = 'https://blue-api.morpho.org/graphql';
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

const VAULT_QUERY = gql`
  {
    vaults(
      where: { chainId_in: [8453], symbol_in: ["ionicWETH", "ionicUSDC"] }
    ) {
      items {
        symbol
        state {
          totalAssets
          rewards {
            asset {
              address
            }
            yearlySupplyTokens
            supplyApr
            amountPerSuppliedToken
          }
        }
      }
    }
  }
`;

interface VaultData {
  symbol: string;
  state: {
    totalAssets: string;
    rewards: Array<{
      asset: {
        address: string;
      };
      yearlySupplyTokens: string;
      supplyApr: number;
      amountPerSuppliedToken: string;
    }>;
  };
}

interface MorphoResponse {
  vaults: {
    items: VaultData[];
  };
}

const fetchTokenPrices = async () => {
  try {
    const response = await axios.get(
      `${COINGECKO_API}?ids=ethereum,usd-coin&vs_currencies=usd`
    );
    return {
      WETH: response.data.ethereum.usd,
      USDC: response.data['usd-coin'].usd
    };
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return { WETH: 0, USDC: 1 }; // Default values
  }
};

const formatTVL = (
  totalAssets: string,
  symbol: string,
  prices: { WETH: number; USDC: number }
): {
  tokenAmount: number;
  usdValue: number;
} => {
  try {
    // Use appropriate decimals based on the asset
    const decimals = symbol.includes('WETH') ? 18 : 6;
    // Convert from big number to human readable format
    const formatted = utils.formatUnits(totalAssets, decimals);
    // Parse to number for display
    const tokenAmount = parseFloat(formatted);
    // Calculate USD value
    const price = symbol.includes('WETH') ? prices.WETH : prices.USDC;
    const usdValue = tokenAmount * price;

    return { tokenAmount, usdValue };
  } catch (error) {
    console.error(`Error formatting TVL for ${symbol}:`, error);
    return { tokenAmount: 0, usdValue: 0 };
  }
};

const fetchMorphoData = async (): Promise<MorphoResponse> => {
  return request(MORPHO_API_URL, VAULT_QUERY);
};

export const useMorphoData = () => {
  const { data: vaultData, isLoading: isVaultLoading } = useQuery({
    queryKey: ['morphoVaults'],
    queryFn: fetchMorphoData,
    staleTime: 30000,
    refetchInterval: 60000
  });

  const { data: prices, isLoading: isPricesLoading } = useQuery({
    queryKey: ['tokenPrices'],
    queryFn: fetchTokenPrices,
    staleTime: 60000,
    refetchInterval: 300000 // 5 minutes
  });

  const rows =
    vaultData?.vaults.items.map((vault) => {
      const baseVault = morphoVaults.find(
        (row) => `ionic${row.asset[0]}` === vault.symbol
      );

      if (baseVault && prices) {
        const { tokenAmount, usdValue } = formatTVL(
          vault.state.totalAssets,
          vault.symbol,
          prices
        );

        return {
          ...baseVault,
          apr: vault.state.rewards[0]?.supplyApr ?? 0,
          tvl: {
            tokenAmount,
            usdValue
          }
        };
      }
      return baseVault;
    }) ?? [];

  return {
    rows,
    isLoading: isVaultLoading || isPricesLoading,
    error: null
  };
};
