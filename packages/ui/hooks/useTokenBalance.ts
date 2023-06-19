import type { MidasSdk } from '@midas-capital/sdk';
import { useQuery } from '@tanstack/react-query';
import { BigNumber, constants } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const fetchTokenBalance = async (
  tokenAddress: string,
  sdk: MidasSdk,
  address?: string
): Promise<BigNumber> => {
  let balance = constants.Zero;

  try {
    if (!address) {
      balance = BigNumber.from(0);
    } else if (tokenAddress === 'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS') {
      balance = await sdk.provider.getBalance(address);
    } else {
      const contract = sdk.createCTokenWithExtensions(tokenAddress);
      balance = (await contract.callStatic.balanceOf(address)) as BigNumber;
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

export function useTokenBalance(tokenAddress: string, chainId: number, customAddress?: string) {
  const { address } = useMultiMidas();
  const sdk = useSdk(chainId);

  const addressToCheck = customAddress ?? address;

  return useQuery(
    ['TokenBalance', tokenAddress, addressToCheck, sdk?.chainId],
    async () => {
      if (sdk) {
        return await fetchTokenBalance(tokenAddress, sdk, addressToCheck);
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!tokenAddress && !!addressToCheck && !!sdk,
      staleTime: Infinity,
    }
  );
}
