import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export type UseGetPositionBorrowAprParams = {
  amount: BigNumber;
  borrowMarket: string;
  collateralMarket: string;
  leverage: BigNumber;
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
