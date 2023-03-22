import type { ToastId, UseToastOptions } from '@chakra-ui/react';
import { useCallback } from 'react';
import type { Address } from 'wagmi';

export const useAddTokenToWallet = ({
  underlyingAddress,
  underlyingSymbol,
  underlyingDecimals,
  logoUrl,
  errorToast,
  successToast,
}: {
  errorToast: (options?: UseToastOptions | undefined) => ToastId;
  logoUrl?: string;
  successToast: (options?: UseToastOptions | undefined) => ToastId;
  underlyingAddress: string;
  underlyingDecimals: number;
  underlyingSymbol: string;
}) =>
  useCallback(async () => {
    const ethereum = window.ethereum;

    if (!ethereum) {
      errorToast({ description: 'Wallet could not be found!', title: 'Error' });

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
            symbol: underlyingSymbol,
          },
          type: 'ERC20',
        } as {
          options: {
            address: Address;
            decimals: number;
            image?: string;
            symbol: string;
          };
          type: 'ERC20';
        },
      });

      if (added) {
        successToast({ description: 'Token is successfully added to wallet', title: 'Added' });
      }

      return added;
    } catch (error) {
      return false;
    }
  }, [underlyingAddress, underlyingSymbol, underlyingDecimals, logoUrl, errorToast, successToast]);
