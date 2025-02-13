import type { ChainId } from '@ui/types/veION';
import { VEION_CHAIN_CONFIGS } from '@ui/utils/veion/chainConfig';

export const getChainName = (chainId: ChainId) => {
  return VEION_CHAIN_CONFIGS[chainId]?.name || 'Unknown Chain';
};

export interface InfoBlock {
  label: string;
  value: string;
  infoContent: string;
  icon: string | null;
}

// Types for our rewards data
type Network = 'Base' | 'Mode';
type RewardSection =
  | 'Locked LP Emissions'
  | 'Market Emissions'
  | 'Protocol Bribes';

interface RewardItem {
  token: string;
  tokenSymbol: string;
  amount: number;
  network: Network;
  selected: boolean;
  section: RewardSection;
}
interface RewardItem {
  token: string;
  tokenSymbol: string;
  amount: number;
  network: Network;
  selected: boolean;
  section: RewardSection;
  id: string;
}

export const claimRewards: RewardItem[] = [
  // Market Emissions
  {
    id: '1',
    token: 'ION',
    tokenSymbol: 'ION',
    amount: 6969,
    network: 'Mode',
    selected: false,
    section: 'Market Emissions'
  },
  {
    id: '2',
    token: 'ION',
    tokenSymbol: 'ION',
    amount: 1000,
    network: 'Base',
    selected: true,
    section: 'Market Emissions'
  },
  {
    id: '3',
    token: 'RSR',
    tokenSymbol: 'RSR',
    amount: 1239,
    network: 'Base',
    selected: true,
    section: 'Market Emissions'
  },
  // Protocol Bribes
  {
    id: '4',
    token: 'RSR',
    tokenSymbol: 'RSR',
    amount: 1050,
    network: 'Base',
    selected: true,
    section: 'Protocol Bribes'
  },
  {
    id: '5',
    token: 'eUSD',
    tokenSymbol: 'eUSD',
    amount: 1050,
    network: 'Base',
    selected: true,
    section: 'Protocol Bribes'
  },
  // Locked LP Emissions
  {
    id: '6',
    token: 'AERO',
    tokenSymbol: 'AERO',
    amount: 500,
    network: 'Base',
    selected: true,
    section: 'Locked LP Emissions'
  },
  {
    id: '7',
    token: 'VELO',
    tokenSymbol: 'VELO',
    amount: 740,
    network: 'Mode',
    selected: false,
    section: 'Locked LP Emissions'
  }
];
