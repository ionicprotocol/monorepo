import { useQuery } from '@tanstack/react-query';
import { formatEther, maxUint256 } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';

import type { Address } from 'viem';

export const useHealthFactor = (pool?: Address, chainId?: number) => {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: ['useHealthFactor', sdk?.chainId, pool],

    queryFn: async () => {
      if (sdk && pool && address) {
        const healthFactor = await sdk.getHealthFactor(address, pool);

        if (healthFactor === maxUint256) {
          return '-1';
        }

        return Number(formatEther(healthFactor)).toFixed(2);
      }

      return null;
    },

    enabled: !!pool && !!chainId && !!address
  });
};

export const useHealthFactorPrediction = (
  pool: Address,
  account: Address,
  cTokenModify: Address,
  redeemTokens: bigint,
  borrowAmount: bigint,
  repayAmount: bigint
) => {
  const { address, currentSdk } = useMultiIonic();

  return useQuery({
    enabled: !!address && !!currentSdk,
    queryFn: async (): Promise<bigint> => {
      if (!currentSdk || !address) {
        throw new Error('Error while predicting health factor!');
      }

      const predictedHealthFactor = currentSdk.getHealthFactorPrediction(
        pool,
        account,
        cTokenModify,
        redeemTokens,
        borrowAmount,
        repayAmount
      );

      return predictedHealthFactor;
    },
    queryKey: [
      'healthFactor',
      'prediction',
      pool,
      address,
      cTokenModify,
      redeemTokens,
      borrowAmount,
      repayAmount
    ]
  });
};
