import type { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import type { SupportedChains } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useCrossAllClaimableRewards = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiMidas();

  return useQuery(
    ['useCrossAllClaimableRewards', address, chainIds],
    async () => {
      if (address) {
        const result = await Promise.all(
          chainIds.map(async (chainId) => {
            try {
              const sdk = getSdk(Number(chainId));

              if (sdk) {
                return { [chainId.toString()]: await sdk.getFlywheelClaimableRewards(address) };
              } else {
                throw new Error('sdk not available');
              }
            } catch (e) {
              console.warn('unable to fetch rewards for chainId: ', chainId, e);

              return { [chainId.toString()]: null };
            }
          })
        );

        const rewardsPerChain: { [chainId: string]: FlywheelClaimableRewards[] | null } =
          Object.assign({}, ...result);

        return rewardsPerChain;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: chainIds.length > 0 && !!address,
      staleTime: Infinity,
    }
  );
};
