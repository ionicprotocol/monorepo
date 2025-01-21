import { task } from "hardhat/config";
import { Address } from "viem";
import { resetLiquidationStrategies, setOptimalSwapPath } from "../../liquidation";
import { assetSymbols } from "@ionicprotocol/types";
import { optimism } from "@ionicprotocol/chains";

task("optimism:liquidation:set-redemption-strategies", "Set redemption strategy").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();
    const usdcToken = optimism.assets.find((asset) => asset.symbol === assetSymbols.USDC);
    const usdtToken = optimism.assets.find((asset) => asset.symbol === assetSymbols.USDT);
    const wethToken = optimism.assets.find((asset) => asset.symbol === assetSymbols.WETH);
    const wusdmToken = optimism.assets.find((asset) => asset.symbol === assetSymbols.wUSDM);
    const opToken = optimism.assets.find((asset) => asset.symbol === assetSymbols.OP);
    const wstETHToken = optimism.assets.find((asset) => asset.symbol === assetSymbols.wstETH);
    const snxToken = optimism.assets.find((asset) => asset.symbol === assetSymbols.SNX);
    const wbtcToken = optimism.assets.find((asset) => asset.symbol === assetSymbols.WBTC);
    const lusdToken = optimism.assets.find((asset) => asset.symbol === assetSymbols.LUSD);
    if (
      !usdcToken ||
      !usdtToken ||
      !wusdmToken ||
      !opToken ||
      !wstETHToken ||
      !wethToken ||
      !lusdToken ||
      !wbtcToken ||
      !snxToken
    ) {
      throw new Error("Tokens not found");
    }
    const univ3Liquidator = await deployments.get("UniswapV3LiquidatorFunder");
    const curveSwapLiquidator = await deployments.get("CurveSwapLiquidator");

    const liquidatorRegistry = await viem.getContractAt(
      "ILiquidatorsRegistry",
      (await deployments.get("LiquidatorsRegistry")).address as Address
    );

    const usdm = "0x59D9356E565Ab3A36dD77763Fc0d87fEaf85508C";
    const readUsdm = await liquidatorRegistry.read.wrappedToUnwrapped4626([wusdmToken.underlying]);
    console.log("🚀 ~ readUsdm:", readUsdm);
    if (readUsdm.toLowerCase() !== usdm.toLowerCase()) {
      const setTx = await liquidatorRegistry.write._setWrappedToUnwrapped4626([wusdmToken.underlying, usdm]);
      await publicClient.waitForTransactionReceipt({ hash: setTx });
      console.log("Transaction sent to set wrapped to unwrapped:", setTx);
    }
    await resetLiquidationStrategies(viem, deployments, deployer as Address, [
      {
        inputToken: usdcToken.underlying,
        outputToken: wethToken.underlying,
        strategy: univ3Liquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: usdcToken.underlying,
        strategy: univ3Liquidator.address as Address
      },
      {
        inputToken: usdtToken.underlying,
        outputToken: wethToken.underlying,
        strategy: univ3Liquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: usdtToken.underlying,
        strategy: univ3Liquidator.address as Address
      },
      {
        inputToken: wusdmToken.underlying,
        outputToken: usdcToken.underlying,
        strategy: curveSwapLiquidator.address as Address
      },
      {
        inputToken: usdcToken.underlying,
        outputToken: wusdmToken.underlying,
        strategy: curveSwapLiquidator.address as Address
      },
      {
        inputToken: opToken.underlying,
        outputToken: wethToken.underlying,
        strategy: univ3Liquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: opToken.underlying,
        strategy: univ3Liquidator.address as Address
      },
      {
        inputToken: wbtcToken.underlying,
        outputToken: wethToken.underlying,
        strategy: univ3Liquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: wbtcToken.underlying,
        strategy: univ3Liquidator.address as Address
      },
      {
        inputToken: wstETHToken.underlying,
        outputToken: wethToken.underlying,
        strategy: univ3Liquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: wstETHToken.underlying,
        strategy: univ3Liquidator.address as Address
      },
      {
        inputToken: snxToken.underlying,
        outputToken: wethToken.underlying,
        strategy: univ3Liquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: snxToken.underlying,
        strategy: univ3Liquidator.address as Address
      },

      {
        inputToken: lusdToken.underlying,
        outputToken: wethToken.underlying,
        strategy: univ3Liquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: lusdToken.underlying,
        strategy: univ3Liquidator.address as Address
      }
    ]);
  }
);
