import { ERC20Abi, Fuse } from '@midas-capital/sdk';
import { BigNumber, Contract } from 'ethers';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const fetchTokenBalance = async (
  tokenAddress: string,
  fuse: Fuse,
  address?: string
): Promise<BigNumber> => {
  let balance;

  if (!address) {
    balance = '0';
  } else if (tokenAddress === 'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS') {
    balance = await fuse.provider.getBalance(address);
  } else {
    const contract = new Contract(tokenAddress, ERC20Abi, fuse.provider.getSigner());
    balance = await contract.callStatic.balanceOf(address);
  }

  return balance;
};

export function useTokenBalance(tokenAddress: string, customAddress?: string) {
  const { fuse, currentChain, address } = useRari();

  const addressToCheck = customAddress ?? address;

  return useQuery(
    ['TokenBalance', currentChain.id, tokenAddress, addressToCheck],
    () => fetchTokenBalance(tokenAddress, fuse, addressToCheck),
    { enabled: !!currentChain.id && !!tokenAddress && !!addressToCheck }
  );
}
