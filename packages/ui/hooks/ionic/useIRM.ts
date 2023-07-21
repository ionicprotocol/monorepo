import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/ionic/useSdk';

export const useIRM = (cTokenAddress?: string, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useIRM', cTokenAddress, sdk?.chainId],
    async () => {
      if (cTokenAddress && sdk) {
        try {
          const cToken = sdk.createICErc20(cTokenAddress);

          const irm = await cToken.callStatic.interestRateModel();

          return irm;
        } catch (e) {
          console.warn(`Getting IRM error: `, { cTokenAddress, poolChainId }, e);

          return null;
        }
      } else {
        return null;
      }
    },
    {
      enabled: !!cTokenAddress && !!sdk
    }
  );
};
