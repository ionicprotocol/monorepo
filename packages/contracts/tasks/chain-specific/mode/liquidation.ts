import { task } from "hardhat/config";
import { Address } from "viem";
import { mode } from "@ionicprotocol/chains";
import { setLiquidationStrategies } from "../../liquidation";
import { assetSymbols } from "@ionicprotocol/types";

task("mode:liquidation:set-redemption-strategies", "Set redemption strategy").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const modeToken = mode.assets.find((asset) => asset.symbol === assetSymbols.MODE);
    const usdtToken = mode.assets.find((asset) => asset.symbol === assetSymbols.USDT);
    const stoneToken = mode.assets.find((asset) => asset.symbol === assetSymbols.STONE);
    const mbtcToken = mode.assets.find((asset) => asset.symbol === assetSymbols.mBTC);
    const weethToken = mode.assets.find((asset) => asset.symbol === assetSymbols.weETH);
    const weEthOld = "0x028227c4dd1e5419d11Bb6fa6e661920c519D4F5";
    if (!modeToken || !usdtToken || !stoneToken || !mbtcToken || !weethToken) {
      throw new Error("Tokens not found");
    }
    const kimLiquidator = await deployments.get("AlgebraSwapLiquidator");
    await setLiquidationStrategies(viem, deployments, deployer as Address, [
      {
        inputToken: modeToken.underlying,
        outputToken: usdtToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: usdtToken.underlying,
        outputToken: modeToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: stoneToken.underlying,
        outputToken: usdtToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: mbtcToken.underlying,
        outputToken: usdtToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: weethToken.underlying,
        outputToken: stoneToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: weEthOld,
        outputToken: stoneToken.underlying,
        strategy: kimLiquidator.address as Address
      }
    ]);
  }
);
