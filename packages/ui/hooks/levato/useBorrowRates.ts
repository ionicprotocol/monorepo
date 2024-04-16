import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useBorrowRates = (assets: string[]) => {
  const { levatoSdk } = useMultiIonic();

  return useQuery({
    enabled: !!levatoSdk,
    queryFn: async (): Promise<Map<string, string> | undefined> => {
      if (!levatoSdk) {
        throw new Error('Error while fetching borrow rate');
      }

      const borrowRates = await levatoSdk.getAssetsBorrowRates(assets);

      return borrowRates;
    },
    queryKey: ['levato', 'borrowRate', ...assets]
  });
};
