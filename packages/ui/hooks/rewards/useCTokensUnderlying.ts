import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import type { CTokensUnderlyingMap } from '@ui/types/ComponentPropsType';

export const useCTokensUnderlying = (cTokenAddresses: string[]): CTokensUnderlyingMap => {
  const { currentSdk } = useMultiMidas();

  const { data: cTokensUnderlying } = useQuery(
    ['useCTokensUnderlying', cTokenAddresses?.sort().join(','), currentSdk?.chainId],
    async () => {
      const _map: CTokensUnderlyingMap = {};
      if (cTokenAddresses && cTokenAddresses.length && currentSdk) {
        await Promise.all(
          cTokenAddresses.map(async (cTokenAddress) => {
            const cTokenInstance = currentSdk.createCTokenWithExtensions(cTokenAddress);
            _map[cTokenAddress] = await cTokenInstance.callStatic.underlying();
          })
        );
      }

      return _map;
    },
    {
      cacheTime: Infinity,
      enabled: cTokenAddresses.length > 0 && !!currentSdk,
      staleTime: Infinity,
    }
  );

  return cTokensUnderlying ?? {};
};
