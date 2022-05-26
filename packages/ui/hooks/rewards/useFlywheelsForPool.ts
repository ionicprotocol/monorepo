import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';
import { Flywheel } from '@ui/types/ComponentPropsType';

export const useFlywheelsForPool = (comptrollerAddress?: string) => {
  const { fuse, currentChain } = useRari();

  const queryResult = useQuery(
    ['useFlywheelsForPool', currentChain.id, comptrollerAddress],
    async () => {
      if (!comptrollerAddress) return [];
      if (!fuse) return [];

      const flywheelCores = await fuse.getFlywheelsByPool(comptrollerAddress, {
        from: await fuse.provider.getSigner().getAddress(),
      });

      if (!flywheelCores.length) return [];

      const flywheels: Flywheel[] = await Promise.all(
        flywheelCores.map(async (flywheel) => {
          // TODO add function to FlywheelLensRouter to get all info in one call
          const [authority, booster, rewards, markets, owner, rewardToken] = await Promise.all([
            flywheel.callStatic.authority(),
            flywheel.callStatic.flywheelBooster(),
            flywheel.callStatic.flywheelRewards(),
            flywheel.callStatic.getAllStrategies(),
            flywheel.callStatic.owner(),
            flywheel.callStatic.rewardToken(),
          ]);

          return {
            address: flywheel.address,
            authority,
            booster,
            owner,
            rewards,
            rewardToken,
            markets,
          };
        })
      );

      return flywheels;
    },
    {
      initialData: [],
      enabled: !!comptrollerAddress && !!currentChain && !!fuse,
    }
  );
  return queryResult;
};
