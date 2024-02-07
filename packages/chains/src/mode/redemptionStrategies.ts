import {assetSymbols, RedemptionStrategy, RedemptionStrategyContract, underlying} from "@ionicprotocol/types";

import {assets} from "./assets";

const redemptionStrategies: RedemptionStrategy[] = [
  { 
    inputToken: underlying(assets, assetSymbols.USDC),
    strategy: RedemptionStrategyContract.Ki,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
];

export default redemptionStrategies;
