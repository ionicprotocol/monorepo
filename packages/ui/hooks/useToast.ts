import { useToast, UseToastOptions } from '@chakra-ui/react';

export const useSuccessToast = (options: UseToastOptions = {}) =>
  useToast({
    title: 'Success',
    status: 'success',
    duration: 2000,
    isClosable: true,
    position: 'top-right',
    ...options,
  });

export const useErrorToast = (options: UseToastOptions = {}) =>
  useToast({
    title: 'Error',
    status: 'error',
    duration: 10000,
    isClosable: true,
    position: 'top-right',
    ...options,
  });
