import { IrmTypes } from "@ionicprotocol/types";

const baseIrms = [IrmTypes.WhitePaperInterestRateModel, IrmTypes.JumpRateModel];

const irms: IrmTypes[] = [...baseIrms, IrmTypes.AdjustableJumpRateModel_JARVIS_jEUR];

export default irms;
