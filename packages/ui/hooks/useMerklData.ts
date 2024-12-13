import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { mode } from 'viem/chains';

import type { Address } from 'viem';

export interface MerklCampaign {
  apr: number;
  type: string;
  typeInfo: {
    underlying?: Address;
    protocol?: string;
    name?: string;
    poolTokens?: {
      [tokenAddress: string]: {
        symbol: string;
        decimals: number;
        amountInPool: number;
        price: number;
      };
    };
  };
  tags?: string[];
}

export interface MerklAprData {
  [chainId: number]: {
    [key: `${number}-${Address}`]: {
      [merkleKey: string]: MerklCampaign;
    };
  };
}

export interface TokenAprInfo {
  token: Address;
  type: 'supply' | 'borrow';
  apr: number;
}

const getSimplifiedType = (
  campaign: MerklCampaign
): 'supply' | 'borrow' | null => {
  // Check for special pool cases first
  if (
    campaign.typeInfo.poolTokens &&
    Object.values(campaign.typeInfo.poolTokens).some(
      (token) => token.symbol === 'M-BTC'
    )
  ) {
    return 'supply';
  }

  // Check type and tags
  if (campaign.type.includes('lending') || campaign.type === 'balancerPool') {
    return 'supply';
  }
  if (campaign.type.includes('borrowing')) {
    return 'borrow';
  }

  // Check protocol name in typeInfo
  if (campaign.typeInfo.name?.toLowerCase().includes('debt')) {
    return 'borrow';
  }

  return null;
};

export function useMerklData() {
  return useQuery({
    queryKey: ['merklApr'],
    queryFn: async () => {
      const res = await axios.get<MerklAprData>(
        `https://api.merkl.xyz/v3/campaigns?chainIds=34443&types=1&live=true`
      );

      // Flatten all token-APR pairs into a single array with type information
      return Object.entries(res.data[mode.id]).flatMap(
        ([key, campaignGroup]) => {
          const campaigns = Object.values(campaignGroup);

          return campaigns.flatMap((campaign): TokenAprInfo[] => {
            const { apr, typeInfo } = campaign;

            const simplifiedType = getSimplifiedType(campaign);
            if (!simplifiedType) return [];

            // Handle pools with multiple tokens
            if (typeInfo.poolTokens) {
              return Object.entries(typeInfo.poolTokens).map(
                ([tokenAddress, tokenInfo]) => ({
                  token: tokenAddress as Address,
                  type: simplifiedType,
                  apr
                })
              );
            }

            // Handle single token cases (using underlying)
            if (typeInfo.underlying) {
              return [
                {
                  token: typeInfo.underlying,
                  type: simplifiedType,
                  apr
                }
              ];
            }

            return [];
          });
        }
      );
    }
  });
}
