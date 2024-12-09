import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { Address } from 'viem';

interface UseBalancePollingProps {
  address?: Address;
  chainId: number;
  txHash?: Address;
  enabled: boolean;
  onSuccess?: () => void;
  interval?: number;
  timeout?: number;
}

export const useBalancePolling = ({
  address,
  chainId,
  txHash,
  enabled,
  onSuccess,
  interval = 3000,
  timeout = 30000
}: UseBalancePollingProps) => {
  const [isPolling, setIsPolling] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !txHash || !address) return;

    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const startPolling = () => {
      setIsPolling(true);

      intervalId = setInterval(async () => {
        await queryClient.invalidateQueries({ queryKey: ['useFusePoolData'] });
        await queryClient.invalidateQueries({
          queryKey: ['useUpdatedUserAssets']
        });
        await queryClient.invalidateQueries({
          queryKey: ['useMaxSupplyAmount']
        });
        await queryClient.invalidateQueries({
          queryKey: ['useMaxWithdrawAmount']
        });
        await queryClient.invalidateQueries({
          queryKey: ['useMaxBorrowAmount']
        });
        await queryClient.invalidateQueries({
          queryKey: ['useMaxRepayAmount']
        });
      }, interval);

      timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        setIsPolling(false);
        onSuccess?.();
      }, timeout);
    };

    startPolling();

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      setIsPolling(false);
    };
  }, [
    address,
    chainId,
    txHash,
    enabled,
    interval,
    timeout,
    onSuccess,
    queryClient
  ]);

  return { isPolling };
};
