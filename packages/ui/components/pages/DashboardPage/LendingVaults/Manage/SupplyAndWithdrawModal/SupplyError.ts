import { ComptrollerErrorCodes, CTokenErrorCodes } from '@ionicprotocol/types';

export function SupplyError(errorCode: number) {
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
