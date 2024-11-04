import type { Hex } from 'viem';

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
};

export const lockedData: LockedData[] = [
  {
    id: '0012',
    tokensLocked: '80% ION / 20% ETH',
    lockedBLP: {
      amount: '124.03 BLP',
      value: '$437.87'
    },
    lockExpires: {
      date: '20 Mar 2025',
      timeLeft: '00d : 00h : 00m'
    },
    votingPower: '0 veION',
    network: 'Polygon',
    enableClaim: true
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
    network: 'Polygon',
    enableClaim: false
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
    network: 'Polygon',
    enableClaim: false
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
    network: 'Polygon',
    enableClaim: false
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
    network: 'Polygon',
    enableClaim: false
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
    network: 'Polygon',
    enableClaim: false
  }
];

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

export type VotingData = {
  id: string;
  network: string;
  networkId: number;
  supplyAsset: string;
  totalVotes: {
    percentage: string;
    limit: string;
  };
  myVotes: {
    percentage: string;
    value: string;
  };
  marketAddress: Hex;
  type: 'supply' | 'borrow';
};

export const votingData: VotingData[] = [
  {
    id: '0012',
    network: 'Mode',
    networkId: 34443,
    supplyAsset: 'ETH',
    totalVotes: {
      percentage: '12.34%',
      limit: '25% limit'
    },
    myVotes: {
      percentage: '0',
      value: '$0'
    },
    marketAddress: '0x1234567890123456789012345678901234567890',
    type: 'supply'
  },
  {
    id: '0014',
    network: 'Optimism',
    networkId: 10,
    supplyAsset: 'USDC',
    totalVotes: {
      percentage: '18.5%',
      limit: '25% limit'
    },
    myVotes: {
      percentage: '10',
      value: '$2.45'
    },
    marketAddress: '0x2345678901234567890123456789012345678901',
    type: 'supply'
  },
  {
    id: '0014',
    network: 'Optimism',
    networkId: 10,
    supplyAsset: 'OP',
    totalVotes: {
      percentage: '8.5%',
      limit: '23% limit'
    },
    myVotes: {
      percentage: '0',
      value: '$0'
    },
    marketAddress: '0x2345678901234567890123456789012345678901',
    type: 'borrow'
  },
  {
    id: '0015',
    network: 'Base',
    networkId: 8453,
    supplyAsset: 'BNB',
    totalVotes: {
      percentage: '5.7%',
      limit: '25% limit'
    },
    myVotes: {
      percentage: '0',
      value: '$0'
    },
    marketAddress: '0x3456789012345678901234567890123456789012',
    type: 'supply'
  },
  {
    id: '0016',
    network: 'Eth',
    networkId: 1,
    supplyAsset: 'USDT',
    totalVotes: {
      percentage: '22.1%',
      limit: '25% limit'
    },
    myVotes: {
      percentage: '0',
      value: '$0'
    },
    marketAddress: '0x4567890123456789012345678901234567890123',
    type: 'borrow'
  }
];

export interface InfoBlock {
  label: string;
  value: string;
  infoContent: string;
  icon: string | null;
}

export const infoBlocks: InfoBlock[] = [
  {
    label: 'Locked Value',
    value: '$7894',
    infoContent: 'This is the amount of ION you have locked.',
    icon: null
  },
  {
    label: 'Locked Until',
    value: '11 Jan 2026',
    infoContent: 'This is the date until your ION is locked.',
    icon: null
  },
  {
    label: 'My Voting Power',
    value: '5674 veION',
    infoContent: 'This is your current voting power.',
    icon: '/img/logo/ion.svg'
  }
];

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
