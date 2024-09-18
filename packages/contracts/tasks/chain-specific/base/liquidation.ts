import { task } from "hardhat/config";
import { setLiquidationStrategies } from "../../liquidation";
import { Address } from "viem";
import { assetSymbols } from "@ionicprotocol/types";
import { base } from "@ionicprotocol/chains";
import {
  weETH_MARKET,
  ezETH_MARKET,
  wstETH_MARKET,
  cbETH_MARKET,
  AERO_MARKET,
  bsdETH_MARKET,
  hyUSD_MARKET,
  RSR_MARKET,
  USDC_MARKET,
  eUSD_MARKET,
  WETH_MARKET
} from ".";

task("base:liquidation:set-redemption-strategies:loop", "Set redemption strategy").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const collaterals = [
      weETH_MARKET,
      ezETH_MARKET,
      wstETH_MARKET,
      cbETH_MARKET,
      AERO_MARKET,
      bsdETH_MARKET,
      hyUSD_MARKET,
      RSR_MARKET
    ];
    const borrows = [USDC_MARKET, eUSD_MARKET, WETH_MARKET];
    const uniLiquidator = await deployments.get("UniswapV3LiquidatorFunder");
    const pairs: { inputToken: Address; outputToken: Address; strategy: Address }[] = [];
    for (const collateral of collaterals) {
      const collateralContract = await viem.getContractAt("ICErc20", collateral as Address);
      const collateralUnderlying = await collateralContract.read.underlying();
      for (const borrow of borrows) {
        const borrowContract = await viem.getContractAt("ICErc20", borrow as Address);
        const borrowUnderlying = await borrowContract.read.underlying();
        pairs.push({
          inputToken: collateralUnderlying,
          outputToken: borrowUnderlying,
          strategy: uniLiquidator.address as Address
        });

        pairs.push({
          inputToken: borrowUnderlying,
          outputToken: collateralUnderlying,
          strategy: uniLiquidator.address as Address
        });
      }
    }
    await setLiquidationStrategies(viem, deployments, deployer as Address, pairs);
  }
);

task("base:liquidation:set-redemption-strategies", "Set redemption strategy").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const uniLiquidator = await deployments.get("UniswapV3LiquidatorFunder");
    const ezETHContract = await viem.getContractAt("ICErc20", ezETH_MARKET);
    const ezETHUnderlying = await ezETHContract.read.underlying();
    const wstETHContract = await viem.getContractAt("ICErc20", wstETH_MARKET);
    const wstETHUnderlying = await wstETHContract.read.underlying();
    const wethContract = await viem.getContractAt("ICErc20", WETH_MARKET);
    const wethUnderlying = await wethContract.read.underlying();
    const usdcContract = await viem.getContractAt("ICErc20", USDC_MARKET);
    const usdcUnderlying = await usdcContract.read.underlying();
    const aeroContract = await viem.getContractAt("ICErc20", AERO_MARKET);
    const aeroUnderlying = await aeroContract.read.underlying();
    const pairs: { inputToken: Address; outputToken: Address; strategy: Address }[] = [
      {
        inputToken: ezETHUnderlying,
        outputToken: wstETHUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: wstETHUnderlying,
        outputToken: ezETHUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: wethUnderlying,
        outputToken: usdcUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: usdcUnderlying,
        outputToken: wethUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: aeroUnderlying,
        outputToken: usdcUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: usdcUnderlying,
        outputToken: aeroUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: wethUnderlying,
        outputToken: aeroUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: aeroUnderlying,
        outputToken: wethUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: ezETHUnderlying,
        outputToken: usdcUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: usdcUnderlying,
        outputToken: ezETHUnderlying,
        strategy: uniLiquidator.address as Address
      }
    ];

    await setLiquidationStrategies(viem, deployments, deployer as Address, pairs);
  }
);

