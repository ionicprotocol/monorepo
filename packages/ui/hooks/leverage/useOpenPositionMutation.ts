import { useMutation } from '@tanstack/react-query';
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
    }
  });
};
