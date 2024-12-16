// hooks/useMorphoData.ts
import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';

import { morphoVaults } from '@ui/utils/morphoUtils';

const MORPHO_API_URL = 'https://blue-api.morpho.org/graphql';

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
    totalAssets: number | string;
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

const fetchMorphoData = async (): Promise<MorphoResponse> => {
  return request(MORPHO_API_URL, VAULT_QUERY);
};

export const useMorphoData = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['morphoVaults'],
    queryFn: fetchMorphoData,
    staleTime: 30000,
    refetchInterval: 60000
  });

  const rows = morphoVaults.map((row) => {
    const vaultSymbol = `ionic${row.asset[0]}`;
    const vaultData = data?.vaults.items.find(
      (vault) => vault.symbol === vaultSymbol
    );

    if (vaultData) {
      return {
        ...row,
        apr: vaultData.state.rewards[0]?.supplyApr ?? 0,
        tvl: Number(vaultData.state.totalAssets) ?? 0
      };
    }
    return row;
  });

  return {
    rows,
    isLoading,
    error: error as Error | null
  };
};
