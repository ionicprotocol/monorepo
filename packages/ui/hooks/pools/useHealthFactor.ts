import { useQuery } from '@tanstack/react-query';
import type { BigNumber, BigNumberish } from 'ethers';
import { constants, utils } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';

export const useHealthFactor = (pool?: string, chainId?: number) => {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: ['useHealthFactor', sdk?.chainId, pool],

    queryFn: async () => {
      if (sdk && pool && address) {
        const healthFactor = await sdk.getHealthFactor(address, pool);

        if (healthFactor.eq(constants.MaxUint256)) {
          return '-1';
        }

        return Number(utils.formatUnits(healthFactor)).toFixed(2);
      }

      return null;
    },

    enabled: !!pool && !!chainId && !!address
  });
};

export const useHealthFactorPrediction = (
  pool: string,
  account: string,
  cTokenModify: string,
  redeemTokens: BigNumberish,
  borrowAmount: BigNumberish,
  repayAmount: BigNumberish
) => {
  const { address, currentSdk } = useMultiIonic();

  return useQuery({
    enabled: !!address && !!currentSdk,
    queryFn: async (): Promise<BigNumber> => {
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
