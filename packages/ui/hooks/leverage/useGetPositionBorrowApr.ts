import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export type UseGetPositionBorrowAprParams = {
  amount: bigint;
  borrowMarket: Address;
  collateralMarket: Address;
  leverage: bigint;
};

export const useGetPositionBorrowApr = ({
  amount,
  borrowMarket,
  collateralMarket,
  leverage
}: UseGetPositionBorrowAprParams) => {
  const { currentSdk } = useMultiIonic();

  return useQuery({
    enabled: !!currentSdk,
    queryFn: async () => {
      const data = await currentSdk?.getPositionBorrowApr(
        collateralMarket,
        borrowMarket,
        leverage,
        amount
      );

      return data;
    },
    queryKey: [
      'positions',
      'borrow',
      'apr',
      collateralMarket,
      borrowMarket,
      amount.toString(),
      leverage.toString()
    ]
  });
};
