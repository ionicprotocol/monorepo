// import { Comptroller } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/Comptroller';
// import { FlywheelStaticRewards } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/FlywheelStaticRewards';
// import { FuseFlywheelCore } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/FuseFlywheelCore';
// import { RewardsDistributorDelegate } from '@midas-capital/sdk/dist/cjs/lib/contracts/typechain/RewardsDistributorDelegate';
// import { useContract } from 'wagmi';

// import { useRari } from '@ui/context/RariContext';

// function createUseFuseContract<T>(
//   contract: string,
//   map: 'chainDeployment' | 'artifacts' = 'chainDeployment'
// ): (address: string) => T {
//   return function (address: string): T {
//     const { fuse } = useRari();
//     return useContract({
//       addressOrName: address,
//       contractInterface: fuse[map][contract].abi,
//     });
//   };
// }

// export const useComptroller = createUseFuseContract<Comptroller>('Comptroller');

// export const useRewardsDistributor = createUseFuseContract<RewardsDistributorDelegate>(
//   'RewardsDistributorDelegate'
// );

// export const useFlywheelCore = createUseFuseContract<FuseFlywheelCore>(
//   'FuseFlywheelCore',
//   'artifacts'
// );

// export const useFlywheelStaticRewards = createUseFuseContract<FlywheelStaticRewards>(
//   'FlywheelStaticRewards',
//   'artifacts'
// );
