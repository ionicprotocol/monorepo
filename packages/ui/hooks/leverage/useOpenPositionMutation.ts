import { useMutation } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export type OpenPositionMutationParams = {
  borrowMarket: string;
  collateralMarket: string;
  fundingAmount: BigNumber;
  fundingAsset: string;
};

export const useOpenPositionMutation = () => {
  const { currentSdk } = useMultiIonic();

  return useMutation({
    mutationFn: async ({
      borrowMarket,
      collateralMarket,
      fundingAmount,
      fundingAsset
    }: OpenPositionMutationParams) => {
      if (!currentSdk) {
        throw new Error('Error while opening position');
      }

      const tx = await currentSdk.createAndFundPosition(
        collateralMarket,
        borrowMarket,
        fundingAsset,
        fundingAmount
      );

      await tx.wait();
    }
  });
};
