import type { Address } from 'viem';

import {
  BaseContractABI,
  BaseLiquidityContractAdd,
  BaseReservesContractAddr
} from '@ui/constants/baselp';
import {
  LiquidityContractAbi,
  LiquidityContractAddress
} from '@ui/constants/lp';
import { TradingContractAddress } from '@ui/constants/modetradingfees';
import { StakingContractAddress } from '@ui/constants/staking';

export function getPoolToken(token?: 'eth' | 'mode' | 'weth'): `0x${string}` {
  if (token === 'weth') return '0x4200000000000000000000000000000000000006';
  if (token === 'mode') return '0xDfc7C877a950e49D2610114102175A06C2e3167a';
  return '0x0000000000000000000000000000000000000000';
}
export function getToken(chain: number): `0x${string}` {
  if (chain === 34443) return '0x18470019bf0e94611f15852f7e93cf5d65bc34ca';
  if (chain === 8453) return '0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5';
  return '0x0000000000000000000000000000000000000000';
}
export function getAvailableStakingToken(
  chain: number,
  token: 'eth' | 'mode' | 'weth'
): `0x${string}` {
  if (chain === 34443 && (token === 'eth' || token === 'weth'))
    return '0xC6A394952c097004F83d2dfB61715d245A38735a';
  if (chain === 34443 && token === 'mode')
    return '0x690A74d2eC0175a69C0962B309E03021C0b5002E';
  if (chain === 8453 && (token === 'eth' || token === 'weth'))
    return BaseReservesContractAddr;
  return '0x0000000000000000000000000000000000000000';
}
export function getTradingContractAddress(chain: number): `0x${string}` {
  if (chain === 34443) return TradingContractAddress;
  if (chain === 8453) return BaseReservesContractAddr;
  return '0x0000000000000000000000000000000000000000';
}

export function getSpenderContract(chain: number): `0x${string}` {
  if (chain === 34443) return LiquidityContractAddress;
  if (chain === 8453) return BaseLiquidityContractAdd;
  return '0x0000000000000000000000000000000000000000';
}

export function getStakingToContract(
  chain: number,
  token: 'eth' | 'mode' | 'weth'
): `0x${string}` {
  if (chain === 34443 && (token === 'eth' || token === 'weth'))
    return StakingContractAddress;
  if (chain === 34443 && token === 'mode')
    return '0x8EE410cC13948e7e684ebACb36b552e2c2A125fC';
  if (chain === 8453) return '0x9b42e5F8c45222b2715F804968251c747c588fd7';
  return '0x0000000000000000000000000000000000000000';
}

//for reserves=========================================================
export function getReservesContract(chain: number): `0x${string}` {
  if (chain === 34443) return LiquidityContractAddress;
  if (chain === 8453) return BaseReservesContractAddr;
  return '0x0000000000000000000000000000000000000000';
}
export function getReservesABI(chain: number) {
  if (chain === 34443) return LiquidityContractAbi;
  if (chain === 8453) return BaseContractABI;
  return LiquidityContractAbi;
}

export function getReservesArgs(chain: number, token: 'eth' | 'mode' | 'weth') {
  if (chain === 34443 && token === 'eth') {
    return [getToken(+chain), getPoolToken('weth'), false];
  }
  if (chain === 34443 && token === 'weth') {
    return [getToken(+chain), getPoolToken('weth'), false];
  }
  if (chain === 8453) return [];
  return [];
}
//=========================================================
// Bridging Contract address

export const BridgingContractAddress: Record<number, Address> = {
  34443: '0xb750c43F9338313c7A8af6922dcA1910Ee3583c8',
  8453: '0xD9E3f9D761f3fC2Adb0DC70E5284494dEc0D7C30'
};
