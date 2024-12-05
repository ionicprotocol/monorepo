import { formatEther } from 'viem';
import { useReadContracts } from 'wagmi';

import { useEthPrice } from '../useEthPrice';

import type { Address } from 'viem';

import { emissionsManagerAbi, veIonAbi } from '@ionicprotocol/sdk';

interface EmissionsDataProps {
  address?: Address;
  veIonContract: Address;
  emissionsManagerContract: Address;
}

interface EmissionsData {
  lockedVeIon: {
    amount: number;
    usdValue: string;
    percentage: number;
  };
  totalDeposits: {
    amount: number;
    usdValue: string;
  };
  isLoading: boolean;
}

export function useEmissionsData({
  address,
  veIonContract,
  emissionsManagerContract
}: EmissionsDataProps): EmissionsData {
  const { data: ethPrice = 0 } = useEthPrice();

  const { data, isLoading } = useReadContracts({
    contracts: [
      // Get total ETH value of locked veION tokens
      {
        address: veIonContract,
        abi: veIonAbi,
        functionName: 'getTotalEthValueOfTokens',
        args: address ? [address] : undefined
      },
      // Get total collateral value
      {
        address: emissionsManagerContract,
        abi: emissionsManagerAbi,
        functionName: 'getUserTotalCollateral',
        args: address ? [address] : undefined
      }
    ]
  });

  if (!data || !address) {
    return {
      lockedVeIon: { amount: 0, usdValue: '0', percentage: 0 },
      totalDeposits: { amount: 0, usdValue: '0' },
      isLoading
    };
  }

  const [veIonValue, totalCollateral] = data;

  // Calculate values in ETH
  const lockedVeIonAmount = veIonValue?.result
    ? Number(formatEther(veIonValue.result))
    : 0;
  const totalDepositsAmount = totalCollateral?.result
    ? Number(formatEther(totalCollateral.result))
    : 0;

  // Calculate USD values
  const lockedVeIonUsd = (lockedVeIonAmount * ethPrice).toFixed(2);
  const totalDepositsUsd = (totalDepositsAmount * ethPrice).toFixed(2);

  // Calculate percentage
  const percentage =
    totalDepositsAmount > 0
      ? (lockedVeIonAmount / totalDepositsAmount) * 100
      : 0;

  return {
    lockedVeIon: {
      amount: lockedVeIonAmount,
      usdValue: lockedVeIonUsd,
      percentage
    },
    totalDeposits: {
      amount: totalDepositsAmount,
      usdValue: totalDepositsUsd
    },
    isLoading
  };
}
