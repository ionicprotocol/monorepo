import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useExtraPoolInfo = (
  comptrollerAddress?: string,
  poolChainId?: number
) => {
  const { address } = useMultiIonic();
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: ['useExtraPoolInfo', comptrollerAddress, sdk?.chainId, address],

    queryFn: async () => {
      if (!comptrollerAddress || !sdk) {
        return null;
      }

      try {
        const comptroller = sdk.createComptroller(comptrollerAddress);

        const [
          { 0: admin, 1: upgradeable },
          closeFactor,
          liquidationIncentive,
          enforceWhitelist,
          whitelist,
          pendingAdmin,
          oracle
        ] = await Promise.all([
          sdk.contracts.PoolLensSecondary.callStatic.getPoolOwnership(
            comptrollerAddress
          ),
          comptroller.callStatic.closeFactorMantissa(),
          comptroller.callStatic.liquidationIncentiveMantissa(),
          comptroller.callStatic
            .enforceWhitelist()
            .then((x: boolean) => x)
            .catch(() => false),
          comptroller.callStatic
            .getWhitelist()
            .then((x: string[]) => x)
            .catch(() => []),
          comptroller.callStatic.pendingAdmin(),
          comptroller.callStatic
            .oracle()
            .then((oracleAddress) => sdk.getPriceOracle(oracleAddress))
        ]);

        return {
          admin,
          closeFactor,
          enforceWhitelist,
          isPendingAdmin: pendingAdmin.toLowerCase() === address?.toLowerCase(),
          isPowerfulAdmin:
            admin.toLowerCase() === address?.toLowerCase() && upgradeable,
          liquidationIncentive,
          oracle,
          pendingAdmin,
          upgradeable,
          whitelist: whitelist as string[]
        };
      } catch (e) {
        console.warn(
          `Getting extra pool info error: `,
          { comptrollerAddress, poolChainId },
          e
        );

        return null;
      }
    },

    gcTime: Infinity,
    enabled: !!comptrollerAddress && comptrollerAddress.length > 0 && !!sdk,
    staleTime: Infinity
  });
};
