import { FundingStrategyContract } from "@midas-capital/types";

import { assets } from "./assets";

const fundingStrategies: { [token: string]: [FundingStrategyContract, string] } = {};

export default fundingStrategies;
