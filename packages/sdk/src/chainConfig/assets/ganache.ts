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
    underlying: "0x02Ec29Fd9f0bB212eD2C4926ACe1aeab732ed620",
    name: "Touch Token",
    decimals: 18,
  },
  {
    symbol: assetSymbols.TRIBE,
    underlying: "0xf9a089C918ad9c484201E7d328C0d29019997117",
    name: "Tribe Token",
    decimals: 18,
  },
];

export default assets;
