import { useQuery } from '@tanstack/react-query';

import { useMidas } from '@ui/context/MidasContext';

export const useExtraPoolInfo = (comptrollerAddress?: string) => {
  const { midasSdk, currentChain, address } = useMidas();

  return useQuery(
    ['useExtraPoolInfo', currentChain.id, comptrollerAddress],
    async () => {
      if (!comptrollerAddress) return;

      const comptroller = midasSdk.createComptroller(comptrollerAddress);
      const [
        { 0: admin, 1: upgradeable },
        closeFactor,
        liquidationIncentive,
        enforceWhitelist,
        whitelist,
        pendingAdmin,
        oracle,
      ] = await Promise.all([
        midasSdk.contracts.FusePoolLensSecondary.callStatic.getPoolOwnership(comptrollerAddress),
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
          .then((oracleAddress) => midasSdk.getPriceOracle(oracleAddress)),
      ]);

      return {
        admin,
        upgradeable,
        enforceWhitelist,
        whitelist: whitelist as string[],
        isPowerfulAdmin: admin.toLowerCase() === address.toLowerCase() && upgradeable,
        oracle,
        closeFactor,
        liquidationIncentive,
        pendingAdmin,
        isPendingAdmin: pendingAdmin.toLowerCase() === address.toLowerCase(),
      };
    },
    { enabled: !!comptrollerAddress && comptrollerAddress.length > 0 }
  );
};
