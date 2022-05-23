import { SupportedAsset } from "../../types";
import { assetSymbols } from "./index";
import { constants } from "ethers";

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
    underlying: "",
    name: "Touch Token",
    decimals: 18,
  },
  {
    symbol: assetSymbols.TRIBE,
    underlying: "",
    name: "Tribe Token ",
    decimals: 18,
  },
];

export default assets;
