import { MidasSdk } from '@midas-capital/sdk';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const fetchTokenBalance = async (
  tokenAddress: string,
  currentSdk: MidasSdk,
  address?: string
): Promise<BigNumber> => {
  let balance: BigNumber;

  if (!address) {
    balance = BigNumber.from(0);
  } else if (tokenAddress === 'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS') {
    balance = await currentSdk.provider.getBalance(address);
  } else {
    const contract = currentSdk.createCTokenWithExtensions(tokenAddress);
    balance = (await contract.callStatic.balanceOf(address)) as BigNumber;
  }

  return balance;
};

export function useTokenBalance(tokenAddress: string, customAddress?: string) {
  const { currentSdk, currentChain, address } = useMultiMidas();

  const addressToCheck = customAddress ?? address;

  return useQuery(
    ['TokenBalance', currentChain?.id, tokenAddress, addressToCheck, currentSdk?.chainId],
    async () => {
      if (currentSdk) {
        return await fetchTokenBalance(tokenAddress, currentSdk, addressToCheck);
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!currentChain && !!tokenAddress && !!addressToCheck && !!currentSdk,
    }
  );
}
