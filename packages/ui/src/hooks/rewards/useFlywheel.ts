import { useRari } from '@context/RariContext';
import { Flywheel } from '@type/ComponentPropsType';
import { useQuery } from 'react-query';

export const useFlywheel = (flywheelAddress?: string) => {
  const { fuse, currentChain } = useRari();

  return useQuery(
    ['useFlywheel', currentChain.id, flywheelAddress],
    async () => {
      if (!flywheelAddress) return undefined;
      if (!fuse) return undefined;

      const flywheel = fuse.createFuseFlywheelCore(flywheelAddress);

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
      } as Flywheel;
    },
    {
      initialData: undefined,
      enabled: !!flywheelAddress && !!currentChain && !!fuse,
    }
  );
};
