import LogRocket from 'logrocket';

export const handleGenericError = (e: unknown, errorToast: (input: unknown) => void) => {
  console.error(e);
  let message: string;

  if (e instanceof Error) {
    message = e.toString();
    LogRocket.captureException(e);
  } else {
    message = (e as { message: string }).message || JSON.stringify(e);
    LogRocket.captureException(new Error(message));
  }

  errorToast({ description: message });
};
