// useHealth.ts
import { useMemo } from 'react';

import { formatEther, maxUint256, parseEther, parseUnits } from 'viem';
import { useChainId } from 'wagmi';

import type { ActiveTab } from '@ui/components/dialogs/manage';
import { HFPStatus } from '@ui/components/dialogs/manage';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

import {
  useHealthFactor,
  useHealthFactorPrediction
} from '../pools/useHealthFactor';

import type { Address } from 'viem';

interface UseHealthProps {
  comptrollerAddress: Address;
  cToken: Address;
  activeTab: ActiveTab;
  amount: bigint;
  exchangeRate: bigint;
  decimals: number;
  updatedAsset?: {
    supplyBalanceFiat: number;
  };
}

export const useHealth = ({
  comptrollerAddress,
  cToken,
  activeTab,
  amount,
  exchangeRate,
  decimals,
  updatedAsset
}: UseHealthProps) => {
  const { address } = useMultiIonic();
  const chainId = useChainId();

  const { data: healthFactor } = useHealthFactor(comptrollerAddress, chainId);

  const {
    data: _predictedHealthFactor,
    isLoading: isLoadingPredictedHealthFactor
  } = useHealthFactorPrediction(
    comptrollerAddress,
    address ?? ('' as Address),
    cToken,
    activeTab === 'withdraw'
      ? (amount * BigInt(1e18)) / exchangeRate
      : parseUnits('0', decimals),
    activeTab === 'borrow' ? amount : parseUnits('0', decimals),
    activeTab === 'repay'
      ? (amount * BigInt(1e18)) / exchangeRate
      : parseUnits('0', decimals)
  );

  const predictedHealthFactor = useMemo<bigint | undefined>(() => {
    if (updatedAsset && updatedAsset?.supplyBalanceFiat < 0.01) {
      return maxUint256;
    }

    if (amount === 0n) {
      return parseEther(healthFactor ?? '0');
    }

    return _predictedHealthFactor;
  }, [_predictedHealthFactor, updatedAsset, amount, healthFactor]);

  const hfpStatus = useMemo<HFPStatus>(() => {
    // If we're loading but have a previous health factor, keep using it
    if (isLoadingPredictedHealthFactor && healthFactor) {
      return healthFactor === '-1'
        ? HFPStatus.NORMAL
        : Number(healthFactor) <= 1.1
          ? HFPStatus.CRITICAL
          : Number(healthFactor) <= 1.2
            ? HFPStatus.WARNING
            : HFPStatus.NORMAL;
    }

    if (!predictedHealthFactor && !healthFactor) {
      return HFPStatus.UNKNOWN;
    }

    if (predictedHealthFactor === maxUint256) {
      return HFPStatus.NORMAL;
    }

    if (updatedAsset && updatedAsset?.supplyBalanceFiat < 0.01) {
      return HFPStatus.NORMAL;
    }

    const predictedHealthFactorNumber = Number(
      formatEther(predictedHealthFactor ?? 0n)
    );

    if (predictedHealthFactorNumber <= 1.1) {
      return HFPStatus.CRITICAL;
    }

    if (predictedHealthFactorNumber <= 1.2) {
      return HFPStatus.WARNING;
    }

    return HFPStatus.NORMAL;
  }, [
    predictedHealthFactor,
    updatedAsset,
    healthFactor,
    isLoadingPredictedHealthFactor
  ]);

  const normalizedHealthFactor = useMemo(() => {
    return healthFactor
      ? healthFactor === '-1'
        ? '∞'
        : Number(healthFactor).toFixed(2)
      : undefined;
  }, [healthFactor]);

  const normalizedPredictedHealthFactor = useMemo(() => {
    return predictedHealthFactor === maxUint256
      ? '∞'
      : Number(formatEther(predictedHealthFactor ?? 0n)).toFixed(2);
  }, [predictedHealthFactor]);

  return {
    hfpStatus,
    healthFactor: {
      current: normalizedHealthFactor ?? '0',
      predicted: normalizedPredictedHealthFactor ?? '0'
    },
    isLoadingPredictedHealthFactor
  };
};
