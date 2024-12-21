import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';

import type { MorphoRow } from '@ui/types/Earn';
import {
  morphoVaults,
  morphoBaseAddresses,
  formatTokenAmount
} from '@ui/utils/morphoUtils';

const MORPHO_API_URL = 'https://blue-api.morpho.org/graphql';

const VAULT_QUERY = gql`
  query FetchVaultData($wethAddress: String!, $usdcAddress: String!) {
    wethVault: vaultByAddress(address: $wethAddress, chainId: 8453) {
      state {
        totalAssetsUsd
        totalAssets
        netApy
      }
    }
    usdcVault: vaultByAddress(address: $usdcAddress, chainId: 8453) {
      state {
        totalAssetsUsd
        totalAssets
        netApy
      }
    }
  }
`;

interface VaultData {
  state: {
    totalAssetsUsd: number;
    totalAssets: number;
    netApy: number;
  };
}

interface MorphoResponse {
  wethVault: VaultData;
  usdcVault: VaultData;
}

const fetchMorphoData = async (): Promise<MorphoResponse> => {
  return request(MORPHO_API_URL, VAULT_QUERY, {
    wethAddress: morphoBaseAddresses.vaults.WETH,
    usdcAddress: morphoBaseAddresses.vaults.USDC
  });
};

export const useMorphoData = () => {
  const { data: vaultData, isLoading } = useQuery({
    queryKey: ['morphoVaults'],
    queryFn: fetchMorphoData,
    staleTime: 30000,
    refetchInterval: 60000
  });

  const rows = morphoVaults.map((baseVault): MorphoRow => {
    const asset = baseVault.asset[0];
    let vaultInfo;

    if (asset === 'WETH' && vaultData?.wethVault) {
      vaultInfo = vaultData.wethVault;
    } else if (asset === 'USDC' && vaultData?.usdcVault) {
      vaultInfo = vaultData.usdcVault;
    }

    if (vaultInfo) {
      const latestApy = vaultInfo.state.netApy || 0;

      return {
        ...baseVault,
        apy: latestApy * 100,
        tvl: {
          tokenAmount: formatTokenAmount(
            vaultInfo.state.totalAssets.toString(),
            asset
          ),
          usdValue: vaultInfo.state.totalAssetsUsd
        }
      };
    }

    return {
      ...baseVault,
      apy: 0,
      tvl: {
        tokenAmount: 0,
        usdValue: 0
      }
    };
  });

  return {
    rows,
    isLoading,
    error: null
  };
};
