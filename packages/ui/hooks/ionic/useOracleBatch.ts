import { useQueries } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/ionic/useSdk';

import type { Address } from 'viem';

export const useOracleBatch = (
  underlyingAddresses: Address[] | undefined,
  poolChainId?: number
) => {
  const sdk = useSdk(poolChainId);

  const queries = useQueries({
    queries: (underlyingAddresses ?? []).map((address) => ({
      queryKey: ['useOracle', address, sdk?.chainId],
      queryFn: async () => {
        if (address && sdk) {
          try {
            const mpo = sdk.createMasterPriceOracle(
              sdk.publicClient,
              sdk.walletClient as any
            );
            const oracle = await mpo.read.price([address]);
            return { address, oracle };
          } catch (e) {
            console.warn(`Getting oracle error: `, { poolChainId, address }, e);
            return { address, oracle: null };
          }
        }
        return { address, oracle: null };
      },
      enabled: !!address && !!sdk
    }))
  });

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);

  // Create a map of address to oracle
  const oracleMap = queries.reduce(
    (acc, query) => {
      if (query.data) {
        acc[query.data.address] = query.data.oracle;
      }
      return acc;
    },
    {} as Record<Address, any>
  );

  return {
    data: oracleMap,
    isLoading,
    isError,
    queries
  };
};
