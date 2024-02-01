import { useCallback } from 'react';
import type { Address } from 'wagmi';

export const useAddTokenToWallet = ({
  underlyingAddress,
  underlyingSymbol,
  underlyingDecimals,
  logoUrl
}: {
  logoUrl?: string;
  underlyingAddress: string;
  underlyingDecimals: number;
  underlyingSymbol: string;
}) =>
  useCallback(async () => {
    const ethereum = window.ethereum;

    if (!ethereum) {
      return false;
    }

    try {
      const added = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          options: {
            address: underlyingAddress,
            decimals: underlyingDecimals,
            image: logoUrl,
            symbol: underlyingSymbol
          },
          type: 'ERC20'
        } as {
          options: {
            address: Address;
            decimals: number;
            image?: string;
            symbol: string;
          };
          type: 'ERC20';
        }
      });

      return added;
    } catch (error) {
      return false;
    }
  }, [underlyingAddress, underlyingSymbol, underlyingDecimals, logoUrl]);
