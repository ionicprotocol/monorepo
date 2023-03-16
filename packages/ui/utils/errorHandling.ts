/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateToastFnReturn } from '@chakra-ui/react';
import * as Sentry from '@sentry/nextjs';

export const handleGenericError = ({
  error,
  toast,
  sentryInfo,
}: {
  error: any;
  toast?: CreateToastFnReturn;
  sentryInfo: { contextName: string; properties: { [key: string]: any } };
}) => {
  console.error('Raw Error', error);

  let message: string;

  if (error instanceof Error) {
    message = error.toString();
  } else {
    message = (error as { message: string }).message || JSON.stringify(error);
  }

  Sentry.setContext(sentryInfo.contextName, sentryInfo.properties);

  Sentry.withScope((scope) => {
    scope.setLevel('error');
    scope.setFingerprint([sentryInfo.contextName, new Date().toISOString()]);
    scope.setTransactionName(sentryInfo.contextName);
    Sentry.captureException(error);
  });

  if (toast) {
    if (error.code === 'ACTION_REJECTED') {
      toast({
        id: `error-${new Date().getTime()}`,
        title: 'Action Rejected!',
        status: 'warning',
        description: 'Your transaction has been rejected!',
      });
    } else if (error.method === 'estimateGas') {
      toast({
        id: `error-${new Date().getTime()}`,
        description: 'Gas cannot be estimated!',
      });
    } else {
      toast({ id: `error-${new Date().getTime()}`, description: message });
    }
  }
};
