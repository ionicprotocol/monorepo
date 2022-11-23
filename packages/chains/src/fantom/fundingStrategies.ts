import { assetSymbols, FundingStrategyContract, underlying } from "@midas-capital/types";

import { assets } from "./assets";

const fundingStrategies: { [token: string]: [FundingStrategyContract, string] } = {};

export default fundingStrategies;
