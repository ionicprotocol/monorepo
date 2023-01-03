import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useExtraPoolInfo = (comptrollerAddress?: string, poolChainId?: number) => {
  const { address } = useMultiMidas();
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useExtraPoolInfo', comptrollerAddress, sdk?.chainId, address],
    async () => {
      if (!comptrollerAddress || !sdk) {
        return null;
      }

      const comptroller = sdk.getComptrollerInstance(comptrollerAddress);

      const [
        { 0: admin, 1: upgradeable },
        closeFactor,
        liquidationIncentive,
        enforceWhitelist,
        whitelist,
        pendingAdmin,
        oracle,
      ] = await Promise.all([
        sdk.contracts.FusePoolLensSecondary.callStatic.getPoolOwnership(comptrollerAddress),
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
        comptroller.callStatic.oracle().then((oracleAddress) => sdk.getPriceOracle(oracleAddress)),
      ]);

      return {
        admin,
        upgradeable,
        enforceWhitelist,
        whitelist: whitelist as string[],
        isPowerfulAdmin: admin.toLowerCase() === address?.toLowerCase() && upgradeable,
        oracle,
        closeFactor,
        liquidationIncentive,
        pendingAdmin,
        isPendingAdmin: pendingAdmin.toLowerCase() === address?.toLowerCase(),
      };
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!comptrollerAddress && comptrollerAddress.length > 0 && !!sdk,
    }
  );
};
