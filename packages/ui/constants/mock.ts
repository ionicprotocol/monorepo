import { VEION_CHAIN_CONFIGS } from '@ui/hooks/veion/useVeIONLocks';
import type { ChainId } from '@ui/types/VeIION';

export type LockedData = {
  id: string;
  tokensLocked: string;
  lockedBLP: {
    amount: string;
    value: string;
  };
  lockExpires: {
    date: string;
    timeLeft: string;
  };
  votingPower: string;
  network: string;
  enableClaim: boolean;
  chainId: number;
  position?: number;
};

export const lockedData: LockedData[] = [
  {
    id: '1',
    tokensLocked: '70% ION / 30% ETH',
    lockedBLP: {
      amount: '100.50 BLP',
      value: '$350.00'
    },
    lockExpires: {
      date: '15 Jan 2024',
      timeLeft: '100d : 12h : 45m'
    },
    votingPower: '5 veION',
    network: 'Optimism',
    enableClaim: true,
    chainId: 10,
    position: 1
  },
  {
    id: '2',
    tokensLocked: '60% ION / 40% ETH',
    lockedBLP: {
      amount: '150.75 BLP',
      value: '$500.00'
    },
    lockExpires: {
      date: '10 Feb 2024',
      timeLeft: '150d : 5h : 20m'
    },
    votingPower: '10.5 veION',
    network: 'Base',
    enableClaim: false,
    chainId: 8453,
    position: 1
  },
  {
    id: '3',
    tokensLocked: '50% ION / 50% ETH',
    lockedBLP: {
      amount: '200.00 BLP',
      value: '$650.00'
    },
    lockExpires: {
      date: '25 Dec 2023',
      timeLeft: '75d : 18h : 30m'
    },
    votingPower: '15.75 veION',
    network: 'Mode',
    enableClaim: false,
    chainId: 34443,
    position: 1
  },
  {
    id: '4',
    tokensLocked: '80% ION / 20% ETH',
    lockedBLP: {
      amount: '175.25 BLP',
      value: '$600.00'
    },
    lockExpires: {
      date: '5 Mar 2024',
      timeLeft: '200d : 8h : 15m'
    },
    votingPower: '25 veION',
    network: 'Optimism',
    enableClaim: false,
    chainId: 10,
    position: 2
  },
  {
    id: '5',
    tokensLocked: '90% ION / 10% ETH',
    lockedBLP: {
      amount: '225.50 BLP',
      value: '$750.00'
    },
    lockExpires: {
      date: '30 Nov 2023',
      timeLeft: '50d : 10h : 5m'
    },
    votingPower: '50 veION',
    network: 'Base',
    enableClaim: false,
    chainId: 8453,
    position: 2
  },
  {
    id: '6',
    tokensLocked: '85% ION / 15% ETH',
    lockedBLP: {
      amount: '250.75 BLP',
      value: '$800.00'
    },
    lockExpires: {
      date: '1 Apr 2024',
      timeLeft: '250d : 2h : 50m'
    },
    votingPower: '100 veION',
    network: 'Mode',
    enableClaim: false,
    chainId: 34443,
    position: 2
  }
];

export const getChainName = (chainId: ChainId) => {
  return VEION_CHAIN_CONFIGS[chainId]?.name || 'Unknown Chain';
};

export type LockedDataWithDelegate = {
  id: string;
  tokensLocked: string;
  lockedBLP: {
    amount: string;
    value: string;
  };
  lockExpires: {
    date: string;
    timeLeft: string;
  };
  votingPower: string;
  votingPercentage: string;
  delegatedTo: string;
  network: string;
  readyToDelegate: boolean;
  // Add the missing properties
  chainId: number;
  lpTokenAddress: string;
  delegatedTokenIds: number[];
  delegatedAmounts: string[];
};

export const lockedDataWithDelegate: LockedDataWithDelegate[] = [
  {
    id: '0012',
    tokensLocked: '80% ION / 20% ETH',
    lockedBLP: {
      amount: '124.03 BLP',
      value: '$437.87'
    },
    lockExpires: {
      date: '20 Mar 2025',
      timeLeft: '700d : 23h : 34m'
    },
    votingPower: '12.03 veION',
    votingPercentage: '1.67% of all',
    delegatedTo: '0x9T45...vt96h6',
    network: 'Polygon',
    readyToDelegate: true,
    // Add the required properties
    chainId: 137, // Polygon chain ID
    lpTokenAddress: '0x1234567890123456789012345678901234567890',
    delegatedTokenIds: [1, 2, 3],
    delegatedAmounts: ['100', '200', '300']
  },
  {
    id: '0012',
    tokensLocked: '80% ION / 20% ETH',
    lockedBLP: {
      amount: '124.03 BLP',
      value: '$437.87'
    },
    lockExpires: {
      date: '20 Mar 2025',
      timeLeft: '700d : 23h : 34m'
    },
    votingPower: '12.03 veION',
    votingPercentage: '1.67% of all',
    delegatedTo: '0x9T45...vt96h6',
    network: 'Polygon',
    readyToDelegate: false,
    // Add the required properties
    chainId: 137, // Polygon chain ID
    lpTokenAddress: '0x1234567890123456789012345678901234567890',
    delegatedTokenIds: [4, 5, 6],
    delegatedAmounts: ['150', '250', '350']
  }
];

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
