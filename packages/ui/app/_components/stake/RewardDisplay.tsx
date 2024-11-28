import Image from 'next/image';
import { base, mode, optimism } from 'viem/chains';
import { BaseSugarAddress } from '@ui/constants/baselp';
import { ModeSugarAddress } from '@ui/constants/lp';
import { OPSugarAddress } from '@ui/constants/oplp';
import useSugarAPR from '@ui/hooks/useSugarAPR';

type ChainConfig = {
  poolIndex: bigint;
  sugarAddress: `0x${string}`;
  rewardToken: {
    name: string;
    logo: string;
  };
};

type ChainConfigs = {
  [key: number]: {
    defaultConfig: ChainConfig;
    tokenConfigs?: {
      [key: string]: ChainConfig;
    };
  };
};

export const CHAIN_CONFIGS: ChainConfigs = {
  [mode.id]: {
    defaultConfig: {
      poolIndex: 6n,
      sugarAddress: ModeSugarAddress,
      rewardToken: {
        name: 'Velodrome',
        logo: '/img/symbols/32/color/velo.png'
      }
    },
    tokenConfigs: {
      mode: {
        poolIndex: 26n,
        sugarAddress: ModeSugarAddress,
        rewardToken: {
          name: 'Velodrome',
          logo: '/img/symbols/32/color/velo.png'
        }
      }
    }
  },
  [optimism.id]: {
    defaultConfig: {
      poolIndex: 910n,
      sugarAddress: OPSugarAddress,
      rewardToken: {
        name: 'Velodrome',
        logo: '/img/symbols/32/color/velo.png'
      }
    }
  },
  [base.id]: {
    defaultConfig: {
      poolIndex: 1489n,
      sugarAddress: BaseSugarAddress,
      rewardToken: {
        name: 'Aerodrome',
        logo: '/img/logo/AERO.png'
      }
    }
  }
};

type RewardDisplayProps = {
  chainId: number;
  isUnstaking?: boolean;
  selectedToken?: 'eth' | 'mode' | 'weth';
};

export default function RewardDisplay({
  chainId,
  isUnstaking = false,
  selectedToken = 'eth'
}: RewardDisplayProps) {
  const chainConfig = CHAIN_CONFIGS[chainId];

  const config =
    chainConfig.tokenConfigs?.[selectedToken] || chainConfig.defaultConfig;

  const { apr } = useSugarAPR({
    sugarAddress: config.sugarAddress,
    poolIndex: config.poolIndex,
    chainId,
    selectedToken,
    isMode: chainId === mode.id
  });

  if (!chainConfig) return null;

  return (
    <div className="flex items-center w-full mt-3 text-xs gap-2">
      <div className="w-6 h-6 relative flex-shrink-0">
        <Image
          alt={`${config.rewardToken.name} logo`}
          src={config.rewardToken.logo}
          fill
          className="object-contain"
          sizes="24px"
        />
      </div>
      <span>{config.rewardToken.name} APR</span>
      <span className={`text-accent ${isUnstaking && 'text-red-500'} ml-auto`}>
        {apr}
      </span>
    </div>
  );
}
