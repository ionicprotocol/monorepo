import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/ionic/useSdk';

export const useTotalReserves = (cTokenAddress?: string, chainId?: number) => {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useTotalReserves', cTokenAddress, sdk?.chainId],
    async () => {
      if (cTokenAddress && sdk) {
        try {
          const cToken = sdk.createICErc20(cTokenAddress);
          const [totalReserves] = await Promise.all([
            cToken.callStatic.totalReserves()
          ]);

          return totalReserves;
        } catch (e) {
          console.warn(
            `Getting total reserves data error: `,
            { cTokenAddress, chainId },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },
    {
      enabled: !!cTokenAddress && !!sdk
    }
  );
};
