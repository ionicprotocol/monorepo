import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { utils } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useUpdatedNetApyAfterFunding(
  positionAddress: string,
  amount: BigNumber | null | undefined,
  supplyApy?: BigNumber,
  chainId?: number
) {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useUpdatedNetApyAfterFunding', positionAddress, supplyApy, amount, sdk?.chainId],
    async () => {
      if (sdk && supplyApy !== undefined && amount && positionAddress) {
        const netApy = await sdk
          .getNetApyForPositionAfterFunding(positionAddress, supplyApy, amount)
          .catch((e) => {
            console.warn(
              `Getting updated net apy error: `,
              {
                amount,
                chainId,
                positionAddress,
                supplyApy,
              },
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
      enabled: !!sdk && supplyApy !== undefined && !!amount && !!positionAddress,
    }
  );
}
