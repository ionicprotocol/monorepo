import { ChainIrms, IrmTypes, SupportedChains } from "@midas-capital/types";

const baseIrms = [IrmTypes.WhitePaperInterestRateModel, IrmTypes.JumpRateModel];

const irms: ChainIrms = {
  [SupportedChains.ganache]: [...baseIrms],
  [SupportedChains.chapel]: [...baseIrms],
  [SupportedChains.bsc]: [...baseIrms, IrmTypes.AnkrBNBInterestRateModel],
  [SupportedChains.evmos]: [...baseIrms],
  [SupportedChains.moonbeam]: [...baseIrms],
  [SupportedChains.neon_devnet]: [...baseIrms],
  [SupportedChains.polygon]: [...baseIrms],
};

export default irms;
