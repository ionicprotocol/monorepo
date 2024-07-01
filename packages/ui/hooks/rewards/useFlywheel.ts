import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { Flywheel } from '@ui/types/ComponentPropsType';
import { Address } from 'viem';

export const useFlywheel = (flywheelAddress?: Address) => {
  const { currentSdk } = useMultiIonic();

  return useQuery(
    ['useFlywheel', currentSdk?.chainId, flywheelAddress],
    async () => {
      if (!flywheelAddress || !currentSdk) return null;

      const flywheel = currentSdk.createIonicFlywheel(flywheelAddress);

      // TODO add function to FlywheelLensRouter to get all info in one call
      const [booster, rewards, markets, owner, rewardToken] = await Promise.all(
        [
          flywheel.read.flywheelBooster().catch((e) => {
            console.warn(
              `Getting flywheel booster error: `,
              { chainId: currentSdk.chainId, flywheelAddress },
              e
            );

            return '';
          }),
          flywheel.read.flywheelRewards().catch((e) => {
            console.warn(
              `Getting flywheel rewards error: `,
              { chainId: currentSdk.chainId, flywheelAddress },
              e
            );

            return '';
          }),
          flywheel.read.getAllStrategies().catch((e) => {
            console.warn(
              `Getting flywheel all strategies error: `,
              { chainId: currentSdk.chainId, flywheelAddress },
              e
            );

            return [] as string[];
          }),
          flywheel.read.owner().catch((e) => {
            console.warn(
              `Getting flywheel owner error: `,
              { chainId: currentSdk.chainId, flywheelAddress },
              e
            );

            return '';
          }),
          flywheel.read.rewardToken().catch((e) => {
            console.warn(
              `Getting flywheel rewardToken error: `,
              { chainId: currentSdk.chainId, flywheelAddress },
              e
            );

            return '';
          })
        ]
      );

      return {
        address: flywheel.address,
        booster,
        markets,
        owner,
        rewardToken,
        rewards
      } as Flywheel;
    },
    {
      cacheTime: Infinity,
      enabled: !!flywheelAddress && !!currentSdk,
      initialData: undefined,
      staleTime: Infinity
    }
  );
};
