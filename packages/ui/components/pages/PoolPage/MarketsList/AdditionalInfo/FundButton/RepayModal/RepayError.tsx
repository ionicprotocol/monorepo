import { ComptrollerErrorCodes, CTokenErrorCodes } from '@midas-capital/types';
import LogRocket from 'logrocket';

export function RepayError(errorCode: number) {
  let err;

  if (errorCode >= 1000) {
    const comptrollerResponse = errorCode - 1000;
    const msg = ComptrollerErrorCodes[comptrollerResponse];

    err = new Error('Comptroller Error: ' + msg);
  } else {
    err = new Error('CToken Code: ' + CTokenErrorCodes[errorCode]);
  }

  LogRocket.captureException(err);

  throw err;
}
