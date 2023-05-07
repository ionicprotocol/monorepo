/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CreateToastFnReturn } from '@chakra-ui/react';
import * as Sentry from '@sentry/nextjs';

export const handleGenericError = ({
  error,
  toast,
  sentryInfo,
}: {
  error: any;
  sentryInfo: { contextName: string; properties: { [key: string]: any } };
  toast?: CreateToastFnReturn;
}) => {
  if (error.code !== 'ACTION_REJECTED') {
    console.error('Raw Error', error);
  }

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
        description: 'Your transaction has been rejected!',
        id: 'Error action rejected - ' + Math.random().toString(),
        status: 'warning',
        title: 'Action Rejected!',
      });
    } else if (error.method === 'estimateGas') {
      toast({
        description: 'Gas cannot be estimated!',
        id: 'Error estimate gas - ' + Math.random().toString(),
      });
    } else {
      toast({ description: message, id: 'Error - ' + Math.random().toString() });
    }
  }
};
