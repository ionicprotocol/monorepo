import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { mode } from 'viem/chains';

import type { Address } from 'viem';

interface MerklOpportunity {
  action: 'borrow' | 'supply';
  apr: number;
  tvl: number;
  platform: string;
  name: string;
  status: 'inactive' | 'live';
  campaigns: {
    active: Array<{
      apr: number;
      campaignParameters: {
        underlyingToken: Address;
        targetToken: Address;
      };
    }>;
  };
}

interface MerklOpportunityResponse {
  [key: `${number}_${string}`]: MerklOpportunity;
}

export interface TokenAprInfo {
  token: Address;
  type: 'borrow' | 'supply';
  apr: number;
}

const mapZeroAddress = (address: Address): Address => {
  if (address === '0x0000000000000000000000000000000000000000') {
    return '0x4200000000000000000000000000000000000006' as Address;
  }
  return address;
};

export function useMerklData() {
  return useQuery({
    queryKey: ['merklApr'],
    queryFn: async () => {
      try {
        const res = await axios.get<MerklOpportunityResponse>(
          `https://api.merkl.xyz/v3/opportunity?campaigns=true&chainId=${mode.id}&type=10&testTokens=true`
        );

        return Object.entries(res.data).flatMap(
          ([key, opportunity]): TokenAprInfo[] => {
            if (!opportunity.campaigns.active.length) return [];

            const campaign = opportunity.campaigns.active[0];
            if (!campaign?.campaignParameters?.underlyingToken) return [];

            const mappedToken = mapZeroAddress(
              campaign.campaignParameters.underlyingToken as Address
            );

            return [
              {
                token: mappedToken,
                type: opportunity.action === 'borrow' ? 'borrow' : 'supply',
                apr: opportunity.apr || 0
              }
            ];
          }
        );
      } catch (error) {
        console.error('Error fetching Merkl data:', error);
        return [];
      }
    },
    refetchInterval: 5 * 60 * 1000
  });
}

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
