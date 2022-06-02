import { constants } from "ethers";

import { SupportedAsset } from "../../types";

import { assetSymbols } from "./index";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.ETH,
    underlying: constants.AddressZero,
    name: "Ethereum",
    decimals: 18,
  },
  {
    symbol: assetSymbols.WETH,
    underlying: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    name: "Wrapped Ether",
    decimals: 18,
  },
  {
    symbol: assetSymbols.TOUCH,
    underlying: "0xD54Ae101D6980dB5a8Aa60124b2e5D4B7f02f12C",
    name: "Touch Token",
    decimals: 18,
  },
  {
    symbol: assetSymbols.TRIBE,
    underlying: "0xeD4764ad14Bb60DC698372B92e51CEC62688DC52",
    name: "Tribe Token ",
    decimals: 18,
  },
];

export default assets;
