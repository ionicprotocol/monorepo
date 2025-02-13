import { formatEther } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';

import { useEthPrice } from '../useEthPrice';

import type { Address } from 'viem';

import {
  emissionsManagerAbi,
  veIonAbi,
  veIonFirstExtensionAbi
} from '@ionicprotocol/sdk';

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

  const { data, isLoading: contractsLoading } = useReadContracts({
    contracts: [
      {
        address: veIonContract,
        abi: veIonAbi,
        functionName: 'veIONFirstExtension'
      },
      {
        address: emissionsManagerContract,
        abi: emissionsManagerAbi,
        functionName: 'getUserTotalCollateral',
        args: address ? [address] : undefined
      }
    ]
  });

  const { data: tokenValue, isLoading: tokenValueLoading } = useReadContract({
    address: data?.[0]?.result,
    abi: veIonFirstExtensionAbi,
    functionName: 'getTotalEthValueOfTokens',
    args: address ? [address] : undefined
  });

  const isLoading = contractsLoading || tokenValueLoading;

  if (!data || !address || !tokenValue) {
    return {
      lockedVeIon: { amount: 0, usdValue: '0', percentage: 0 },
      totalDeposits: { amount: 0, usdValue: '0' },
      isLoading
    };
  }

  const [_, totalCollateral] = data;

  // Calculate values in ETH
  const lockedVeIonAmount = Number(formatEther(tokenValue));
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
