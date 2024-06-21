import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/ionic/useSdk';

export const useIsUpgradeable = (
  comptrollerAddress: string,
  poolChainId: number
) => {
  const sdk = useSdk(poolChainId);

  const { data } = useQuery({
    queryKey: ['useIsUpgradeable', comptrollerAddress, sdk?.chainId],

    queryFn: async () => {
      if (sdk) {
        try {
          const comptroller = sdk.createComptroller(comptrollerAddress);
          const isUpgradeable: boolean =
            await comptroller.callStatic.adminHasRights();

          return isUpgradeable;
        } catch (e) {
          console.warn(
            `Checking upgradeable error: `,
            { comptrollerAddress, poolChainId },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },

    enabled: !!comptrollerAddress && !!sdk
  });

  return data;
};
