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
        netApyWithoutRewards
        rewards {
          asset {
            address
            name
          }
          amountPerSuppliedToken
          supplyApr
        }
        allocation {
          market {
            state {
              rewards {
                supplyApr
                asset {
                  address
                }
              }
            }
          }
          supplyAssetsUsd
        }
      }
    }
    usdcVault: vaultByAddress(address: $usdcAddress, chainId: 8453) {
      state {
        totalAssetsUsd
        totalAssets
        netApy
        netApyWithoutRewards
        rewards {
          asset {
            address
            name
          }
          amountPerSuppliedToken
          supplyApr
        }
        allocation {
          market {
            state {
              rewards {
                supplyApr
                asset {
                  address
                }
              }
            }
          }
          supplyAssetsUsd
        }
      }
    }
  }
`;

interface RewardData {
  supplyApr: number;
  asset: {
    address: string;
    name: string;
  };
}

interface MarketData {
  state: {
    rewards: RewardData[];
  };
}

interface AllocationData {
  market: MarketData;
  supplyAssetsUsd: number;
}

interface VaultData {
  state: {
    totalAssetsUsd: number;
    totalAssets: number;
    netApy: number;
    netApyWithoutRewards: number;
    allocation: AllocationData[];
    rewards: RewardData[];
  };
}

interface MorphoResponse {
  wethVault: VaultData;
  usdcVault: VaultData;
}

const MORPHO_REWARD_TOKEN = '0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842';

const getMorphoRewards = (allocation: AllocationData[]): number => {
  // Find first market with non-zero allocation that has the specific reward token
  const activeMarket = allocation.find(
    (item) =>
      item.supplyAssetsUsd > 0 &&
      item.market.state.rewards?.some(
        (reward) => reward.asset.address === MORPHO_REWARD_TOKEN
      )
  );

  if (!activeMarket) return 0;

  const reward = activeMarket.market.state.rewards.find(
    (r) => r.asset.address === MORPHO_REWARD_TOKEN
  );

  return reward?.supplyApr || 0;
};

const fetchMorphoData = async (isLegacy: boolean): Promise<MorphoResponse> => {
  return request(MORPHO_API_URL, VAULT_QUERY, {
    wethAddress: isLegacy
      ? morphoBaseAddresses.legacyVaults.WETH
      : morphoBaseAddresses.vaults.WETH,
    usdcAddress: isLegacy
      ? morphoBaseAddresses.legacyVaults.USDC
      : morphoBaseAddresses.vaults.USDC
  });
};

export const useMorphoData = ({ isLegacy }: { isLegacy: boolean }) => {
  const { data: vaultData, isLoading } = useQuery({
    queryKey: ['morphoVaults', isLegacy],
    queryFn: () => fetchMorphoData(isLegacy),
    staleTime: 30000,
    refetchInterval: 60000
  });

  const rows = morphoVaults.map((baseVault): MorphoRow => {
    const asset = baseVault.asset[0] as 'WETH' | 'USDC';
    let vaultInfo;

    if (asset === 'WETH' && vaultData?.wethVault) {
      vaultInfo = vaultData.wethVault;
    } else if (asset === 'USDC' && vaultData?.usdcVault) {
      vaultInfo = vaultData.usdcVault;
    }

    if (vaultInfo) {
      const morphoRewards = getMorphoRewards(vaultInfo.state.allocation);
      const ionRewards =
        vaultInfo.state.rewards.find((r) => r.asset.name === 'ION')
          ?.supplyApr || 0;

      const vaultAddress = isLegacy
        ? morphoBaseAddresses.legacyVaults[asset]
        : morphoBaseAddresses.vaults[asset];

      return {
        ...baseVault,
        link: `https://app.morpho.org/vault?vault=${vaultAddress}&network=base`,
        apy: (vaultInfo.state.netApy || 0) * 100,
        rewards: {
          morpho: morphoRewards * 100,
          rate: vaultInfo.state.netApyWithoutRewards,
          ION: ionRewards * 100
        },
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
      rewards: {
        morpho: 0,
        rate: 0,
        ION: 0
      },
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
