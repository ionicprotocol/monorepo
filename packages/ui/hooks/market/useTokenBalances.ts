import { useMemo } from 'react';

import { formatUnits, erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';

import { useAssetPrices } from '../useAssetPrices';

export type TokenBalance = {
  amount: number;
  formatted: string;
  amountUSD: number;
  formattedUSD: string;
};

type Asset = {
  underlyingToken: string;
  underlyingDecimals: number;
};

interface UseTokenBalancesProps {
  assets: Asset[] | undefined;
  chainId: number | string;
  userAddress?: string;
}

export const useTokenBalances = ({
  assets,
  chainId,
  userAddress
}: UseTokenBalancesProps) => {
  // Format token info for contract calls
  const underlyingTokens = useMemo(() => {
    if (!assets) return [];
    return assets.map((asset) => ({
      address: asset.underlyingToken as `0x${string}`,
      decimals: asset.underlyingDecimals
    }));
  }, [assets]);

  // Get token balances
  const { data: tokenBalances, isError: isBalanceError } = useReadContracts({
    contracts: underlyingTokens.map((token) => ({
      address: token.address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`],
      chainId: +chainId
    }))
  });

  // Get token addresses for price fetching
  const tokenAddresses = useMemo(() => {
    if (!assets) return [];
    return assets.map((asset) => asset.underlyingToken);
  }, [assets]);

  // Fetch token prices
  const { data: pricesResponse, isError: isPriceError } = useAssetPrices({
    chainId,
    tokens: tokenAddresses
  });

  // Create prices lookup map
  const pricesMap = useMemo(() => {
    if (!pricesResponse?.data) return new Map<string, number>();

    return new Map(
      pricesResponse.data.map((price) => [
        price.underlying_address.toLowerCase(),
        price.info.usdPrice
      ])
    );
  }, [pricesResponse]);

  // Create final balance map with USD values
  const balanceMap = useMemo(() => {
    if (!tokenBalances || !underlyingTokens) return {};

    return underlyingTokens.reduce(
      (acc, token, index) => {
        const balance = tokenBalances[index]?.result;
        if (balance === undefined) return acc;

        const formattedBalance = parseFloat(
          formatUnits(BigInt(balance), token.decimals)
        );

        const price = pricesMap.get(token.address.toLowerCase()) ?? 0;
        const usdValue = formattedBalance * price;

        acc[token.address.toLowerCase()] = {
          amount: formattedBalance,
          formatted: formattedBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
          }),
          amountUSD: usdValue,
          formattedUSD: usdValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            style: 'currency',
            currency: 'USD'
          })
        };
        return acc;
      },
      {} as Record<string, TokenBalance>
    );
  }, [tokenBalances, underlyingTokens, pricesMap]);

  return {
    balanceMap,
    isLoading: !tokenBalances || !pricesResponse?.data,
    isError: isBalanceError || isPriceError
  };
};
