import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export type AdjustLeverageMutationParams = {
  address: string;
  leverage: number;
};

export const useAdjustLeverageMutation = () => {
  const { currentSdk } = useMultiIonic();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      address,
      leverage
    }: AdjustLeverageMutationParams): Promise<void> => {
      const tx = await currentSdk?.adjustLeverageRatio(address, leverage);

      if (!tx) {
        throw new Error('Error while adjusting leverage');
      }

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
