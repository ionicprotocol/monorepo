// React
import { ERC20Abi, Fuse } from '@midas-capital/sdk';
import { BigNumber, Contract } from 'ethers';
import { useQuery } from 'react-query';

import { NATIVE_TOKEN_DATA } from '@constants/networkData';
import { useRari } from '@context/RariContext';

export const fetchTokenBalance = async (
  tokenAddress: string,
  fuse: Fuse,
  address?: string,
  chainId?: number
): Promise<BigNumber> => {
  let balance;

  if (!address || address === NATIVE_TOKEN_DATA[chainId as number].address) {
    balance = '0';
  } else if (
    tokenAddress === NATIVE_TOKEN_DATA[chainId as number].address ||
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
  const { fuse, address, chainId } = useRari();

  const addressToCheck = customAddress ?? address;

  return useQuery(tokenAddress + ' balanceOf ' + addressToCheck, () =>
    fetchTokenBalance(tokenAddress, fuse, addressToCheck, chainId)
  );
}
