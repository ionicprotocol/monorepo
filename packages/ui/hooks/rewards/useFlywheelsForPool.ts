import { useQuery } from 'react-query';

import { useMidas } from '@ui/context/MidasContext';
import { Flywheel } from '@ui/types/ComponentPropsType';

export const useFlywheelsForPool = (comptrollerAddress?: string) => {
  const { midasSdk, currentChain } = useMidas();

  const queryResult = useQuery(
    ['useFlywheelsForPool', currentChain.id, comptrollerAddress],
    async () => {
      if (!comptrollerAddress) return [];
      if (!midasSdk) return [];

      const flywheelCores = await midasSdk.getFlywheelsByPool(comptrollerAddress);

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
      enabled: !!comptrollerAddress && !!currentChain && !!midasSdk,
    }
  );
  return queryResult;
};
