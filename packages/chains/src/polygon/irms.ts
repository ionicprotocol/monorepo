import { IrmTypes } from "@midas-capital/types";

const baseIrms = [IrmTypes.WhitePaperInterestRateModel, IrmTypes.JumpRateModel];

const irms: IrmTypes[] = [...baseIrms, IrmTypes.JumpRateModel_MIMO_002_018_4_04];

export default irms;
