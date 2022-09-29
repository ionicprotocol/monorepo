import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useExtraPoolInfo = (comptrollerAddress?: string) => {
  const { currentSdk, address } = useMultiMidas();

  return useQuery(
    ['useExtraPoolInfo', comptrollerAddress, currentSdk?.chainId],
    async () => {
      if (!comptrollerAddress || !currentSdk || !address) return;

      const comptroller = currentSdk.createComptroller(comptrollerAddress);
      const [
        { 0: admin, 1: upgradeable },
        closeFactor,
        liquidationIncentive,
        enforceWhitelist,
        whitelist,
        pendingAdmin,
        oracle,
      ] = await Promise.all([
        currentSdk.contracts.FusePoolLensSecondary.callStatic.getPoolOwnership(comptrollerAddress),
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
          .then((oracleAddress) => currentSdk.getPriceOracle(oracleAddress)),
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
    {
      enabled: !!comptrollerAddress && comptrollerAddress.length > 0 && !!address && !!currentSdk,
    }
  );
};
