import { useQuery } from 'react-query';

import { useRari } from '@context/RariContext';
import { createComptroller } from '@utils/createComptroller';

export const useExtraPoolInfo = (comptrollerAddress: string) => {
  const { fuse, address } = useRari();

  const { data } = useQuery(comptrollerAddress + ' extraPoolInfo', async () => {
    if (comptrollerAddress) {
      const comptroller = createComptroller(comptrollerAddress, fuse);
      const [
        { 0: admin, 1: upgradeable },
        oracle,
        closeFactor,
        liquidationIncentive,
        enforceWhitelist,
        whitelist,
        pendingAdmin,
      ] = await Promise.all([
        fuse.contracts.FusePoolLensSecondary.callStatic.getPoolOwnership(comptrollerAddress),
        fuse.getPriceOracle(await comptroller.callStatic.oracle()),

        comptroller.callStatic.closeFactorMantissa(),

        comptroller.callStatic.liquidationIncentiveMantissa(),

        (() => {
          return comptroller.callStatic
            .enforceWhitelist()
            .then((x: boolean) => x)
            .catch((_: any) => false);
        })(),

        (() => {
          return comptroller.callStatic
            .getWhitelist()
            .then((x: string[]) => x)
            .catch((_: any) => []);
        })(),

        comptroller.callStatic.pendingAdmin(),
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
      };
    }
  });

  return data;
};
