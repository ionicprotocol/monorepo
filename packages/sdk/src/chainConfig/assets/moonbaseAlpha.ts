import { ethers } from "ethers";

import { OracleTypes } from "../../enums";
import { SupportedAsset } from "../../types";

import { assetSymbols } from "./index";

const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WDEV,
    underlying: "0xA30404AFB4c43D25542687BCF4367F59cc77b5d2",
    name: "Wrapped GLMR",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
  },
  {
    symbol: assetSymbols.ETH,
    underlying: "0x8cbF5008fa8De192209c6A987D0b3C9c3c7586a6",
    name: "Ethereum Token",
    decimals: 18,
    oracle: OracleTypes.SimplePriceOracle,
    simplePriceOracleAssetPrice: ethers.utils.parseEther("100"),
  },
  {
    symbol: assetSymbols.BUSD,
    underlying: "0xe7b932a60E7d0CD08804fB8a3038bCa6218a7Fa2",
    name: "Binance USD",
    decimals: 18,
    oracle: OracleTypes.SimplePriceOracle,
    simplePriceOracleAssetPrice: ethers.utils.parseEther("0.1"),
  },
  {
    symbol: assetSymbols.USDC,
    underlying: "0x65C281140d15184de571333387BfCC5e8Fc7c8dc",
    name: "USDC Coin",
    decimals: 18,
    oracle: OracleTypes.SimplePriceOracle,
    simplePriceOracleAssetPrice: ethers.utils.parseEther("0.1"),
  },
];

export default assets;
