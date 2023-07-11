import { assetSymbols, LiquidationDefaults, LiquidationStrategy, underlying } from "@ionicprotocol/types";
import { BigNumber, constants } from "ethers";

import chainAddresses from "./addresses";
import assets, { ankrBNB, BUSD, HAY, WBNB } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {
    [underlying(assets, assetSymbols["asBNBx-WBNB"])]: "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
    [underlying(assets, assetSymbols["vAMM-HAY/ankrBNB"])]: "0xd4ae6eCA985340Dd434D38F470aCCce4DC78D109", // Thena Solidly Router
    [underlying(assets, assetSymbols["sAMM-HAY/BUSD"])]: "0xd4ae6eCA985340Dd434D38F470aCCce4DC78D109",
    [underlying(assets, assetSymbols["vAMM-ANKR/HAY"])]: "0xd4ae6eCA985340Dd434D38F470aCCce4DC78D109",
    [underlying(assets, assetSymbols["vAMM-ANKR/ankrBNB"])]: "0xd4ae6eCA985340Dd434D38F470aCCce4DC78D109",
    [underlying(assets, assetSymbols["sAMM-jBRL/BRZ"])]: "0xd4ae6eCA985340Dd434D38F470aCCce4DC78D109",
  },
  SUPPORTED_OUTPUT_CURRENCIES: [constants.AddressZero, ankrBNB, WBNB, HAY, BUSD],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, WBNB],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
  LIQUIDATION_INTERVAL_SECONDS: 60,
  jarvisPools: [
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x0fD8170Dc284CD558325029f6AEc1538c7d99f49",
      syntheticToken: underlying(assets, assetSymbols.jBRL),
      collateralToken: underlying(assets, assetSymbols.BUSD),
    },
  ],
  balancerPools: [],
};

export default liquidationDefaults;
