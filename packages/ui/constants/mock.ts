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
    votingPower: '0 velION',
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
    votingPower: '12.03 velION',
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
    votingPower: '12.03 velION',
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
    votingPower: '12.03 velION',
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
    votingPower: '12.03 velION',
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
    votingPower: '12.03 velION',
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
    votingPower: '12.03 velION',
    votingPercentage: '1.67% of all',
    delegatedTo: '0x9T45...vt96h6',
    network: 'Polygon',
    readyToDelegate: true
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
    votingPower: '12.03 velION',
    votingPercentage: '1.67% of all',
    delegatedTo: '0x9T45...vt96h6',
    network: 'Polygon',
    readyToDelegate: false
  }
];

export type VotingData = {
  id: string;
  network: string;
  supplyAsset: string;
  totalVotes: {
    percentage: string;
    limit: string;
  };
  myVotes: {
    percentage: string;
    value: string;
  };
};

export const votingData: VotingData[] = [
  {
    id: '0012',
    network: 'Mode',
    supplyAsset: 'ETH',
    totalVotes: {
      percentage: '12.34%',
      limit: '25% limit'
    },
    myVotes: {
      percentage: '0',
      value: '$0'
    }
  },
  {
    id: '0014',
    network: 'Optimism',
    supplyAsset: 'USDC',
    totalVotes: {
      percentage: '18.5%',
      limit: '25% limit'
    },
    myVotes: {
      percentage: '10',
      value: '$2.45'
    }
  },
  {
    id: '0015',
    network: 'Base',
    supplyAsset: 'BNB',
    totalVotes: {
      percentage: '5.7%',
      limit: '25% limit'
    },
    myVotes: {
      percentage: '0',
      value: '$0'
    }
  },
  {
    id: '0016',
    network: 'Eth',
    supplyAsset: 'USDT',
    totalVotes: {
      percentage: '22.1%',
      limit: '25% limit'
    },
    myVotes: {
      percentage: '0',
      value: '$0'
    }
  }
];
