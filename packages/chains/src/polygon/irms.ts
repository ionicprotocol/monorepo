import { IrmTypes } from "@midas-capital/types";

const baseIrms = [IrmTypes.WhitePaperInterestRateModel, IrmTypes.JumpRateModel];

const irms: IrmTypes[] = [
  ...baseIrms,
  IrmTypes.JumpRateModel_MIMO_2_004_4_08,
  IrmTypes.JumpRateModel_JARVIS_2_004_4_08,
  IrmTypes.AdjustableJumpRateModel_JARVIS_jEUR,
];

export default irms;
