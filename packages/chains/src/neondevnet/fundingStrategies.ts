import { assetSymbols, FundingStrategyContract, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const fundingStrategies: { [token: string]: [FundingStrategyContract, string] } = {};

export default fundingStrategies;
