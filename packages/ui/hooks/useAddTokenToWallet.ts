import { ToastId, UseToastOptions } from '@chakra-ui/react';
import { useCallback } from 'react';
import { Address } from 'wagmi';

export const useAddTokenToWallet = ({
  underlyingAddress,
  underlyingSymbol,
  underlyingDecimals,
  logoUrl,
  errorToast,
  successToast,
}: {
  underlyingAddress: string;
  underlyingSymbol: string;
  underlyingDecimals: number;
  logoUrl?: string;
  errorToast: (options?: UseToastOptions | undefined) => ToastId;
  successToast: (options?: UseToastOptions | undefined) => ToastId;
}) =>
  useCallback(async () => {
    const ethereum = window.ethereum;

    if (!ethereum) {
      errorToast({ title: 'Error', description: 'Wallet could not be found!' });

      return false;
    }

    try {
      const added = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: underlyingAddress,
            symbol: underlyingSymbol,
            decimals: underlyingDecimals,
            image: logoUrl,
          },
        } as {
          type: 'ERC20';
          options: {
            address: Address;
            decimals: number;
            symbol: string;
            image?: string;
          };
        },
      });

      if (added) {
        successToast({ title: 'Added', description: 'Token is successfully added to wallet' });
      }

      return added;
    } catch (error) {
      return false;
    }
  }, [underlyingAddress, underlyingSymbol, underlyingDecimals, logoUrl, errorToast, successToast]);
