import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';

export const useExtraPoolInfo = (
  comptrollerAddress?: Address,
  poolChainId?: number
) => {
  const { address } = useMultiIonic();
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useExtraPoolInfo', comptrollerAddress, sdk?.chainId, address],
    async () => {
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
          sdk.contracts.PoolLensSecondary.read.getPoolOwnership([
            comptrollerAddress
          ]),
          comptroller.read.closeFactorMantissa(),
          comptroller.read.liquidationIncentiveMantissa(),
          comptroller.read
            .enforceWhitelist()
            .then((x: boolean) => x)
            .catch(() => false),
          comptroller.read
            .getWhitelist()
            .then((x: readonly Address[]) => x)
            .catch(() => []),
          comptroller.read.pendingAdmin(),
          comptroller.read
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
    {
      enabled: !!comptrollerAddress && comptrollerAddress.length > 0 && !!sdk
    }
  );
};
