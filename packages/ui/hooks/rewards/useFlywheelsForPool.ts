import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { Flywheel } from '@ui/types/ComponentPropsType';

export const useFlywheelsForPool = (comptrollerAddress?: string) => {
  const { currentSdk } = useMultiMidas();

  const queryResult = useQuery(
    ['useFlywheelsForPool', currentSdk?.chainId, comptrollerAddress],
    async () => {
      if (!comptrollerAddress || !currentSdk) return [];

      const flywheelCores = await currentSdk.getFlywheelsByPool(comptrollerAddress);

      if (!flywheelCores.length) return [];

      const flywheels: Flywheel[] = await Promise.all(
        flywheelCores.map(async (flywheel) => {
          // TODO add function to FlywheelLensRouter to get all info in one call
          const [booster, rewards, markets, owner, rewardToken] = await Promise.all([
            flywheel.callStatic.flywheelBooster(),
            flywheel.callStatic.flywheelRewards(),
            flywheel.callStatic.getAllStrategies(),
            flywheel.callStatic.owner(),
            flywheel.callStatic.rewardToken(),
          ]);

          return {
            address: flywheel.address,
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
      enabled: !!comptrollerAddress && !!currentSdk,
    }
  );
  return queryResult;
};
