import { useQuery } from '@tanstack/react-query';

import { useMidas } from '@ui/context/MidasContext';
import { CTokensUnderlyingMap } from '@ui/types/ComponentPropsType';

export const useCTokensUnderlying = (cTokenAddresses: string[]): CTokensUnderlyingMap => {
  const { midasSdk, currentChain } = useMidas();

  const { data: cTokensUnderlying } = useQuery(
    ['useCTokensUnderlying', currentChain.id, cTokenAddresses?.join(',')],
    async () => {
      const _map: CTokensUnderlyingMap = {};
      if (cTokenAddresses && cTokenAddresses.length) {
        await Promise.all(
          cTokenAddresses.map(async (cTokenAddress) => {
            const cTokenInstance = midasSdk.createCToken(cTokenAddress);
            _map[cTokenAddress] = await cTokenInstance.callStatic.underlying();
          })
        );
      }

      return _map;
    }
  );

  return cTokensUnderlying ?? {};
};
