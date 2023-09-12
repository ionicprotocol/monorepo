import { ComptrollerErrorCodes, CTokenErrorCodes } from '@ionicprotocol/types';

export function BorrowError(errorCode: number, minBorrowUSD?: number) {
  let err;

  if (errorCode >= 1000) {
    const comptrollerResponse = errorCode - 1000;
    let msg = ComptrollerErrorCodes[comptrollerResponse];

    if (msg === 'BORROW_BELOW_MIN') {
      msg = `As part of our guarded launch, you cannot borrow ${
        !!minBorrowUSD ? `less than $${minBorrowUSD.toFixed(2)} worth` : 'this amount'
      } of tokens at the moment.`;
    }

    err = new Error('Comptroller Error: ' + msg);
  } else {
    err = new Error('CToken Code: ' + CTokenErrorCodes[errorCode]);
  }

  throw err;
}
