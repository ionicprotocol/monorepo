import { ERC20Abi, Fuse } from '@midas-capital/sdk';
import { BigNumber, Contract } from 'ethers';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';
import { WRAPPED_NATIVE_TOKEN_DATA } from '@ui/networkData/index';

export const fetchTokenBalance = async (
  tokenAddress: string,
  fuse: Fuse,
  address?: string,
  chainId?: number
): Promise<BigNumber> => {
  let balance;

  if (!address || address === WRAPPED_NATIVE_TOKEN_DATA[chainId as number].address) {
    balance = '0';
  } else if (
    tokenAddress === WRAPPED_NATIVE_TOKEN_DATA[chainId as number].address ||
    tokenAddress === 'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS'
  ) {
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
    () => fetchTokenBalance(tokenAddress, fuse, addressToCheck, currentChain.id),
    { enabled: !!currentChain.id && !!tokenAddress && !!addressToCheck }
  );
}
