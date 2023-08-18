import type { UseToastOptions } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import { useMemo } from 'react';

const useSuccessToast = (options?: UseToastOptions) => {
  const allOptions = useMemo(() => {
    const _options = options ? options : {};
    return {
      containerStyle: {
        p: '4px',
        wordBreak: 'break-word'
      },
      duration: 5000,
      id: 'success',
      isClosable: true,
      position: 'bottom-right',
      status: 'success',
      title: 'Success!',
      variant: 'success',
      ..._options
    } as UseToastOptions;
  }, [options]);
  return useToast(allOptions);
};

const useErrorToast = (options?: UseToastOptions) => {
  const allOptions = useMemo(() => {
    const _options = options ? options : {};
    return {
      containerStyle: {
        p: '4px',
        wordBreak: 'break-word'
      },
      duration: 10000,
      id: 'error',
      isClosable: true,
      position: 'bottom-right',
      status: 'error',
      title: 'Error!',
      variant: 'error',
      ..._options
    } as UseToastOptions;
  }, [options]);
  return useToast(allOptions);
};

const useWarningToast = (options?: UseToastOptions) => {
  const allOptions = useMemo(() => {
    const _options = options ? options : {};
    return {
      containerStyle: {
        p: '4px',
        wordBreak: 'break-word'
      },
      duration: 10000,
      id: 'warning',
      isClosable: true,
      position: 'bottom-right',
      status: 'warning',
      title: 'Warning!',
      variant: 'warning',
      ..._options
    } as UseToastOptions;
  }, [options]);
  return useToast(allOptions);
};

const useInfoToast = (options?: UseToastOptions) => {
  const allOptions = useMemo(() => {
    const _options = options ? options : {};
    return {
      containerStyle: {
        p: '4px',
        wordBreak: 'break-word'
      },
      duration: 5000,
      id: 'info',
      isClosable: true,
      position: 'bottom-right',
      status: 'info',
      title: 'Info!',
      variant: 'info',
      ..._options
    } as UseToastOptions;
  }, [options]);
  return useToast(allOptions);
};

export { useSuccessToast, useErrorToast, useWarningToast, useInfoToast };
