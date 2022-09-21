import { CreateToastFnReturn } from '@chakra-ui/react';
import LogRocket from 'logrocket';

export const handleGenericError = (e: unknown, errorToast?: CreateToastFnReturn) => {
  console.error(e);
  let message: string;

  if (e instanceof Error) {
    message = e.toString();
    LogRocket.captureException(e);
  } else {
    message = (e as { message: string }).message || JSON.stringify(e);
    LogRocket.captureException(new Error(message));
  }

  if (errorToast) {
    errorToast({ description: message });
  }
};
