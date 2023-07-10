import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { Flywheel } from '@ui/types/ComponentPropsType';

export const useFlywheel = (flywheelAddress?: string) => {
  const { currentSdk } = useMultiIonic();

  return useQuery(
    ['useFlywheel', currentSdk?.chainId, flywheelAddress],
    async () => {
      if (!flywheelAddress || !currentSdk) return null;

      const flywheel = currentSdk.createMidasFlywheel(flywheelAddress);

      // TODO add function to FlywheelLensRouter to get all info in one call
      const [booster, rewards, markets, owner, rewardToken] = await Promise.all([
        flywheel.callStatic.flywheelBooster().catch((e) => {
          console.warn(
            `Getting flywheel booster error: `,
            { chainId: currentSdk.chainId, flywheelAddress },
            e
          );

          return '';
        }),
        flywheel.callStatic.flywheelRewards().catch((e) => {
          console.warn(
            `Getting flywheel rewards error: `,
            { chainId: currentSdk.chainId, flywheelAddress },
            e
          );

          return '';
        }),
        flywheel.callStatic.getAllStrategies().catch((e) => {
          console.warn(
            `Getting flywheel all strategies error: `,
            { chainId: currentSdk.chainId, flywheelAddress },
            e
          );

          return [] as string[];
        }),
        flywheel.callStatic.owner().catch((e) => {
          console.warn(
            `Getting flywheel owner error: `,
            { chainId: currentSdk.chainId, flywheelAddress },
            e
          );

          return '';
        }),
        flywheel.callStatic.rewardToken().catch((e) => {
          console.warn(
            `Getting flywheel rewardToken error: `,
            { chainId: currentSdk.chainId, flywheelAddress },
            e
          );

          return '';
        }),
      ]);

      return {
        address: flywheel.address,
        booster,
        markets,
        owner,
        rewardToken,
        rewards,
      } as Flywheel;
    },
    {
      enabled: !!flywheelAddress && !!currentSdk,
      initialData: undefined,
    }
  );
};
