import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { Flywheel } from '@ui/types/ComponentPropsType';

export const useFlywheelsForPool = (comptrollerAddress?: string, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  const queryResult = useQuery(
    ['useFlywheelsForPool', sdk?.chainId, comptrollerAddress],
    async () => {
      if (!comptrollerAddress || !sdk) return [];

      const flywheelCores = await sdk.getFlywheelsByPool(comptrollerAddress);

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
      cacheTime: Infinity,
      staleTime: Infinity,
      initialData: [],
      enabled: !!comptrollerAddress && !!sdk,
    }
  );
  return queryResult;
};
