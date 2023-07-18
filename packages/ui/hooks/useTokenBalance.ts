import type { IonicSdk } from '@ionicprotocol/sdk';
import { useQuery } from '@tanstack/react-query';
import { BigNumber, constants } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';

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

export function useTokenBalance(tokenAddress?: string, chainId?: number, customAddress?: string) {
  const { address } = useMultiIonic();
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
      cacheTime: 0,
      enabled: !!tokenAddress && !!addressToCheck && !!sdk,
      staleTime: 0
    }
  );
}

export function useTokensBalance(
  tokenAddresses?: string[],
  chainId?: number,
  customAddress?: string
) {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);

  const addressToCheck = customAddress ?? address;

  return useQuery(
    ['useTokensBalance', tokenAddresses?.sort(), addressToCheck, sdk?.chainId],
    async () => {
      const tokenToBalanceMap: { [underlying: string]: BigNumber } = {};

      if (sdk && tokenAddresses && tokenAddresses.length > 0 && chainId) {
        const balances = await Promise.all(
          tokenAddresses.map(async (tokenAddress) => {
            return await fetchTokenBalance(tokenAddress, sdk, addressToCheck);
          })
        );

        balances.map((balance, index) => {
          tokenToBalanceMap[tokenAddresses[index]] = balance;
        });
      }

      return tokenToBalanceMap;
    },
    {
      enabled: !!tokenAddresses && tokenAddresses.length > 0 && !!addressToCheck && !!sdk
    }
  );
}
