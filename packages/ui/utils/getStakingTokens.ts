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

import type { Address } from 'viem';

export function getPoolToken(token?: 'eth' | 'mode' | 'weth'): `0x${string}` {
  if (token === 'weth') return '0x4200000000000000000000000000000000000006';
  if (token === 'mode') return '0xDfc7C877a950e49D2610114102175A06C2e3167a';
  return '0x0000000000000000000000000000000000000000';
}
export function getToken(chain: number): `0x${string}` {
  if (chain === 34443) return '0x18470019bf0e94611f15852f7e93cf5d65bc34ca'; //mode
  if (chain === 8453) return '0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5'; //base
  if (chain === 252) return '0x5BD5c0cB9E4404C63526433BcBd6d133C1d73ffE'; //frax
  if (chain === 10) return '0x887d1c6A4f3548279c2a8A9D0FA61B5D458d14fC'; //op
  if (chain === 60808) return '0xb90f229f27851e205d77fd46487989ad6e44c17c'; //bob
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
  34443: '0xb750c43F9338313c7A8af6922dcA1910Ee3583c8', //mode
  8453: '0xD9E3f9D761f3fC2Adb0DC70E5284494dEc0D7C30', //base
  60808: '0x48F0F46F56C2Ca5def59fd673fF69495b7272Eb0', //bob
  252: '0x0e2269dac22f8e90D48c92237c90829979e42243', //frax
  10: '0x7901d0967596727d68713d39ae8F92501C704826' //optimism
};

/*
const ionTokens: Record<number, Address> = {
  [base.id]: "0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5",
  [optimism.id]: "0x887d1c6A4f3548279c2a8A9D0FA61B5D458d14fC",
  [mode.id]: "0x18470019bf0e94611f15852f7e93cf5d65bc34ca",
  [fraxtal.id]: "0x5BD5c0cB9E4404C63526433BcBd6d133C1d73ffE",
  [bob.id]: "0xb90f229f27851e205d77fd46487989ad6e44c17c"
};
*/
