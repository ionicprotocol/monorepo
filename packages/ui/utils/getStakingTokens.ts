import { base, bob, fraxtal, lisk, mode, optimism } from 'viem/chains';

import {
  BaseContractABI,
  BaseLiquidityContractAdd,
  BaseReservesContractAddr
} from '@ui/constants/baselp';
import {
  LiquidityContractAbi,
  ModeLiquidityContractAddress,
  ModeLpAddressPool
} from '@ui/constants/lp';
import { ModeTradingContractAddress } from '@ui/constants/modetradingfees';
import {
  OPReservesContractAddr,
  OPRouterContractAddr,
  OPStakingContractAddr
} from '@ui/constants/oplp';
import { StakingContractAddress } from '@ui/constants/staking';

import type { Address } from 'viem';

export function getPoolToken(token?: 'eth' | 'mode' | 'op' | 'weth'): Address {
  if (token === 'weth') return '0x4200000000000000000000000000000000000006';
  if (token === 'mode') return '0xDfc7C877a950e49D2610114102175A06C2e3167a';
  return '0x0000000000000000000000000000000000000000';
}

export function getToken(chain: number): Address {
  if (chain === bob.id) return '0xb90f229f27851e205d77fd46487989ad6e44c17c'; //bob
  if (chain === mode.id) return '0x18470019bf0e94611f15852f7e93cf5d65bc34ca'; //mode
  if (chain === base.id) return '0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5'; //base
  if (chain === fraxtal.id) return '0x5BD5c0cB9E4404C63526433BcBd6d133C1d73ffE'; //frax
  if (chain === optimism.id)
    return '0x887d1c6A4f3548279c2a8A9D0FA61B5D458d14fC'; //op
  if (chain === lisk.id) return '0x3f608A49a3ab475dA7fBb167C1Be6b7a45cD7013'; //lisk
  return '0x0000000000000000000000000000000000000000';
}

export function getAvailableStakingToken(
  chain: number,
  token: 'eth' | 'mode' | 'op' | 'weth'
): Address {
  if (chain === mode.id && (token === 'eth' || token === 'weth'))
    return '0xC6A394952c097004F83d2dfB61715d245A38735a';
  if (chain === mode.id && token === 'mode') return ModeLpAddressPool;
  if (chain === base.id && (token === 'eth' || token === 'weth'))
    return BaseReservesContractAddr;
  if (chain === optimism.id && (token === 'eth' || token === 'weth'))
    return OPReservesContractAddr;
  return '0x0000000000000000000000000000000000000000';
}

export function getTradingContractAddress(chain: number): Address {
  if (chain === mode.id) return ModeTradingContractAddress;
  if (chain === base.id) return BaseReservesContractAddr;
  return '0x0000000000000000000000000000000000000000';
}

export function getSpenderContract(chain: number): Address {
  if (chain === mode.id) return ModeLiquidityContractAddress;
  if (chain === base.id) return BaseLiquidityContractAdd;
  if (chain === optimism.id) return OPRouterContractAddr;
  return '0x0000000000000000000000000000000000000000';
}

export function getStakingToContract(
  chain: number,
  token: 'eth' | 'mode' | 'op' | 'weth'
): Address {
  if (chain === mode.id && (token === 'eth' || token === 'weth'))
    return StakingContractAddress;
  if (chain === mode.id && token === 'mode')
    return '0x8EE410cC13948e7e684ebACb36b552e2c2A125fC';
  if (chain === base.id) return '0x9b42e5F8c45222b2715F804968251c747c588fd7';
  if (chain === optimism.id && token === 'eth') return OPStakingContractAddr;
  return '0x0000000000000000000000000000000000000000';
}

//for reserves=========================================================
export function getReservesContract(chain: number): Address {
  if (chain === mode.id) return ModeLiquidityContractAddress;
  if (chain === base.id) return BaseReservesContractAddr;
  if (chain === optimism.id) return OPReservesContractAddr;
  return '0x0000000000000000000000000000000000000000';
}

export function getReservesABI(chain: number) {
  if (chain === optimism.id) {
    return [
      {
        inputs: [],
        name: 'getReserves',
        outputs: [
          { internalType: 'uint256', name: '_reserve0', type: 'uint256' },
          { internalType: 'uint256', name: '_reserve1', type: 'uint256' },
          {
            internalType: 'uint256',
            name: '_blockTimestampLast',
            type: 'uint256'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ];
  }
  if (chain === mode.id) return LiquidityContractAbi;
  if (chain === base.id) return BaseContractABI;
  return LiquidityContractAbi;
}

export function getReservesArgs(
  chain: number,
  token: 'eth' | 'mode' | 'op' | 'weth'
) {
  if (chain === optimism.id || chain === base.id) {
    return [];
  }

  // MODE specific logic - we need to include MODE token case
  if (chain === mode.id) {
    if (token === 'weth' || token === 'eth') {
      return [getToken(chain), getPoolToken('weth'), false];
    }
    if (token === 'mode') {
      // For MODE/ION pair, pass ion token, mode token address, and false for the reverse flag
      return [getToken(chain), getPoolToken('mode'), false];
    }
  }

  return [];
}

//=========================================================
// Bridging Contract address

export const BridgingContractAddress: Record<number, Address> = {
  [mode.id]: '0xb750c43F9338313c7A8af6922dcA1910Ee3583c8', //mode
  [base.id]: '0xD9E3f9D761f3fC2Adb0DC70E5284494dEc0D7C30', //base
  [bob.id]: '0x48F0F46F56C2Ca5def59fd673fF69495b7272Eb0', //bob
  [fraxtal.id]: '0x0e2269dac22f8e90D48c92237c90829979e42243', //frax
  [optimism.id]: '0x7901d0967596727d68713d39ae8F92501C704826', //optimism
  [lisk.id]: '0x14A71B2822663491D98CBB8332bB15Db61c36f7a' //lisk
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
