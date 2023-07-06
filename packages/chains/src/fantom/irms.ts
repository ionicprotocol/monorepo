import { IrmTypes } from "@ionicprotocol/types";

const baseIrms = [IrmTypes.WhitePaperInterestRateModel, IrmTypes.JumpRateModel];

const irms: IrmTypes[] = [...baseIrms, IrmTypes.AnkrFTMInterestRateModel];

export default irms;
