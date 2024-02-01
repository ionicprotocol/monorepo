import type { IonicSdk } from '@ionicprotocol/sdk';
import { useQuery } from '@tanstack/react-query';
import { BigNumber, constants } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useBalance } from 'wagmi';

export const fetchTokenBalance = async (
  tokenAddress: string,
  sdk: IonicSdk,
  address?: string
): Promise<BigNumber> => {
  let balance = constants.Zero;

  try {
    if (!address) {
      balance = BigNumber.from(0);
    } else if (tokenAddress === 'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS') {
      balance = await sdk.provider.getBalance(address);
    } else {
      // const contract = sdk.createCTokenWithExtensions(tokenAddress);
      // balance = await sdk.provider.;
      console.log(balance);
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
  tokenAddress?: string,
  chainId?: number,
  customAddress?: string
) {
  const { address } = useMultiMidas();
  const sdk = useSdk(chainId);

  const addressToCheck = customAddress ?? address;

  return useQuery(
    ['TokenBalance', tokenAddress, addressToCheck, sdk?.chainId],
    async () => {
      if (sdk && tokenAddress && chainId) {
        return await fetchTokenBalance(tokenAddress, sdk, addressToCheck);
      } else {
        return null;
      }
    },
    {
      // cacheTime: Infinity,
      enabled: !!tokenAddress && !!addressToCheck && !!sdk
      // staleTime: Infinity,
    }
  );
}
