import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import type { Flywheel } from '@ui/types/ComponentPropsType';

export const useFlywheelsForPool = (
  comptrollerAddress?: Address,
  poolChainId?: number
) => {
  const sdk = useSdk(poolChainId);

  const queryResult = useQuery({
    queryKey: ['useFlywheelsForPool', sdk?.chainId, comptrollerAddress],

    queryFn: async () => {
      if (!comptrollerAddress || !sdk) return [];

      const flywheelCores = await sdk.getFlywheelsByPool(comptrollerAddress);

      if (!flywheelCores.length) return [];

      const flywheels: Flywheel[] = (await Promise.all(
        flywheelCores.map(async (flywheel) => {
          // TODO add function to FlywheelLensRouter to get all info in one call
          const [booster, rewards, markets, owner, rewardToken] =
            await Promise.all([
              flywheel.read.flywheelBooster().catch((e) => {
                console.warn(
                  `Getting flywheel booster error: `,
                  { chainId: sdk.chainId, flywheelAddress: flywheel.address },
                  e
                );

                return '' as Address;
              }),
              flywheel.read.flywheelRewards().catch((e) => {
                console.warn(
                  `Getting flywheel rewards error: `,
                  { chainId: sdk.chainId, flywheelAddress: flywheel.address },
                  e
                );

                return '' as Address;
              }),
              flywheel.read.getAllStrategies().catch((e) => {
                console.warn(
                  `Getting flywheel all strategies error: `,
                  { chainId: sdk.chainId, flywheelAddress: flywheel.address },
                  e
                );

                return [] as Address[];
              }),
              flywheel.read.owner().catch((e) => {
                console.warn(
                  `Getting flywheel owner error: `,
                  { chainId: sdk.chainId, flywheelAddress: flywheel.address },
                  e
                );

                return '' as Address;
              }),
              flywheel.read.rewardToken().catch((e) => {
                console.warn(
                  `Getting flywheel rewardToken error: `,
                  { chainId: sdk.chainId, flywheelAddress: flywheel.address },
                  e
                );

                return '' as Address;
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
      )) as Flywheel[];

      return flywheels;
    },

    gcTime: Infinity,
    enabled: !!comptrollerAddress && !!sdk,
    staleTime: Infinity
  });
  return queryResult;
};
