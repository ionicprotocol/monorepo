import { ComptrollerErrorCodes } from '@ionicprotocol/types';

export const errorCodeToMessage = (errorCode: number) => {
  switch (errorCode) {
    // case ComptrollerErrorCodes.NO_ERROR:
    //   return undefined;
    case ComptrollerErrorCodes.NONZERO_BORROW_BALANCE:
      return 'You have to repay all your borrowed assets before you can disable any assets as collateral.';
    default:
      return 'Something went wrong. Please try again later.';
    // 'You cannot disable this asset as collateral as you would not have enough collateral posted to keep your borrow. Try adding more collateral of another type or paying back some of your debt.',
  }
};
