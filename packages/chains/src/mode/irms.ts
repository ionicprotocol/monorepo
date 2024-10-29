import { IrmTypes } from "@ionicprotocol/types";

const baseIrms = [IrmTypes.JumpRateModel];

const irms: IrmTypes[] = [...baseIrms, IrmTypes.PrudentiaInterestRateModel];

export default irms;
