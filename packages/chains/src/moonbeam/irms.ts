import { IrmTypes } from "@ionicprotocol/types";

const baseIrms = [IrmTypes.WhitePaperInterestRateModel, IrmTypes.JumpRateModel];

const irms: IrmTypes[] = [
  ...baseIrms,
  IrmTypes.AdjustableJumpRateModel_MIXBYTES_XCDOT,
  IrmTypes.AdjustableJumpRateModel_MIXBYTES_USDC,
];

export default irms;
