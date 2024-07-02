import type { IonicSdk } from '@ionicprotocol/sdk';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const fetchTokenBalance = async (
  tokenAddress: Address,
  sdk: IonicSdk,
  address?: Address
): Promise<bigint> => {
  let balance = 0n;

  try {
    if (!address) {
      balance = 0n;
    } else if (
      tokenAddress === ('NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS' as Address)
    ) {
      balance = await sdk.publicClient.getBalance({ address });
    } else {
      // const contract = sdk.createCTokenWithExtensions(tokenAddress);
      // balance = await sdk.provider.;
      // console.log(balance);
    }
  } catch (e) {
    console.warn(
      `Fetching token balance error: `,
      { address, chainId: sdk.chainId, tokenAddress },
      e
    );
  }

  return balance;
};

export function useTokenBalance(
  tokenAddress?: Address,
  chainId?: number,
  customAddress?: Address
) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);

  const addressToCheck = customAddress ?? address;

  return useQuery({
    queryKey: ['TokenBalance', tokenAddress, addressToCheck, sdk?.chainId],

    queryFn: async () => {
      if (sdk && tokenAddress && chainId) {
        return await fetchTokenBalance(tokenAddress, sdk, addressToCheck);
      } else {
        return null;
      }
    },

    // gcTime: Infinity,
    // staleTime: Infinity,
    enabled: !!tokenAddress && !!addressToCheck && !!sdk
  });
}
