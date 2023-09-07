import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';

export const useHealthFactor = (pool?: string, chainId?: number) => {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);

  return useQuery(
    ['useHealthFactor', sdk?.chainId, pool],
    async () => {
      if (sdk && pool && address) {
        const healthFactor = await sdk.getHealthFactor(address, pool);

        if (healthFactor.gt(constants.WeiPerEther)) {
          return '-1';
        }

        return Number(utils.formatUnits(healthFactor)).toFixed(2);
      }

      return null;
    },
    {
      enabled: !!pool && !!chainId && !!address
    }
  );
};
