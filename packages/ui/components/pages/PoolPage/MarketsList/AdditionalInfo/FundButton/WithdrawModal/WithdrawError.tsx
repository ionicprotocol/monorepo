import { ComptrollerErrorCodes, CTokenErrorCodes } from '@midas-capital/types';

export function WithdrawError(errorCode: number) {
  let err;

  if (errorCode >= 1000) {
    const comptrollerResponse = errorCode - 1000;
    const msg = ComptrollerErrorCodes[comptrollerResponse];

    err = new Error('Comptroller Error: ' + msg);
  } else {
    err = new Error('CToken Code: ' + CTokenErrorCodes[errorCode]);
  }

  throw err;
}
