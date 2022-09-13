import { Web3Provider } from '@ethersproject/providers';
import { MidasSdk } from '@midas-capital/sdk';
import { BigNumber, Contract } from 'ethers';
import { useQuery } from '@tanstack/react-query';
import { erc20ABI } from 'wagmi';

import { useMidas } from '@ui/context/MidasContext';

export const fetchTokenBalance = async (
  tokenAddress: string,
  midasSdk: MidasSdk,
  address?: string
): Promise<BigNumber> => {
  let balance: BigNumber;

  if (!address) {
    balance = BigNumber.from(0);
  } else if (tokenAddress === 'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS') {
    balance = await midasSdk.provider.getBalance(address);
  } else {
    const contract = new Contract(tokenAddress, erc20ABI, midasSdk.provider as Web3Provider);
    balance = (await contract.callStatic.balanceOf(address)) as BigNumber;
  }

  return balance;
};

export function useTokenBalance(tokenAddress: string, customAddress?: string) {
  const { midasSdk, currentChain, address } = useMidas();

  const addressToCheck = customAddress ?? address;

  return useQuery(
    ['TokenBalance', currentChain.id, tokenAddress, addressToCheck],
    () => fetchTokenBalance(tokenAddress, midasSdk, addressToCheck),
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!currentChain.id && !!tokenAddress && !!addressToCheck,
    }
  );
}
