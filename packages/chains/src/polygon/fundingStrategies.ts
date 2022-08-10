import { assetSymbols, FundingStrategyContract, underlying } from "@midas-capital/types";

import { assets } from "./assets";

const fundingStrategies: { [token: string]: [FundingStrategyContract, string] } = {
  // TODO: add strategies to convert hard assets into jarvis assets
};

export default fundingStrategies;
