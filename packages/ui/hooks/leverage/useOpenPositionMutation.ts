import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export type OpenPositionMutationParams = {
  borrowMarket: string;
  collateralMarket: string;
  fundingAmount: BigNumber;
  fundingAsset: string;
  leverage: BigNumber;
};

export const useOpenPositionMutation = () => {
  const { currentSdk } = useMultiIonic();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      borrowMarket,
      collateralMarket,
      fundingAmount,
      fundingAsset,
      leverage
    }: OpenPositionMutationParams) => {
      if (!currentSdk) {
        throw new Error('Error while opening position');
      }

      const tx = await currentSdk.createAndFundPositionAtRatio(
        collateralMarket,
        borrowMarket,
        fundingAsset,
        fundingAmount,
        leverage
      );

      await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['useCurrentLeverageRatio'] });
      queryClient.invalidateQueries({ queryKey: ['useGetNetApy'] });
      queryClient.invalidateQueries({ queryKey: ['usePositionInfo'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['useMaxSupplyAmount'] });
    }
  });
};
