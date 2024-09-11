import { task } from "hardhat/config";
import { setLiquidationStrategies } from "../../liquidation";
import { Address } from "viem";
import { assetSymbols } from "@ionicprotocol/types";
import { base } from "@ionicprotocol/chains";

task("base:liquidation:set-redemption-strategies", "Set redemption strategy").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const wethToken = base.assets.find((asset) => asset.symbol === assetSymbols.WETH);
    const aeroToken = base.assets.find((asset) => asset.symbol === assetSymbols.AERO);
    if (!wethToken || !aeroToken) {
      throw new Error("Tokens not found");
    }
    const uniLiquidator = await deployments.get("UniswapV3LiquidatorFunder");
    await setLiquidationStrategies(viem, deployments, deployer as Address, [
      {
        inputToken: wethToken.underlying,
        outputToken: aeroToken.underlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: aeroToken.underlying,
        outputToken: wethToken.underlying,
        strategy: uniLiquidator.address as Address
      }
    ]);
  }
);
