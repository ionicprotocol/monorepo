import LogRocket from 'logrocket';

export const handleGenericError = (e: any, errorToast: (input: any) => any) => {
  let message: string;

  if (e instanceof Error) {
    message = e.toString();
    LogRocket.captureException(e);
  } else {
    message = e.message ?? JSON.stringify(e);
    LogRocket.captureException(new Error(message));
  }

  errorToast({ description: message });
};
