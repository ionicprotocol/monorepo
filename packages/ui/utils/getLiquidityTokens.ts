import { BaseReservesContractAddr } from '@ui/constants/baselp';
import { LiskReservesContractAddr } from '@ui/constants/liskLp';
import { ModeLpAddressPool } from '@ui/constants/lp';

export const LIQUIDITY_POOLS = {
  // Base pools
  BASE_WETH_POOL: {
    chainId: 8453,
    lpAddress: BaseReservesContractAddr,
    wethAddress: '0x4200000000000000000000000000000000000006'
  },
  // Mode pools
  // MODE_WETH_POOL: {
  //   chainId: 34443,
  //   lpAddress: ModeTradingContractAddress,
  //   wethAddress: '0x4200000000000000000000000000000000000006'
  // },
  MODE_ION_POOL: {
    chainId: 34443,
    lpAddress: ModeLpAddressPool,
    ionAddress: '0x18470019bF0E94611f15852F7e93cf5D65BC34CA'
  },
  // Lisk pools
  LISK_WETH_POOL: {
    chainId: 1135,
    lpAddress: LiskReservesContractAddr,
    wethAddress: '0x4200000000000000000000000000000000000006',
    ionAddress: '0x3f608A49a3ab475dA7fBb167C1Be6b7a45cD7013'
  }
  // Optimism pools
  // OP_WETH_POOL: {
  //   chainId: 10,
  //   lpAddress: OPReservesContractAddr,
  //   wethAddress: '0x4200000000000000000000000000000000000006'
  // },
  // OP_DUAL_POOL: {
  //   chainId: 10,
  //   lpAddress: '0x39B50c59782F8aa57628b115Dc2Fd87b322E60b9',
  //   wethAddress: '0x4200000000000000000000000000000000000006',
  //   ionAddress: '0x887d1c6A4f3548279c2a8A9D0FA61B5D458d14fC'
  // }
} as const;

export const LP_TYPES = ['eth', 'mode', 'op', 'weth'] as const;
export type LPType = (typeof LP_TYPES)[number];

export const ERC20_BALANCE_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;
