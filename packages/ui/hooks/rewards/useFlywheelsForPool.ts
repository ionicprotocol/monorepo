import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/ionic/useSdk';
import type { Flywheel } from '@ui/types/ComponentPropsType';

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
            flywheel.callStatic.flywheelBooster().catch((e) => {
              console.warn(
                `Getting flywheel booster error: `,
                { chainId: sdk.chainId, flywheelAddress: flywheel.address },
                e
              );

              return '';
            }),
            flywheel.callStatic.flywheelRewards().catch((e) => {
              console.warn(
                `Getting flywheel rewards error: `,
                { chainId: sdk.chainId, flywheelAddress: flywheel.address },
                e
              );

              return '';
            }),
            flywheel.callStatic.getAllStrategies().catch((e) => {
              console.warn(
                `Getting flywheel all strategies error: `,
                { chainId: sdk.chainId, flywheelAddress: flywheel.address },
                e
              );

              return [] as string[];
            }),
            flywheel.callStatic.owner().catch((e) => {
              console.warn(
                `Getting flywheel owner error: `,
                { chainId: sdk.chainId, flywheelAddress: flywheel.address },
                e
              );

              return '';
            }),
            flywheel.callStatic.rewardToken().catch((e) => {
              console.warn(
                `Getting flywheel rewardToken error: `,
                { chainId: sdk.chainId, flywheelAddress: flywheel.address },
                e
              );

              return '';
            })
          ]);

          return {
            address: flywheel.address,
            booster,
            markets,
            owner,
            rewardToken,
            rewards
          };
        })
      );

      return flywheels;
    },
    {
      enabled: !!comptrollerAddress && !!sdk
    }
  );
  return queryResult;
};
