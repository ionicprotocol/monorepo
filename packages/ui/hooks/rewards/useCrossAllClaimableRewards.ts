import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { SupportedChains } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useCrossAllClaimableRewards = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiMidas();

  return useQuery(
    ['useCrossAllClaimableRewards', address, chainIds],
    async () => {
      const result = await Promise.all(
        chainIds.map(async (chainId) => {
          try {
            const sdk = getSdk(Number(chainId));

            if (sdk && address) {
              return { [chainId.toString()]: await sdk.getFlywheelClaimableRewards(address) };
            } else {
              return { [chainId.toString()]: null };
            }
          } catch (e) {
            console.warn('unable to fetch rewards for chainid: ', chainId);

            return { [chainId.toString()]: null };
          }
        })
      );

      const rewardsPerChain: { [chainId: string]: FlywheelClaimableRewards[] | null } =
        Object.assign({}, ...result);

      return rewardsPerChain;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: chainIds.length > 0,
    }
  );
};
