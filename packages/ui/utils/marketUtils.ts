import { base } from 'viem/chains';

import { REWARDS_TO_SYMBOL } from '@ui/constants';
import type { RewardIcon } from '@ui/hooks/market/useAPRCell';

import type { FlywheelReward } from '@ionicprotocol/types';

type TotalAPRParams = {
  type: 'borrow' | 'supply';
  baseAPR: number;
  rewards?: FlywheelReward[];
  effectiveNativeYield?: number;
  merklAprForOP?: number;
};

const EXCLUDED_REWARD_KEYS = ['ionAPR', 'turtle', 'flywheel'] as const;

export const calculateTotalAPR = ({
  type,
  baseAPR = 0,
  rewards = [],
  effectiveNativeYield,
  merklAprForOP
}: TotalAPRParams): number => {
  let total = type === 'borrow' ? -baseAPR : baseAPR ?? 0;

  const flywheelRewardsAPR =
    rewards?.reduce((acc, reward) => acc + (reward.apy || 0), 0) || 0;

  total += flywheelRewardsAPR;

  if (effectiveNativeYield) total += effectiveNativeYield;
  if (merklAprForOP) total += merklAprForOP;

  return total;
};

export const hasNonIonRewards = (
  rewards: FlywheelReward[] | undefined,
  chainId: number
): boolean => {
  return Boolean(
    rewards?.some(
      (r) =>
        r?.apy && r.apy > 0 && REWARDS_TO_SYMBOL[chainId]?.[r?.token] !== 'ION'
    )
  );
};

export const hasAdditionalRewards = (
  config: Record<string, any> | undefined
): boolean => {
  if (!config) return false;

  const truthyKeys = Object.entries(config)
    .filter(([_, value]) => Boolean(value))
    .map(([key]) => key);

  return truthyKeys.some((key) => !EXCLUDED_REWARD_KEYS.includes(key as any));
};

export const getAdditionalRewardIcons = (
  config: Record<string, any> | undefined,
  effectiveNativeYield: number | undefined,
  asset: string
): string[] => {
  const rewardIcons: string[] = [];

  if (effectiveNativeYield !== undefined) {
    rewardIcons.push(asset.toLowerCase());
  }

  if (config?.lsk) rewardIcons.push('lsk');
  if (config?.op) rewardIcons.push('op');
  if (config?.etherfi) rewardIcons.push('etherfi');
  if (config?.kelp) rewardIcons.push('kelp');
  if (config?.eigenlayer) rewardIcons.push('eigen');
  if (config?.spice) rewardIcons.push('spice');

  return rewardIcons;
};

export const getExtraRewardIcons = (
  config: Record<string, any> | undefined,
  asset: string
): RewardIcon[] => {
  const additionalRewards: RewardIcon[] = [];

  if (config?.fxtl) {
    additionalRewards.push({
      name: 'FXTL',
      icon: '/img/symbols/32/color/frax.png',
      text: `${config.fxtl}x FXTL/hour`
    });
  }

  if (config?.totems) {
    additionalRewards.push({
      name: 'Totems',
      icon: '/images/totem.svg',
      text: `${config.totems}x Totems`
    });
  }

  if (config?.inceptionTurtle) {
    additionalRewards.push({
      name: 'Inception Turtle',
      icon: '/images/inception-turtle.svg',
      text: 'Inception Turtle Points'
    });
  }

  if (config?.etherfi) {
    additionalRewards.push({
      name: 'etherfi',
      icon: '/images/etherfi.png',
      text: `+ ${config.etherfi}x ether.fi Points`
    });
  }

  if (config?.eigenlayer) {
    additionalRewards.push({
      name: 'eigen',
      icon: '/images/eigen.png',
      text: '+ EigenLayer Points'
    });
  }

  if (config?.turtle && asset === 'STONE') {
    additionalRewards.push({
      name: 'stone',
      icon: '/img/symbols/32/color/stone-turtle.png',
      text: '+ Stone Turtle Points'
    });
  }

  if (config?.kelp) {
    additionalRewards.push(
      {
        name: 'kelpmiles',
        icon: '/images/kelpmiles.png',
        text: `+ ${config.kelp}x Kelp Miles`
      },
      {
        name: 'turtle-kelp',
        icon: '/images/turtle-kelp.png',
        text: '+ Turtle Kelp Points'
      }
    );
  }

  if (config?.spice) {
    additionalRewards.push({
      name: 'spice',
      icon: '/img/symbols/32/color/bob.png',
      text: '+ Spice Points'
    });
  }

  return additionalRewards;
};

export type SupportedSupplyVaultChainId = keyof typeof supplyVaultAddresses;

export const supplyVaultAddresses = {
  [base.id]: {
    tokens: {
      WETH: '0x4200000000000000000000000000000000000006',
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    },
    vaults: {
      WETH: '0x9aB2d181E4b87ba57D5eD564D3eF652C4E710707',
      USDC: '0xCd347c1e7d600a9A3e403497562eDd0A7Bc3Ef21'
    }
  }
};

export const VAULT_ADDRESSES = {
  OPTIMIZED_APR_VAULT_BASE:
    '0x1234567890123456789012345678901234567890' as const,
  SECOND_EXTENSION: '0x0987654321098765432109876543210987654321' as const
};

export const VAULT_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'assets', type: 'uint256' }],
    name: 'deposit',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'assets', type: 'uint256' }],
    name: 'withdraw',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'asSecondExtension',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;
