import { useToast, UseToastOptions } from '@chakra-ui/react';
import { useMemo } from 'react';

const useSuccessToast = (options?: UseToastOptions) => {
  const allOptions = useMemo(() => {
    const _options = options ? options : {};
    return {
      id: 'success',
      title: 'Success!',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'bottom-right',
      containerStyle: {
        maxHeight: '400px',
        overflowY: 'auto',
      },
      ..._options,
    } as UseToastOptions;
  }, [options]);
  return useToast(allOptions);
};

const useErrorToast = (options?: UseToastOptions) => {
  const allOptions = useMemo(() => {
    const _options = options ? options : {};
    return {
      id: 'error',
      title: 'Error!',
      status: 'error',
      duration: 10000,
      isClosable: true,
      position: 'bottom-right',
      containerStyle: {
        maxHeight: '400px',
        overflowY: 'auto',
      },
      ..._options,
    } as UseToastOptions;
  }, [options]);
  return useToast(allOptions);
};

const useWarningToast = (options?: UseToastOptions) => {
  const allOptions = useMemo(() => {
    const _options = options ? options : {};
    return {
      id: 'warning',
      title: 'Warning!',
      status: 'warning',
      duration: 10000,
      isClosable: true,
      position: 'bottom-right',
      containerStyle: {
        maxHeight: '400px',
        overflowY: 'auto',
      },
      ..._options,
    } as UseToastOptions;
  }, [options]);
  return useToast(allOptions);
};

const useInfoToast = (options?: UseToastOptions) => {
  const allOptions = useMemo(() => {
    const _options = options ? options : {};
    return {
      id: 'info',
      title: 'Info!',
      status: 'info',
      duration: 5000,
      isClosable: true,
      position: 'bottom-right',
      containerStyle: {
        maxHeight: '400px',
        overflowY: 'auto',
      },
      ..._options,
    } as UseToastOptions;
  }, [options]);
  return useToast(allOptions);
};

export { useSuccessToast, useErrorToast, useWarningToast, useInfoToast };
