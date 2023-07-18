import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { utils } from 'ethers';

import { useSdk } from '@ui/hooks/ionic/useSdk';

export function useGetNetApy(
  collateralMarket: string,
  borrowableMarket: string,
  amount: BigNumber | null | undefined,
  leverageRatio: number | null | undefined,
  supplyApy?: BigNumber,
  chainId?: number
) {
  const sdk = useSdk(chainId);

  return useQuery(
    [
      'useGetNetApy',
      supplyApy,
      amount,
      collateralMarket,
      borrowableMarket,
      leverageRatio,
      sdk?.chainId
    ],
    async () => {
      if (sdk && supplyApy !== undefined && amount && leverageRatio) {
        const netApy = await sdk
          .getNetAPY(
            supplyApy,
            amount,
            collateralMarket,
            borrowableMarket,
            utils.parseUnits(leverageRatio.toString())
          )
          .catch((e) => {
            console.warn(
              `Getting net apy error: `,
              { amount, borrowableMarket, collateralMarket, leverageRatio, supplyApy },
              e
            );

            return null;
          });

        return netApy ? Number(utils.formatUnits(netApy)) * 100 : null;
      } else {
        return null;
      }
    },
    {
      enabled: !!sdk && supplyApy !== undefined && !!amount && !!leverageRatio
    }
  );
}
