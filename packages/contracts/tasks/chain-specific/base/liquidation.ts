import { task } from "hardhat/config";
import { resetLiquidationStrategies, setOptimalSwapPath } from "../../liquidation";
import { Address, zeroAddress } from "viem";
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
  WETH_MARKET,
  wsuperOETH_MARKET,
  wusdm_MARKET
} from ".";

task("base:liquidation:whitelist-redemption-strategies", "Whitelist redemption strategies").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const aeroV2Liquidator = await deployments.get("AerodromeV2Liquidator");
    const aeroCLLiquidator = await deployments.get("AerodromeCLLiquidator");
    const curveSwapLiquidator = await deployments.get("CurveSwapLiquidator");
    const univ2Liquidator = await deployments.get("UniswapV2LiquidatorFunder");
    const univ3Liquidator = await deployments.get("UniswapV3LiquidatorFunder");
    const ionicLiquidator = await viem.getContractAt(
      "IonicLiquidator",
      (await deployments.get("IonicLiquidator")).address as Address
    );
    const ionicV3Liquidator = await viem.getContractAt(
      "IonicUniV3Liquidator",
      (await deployments.get("IonicUniV3Liquidator")).address as Address
    );
    const ionicLiquidators = [ionicLiquidator, ionicV3Liquidator];
    const liquidators = [
      aeroV2Liquidator.address as Address,
      aeroCLLiquidator.address as Address,
      curveSwapLiquidator.address as Address,
      univ2Liquidator.address as Address,
      univ3Liquidator.address as Address
    ];
    for (const iLiquidator of ionicLiquidators) {
      for (const liquidator of liquidators) {
        const isWhitelisted = await iLiquidator.read.redemptionStrategiesWhitelist([liquidator]);
        if (!isWhitelisted) {
          const tx = await (iLiquidator as any).write._whitelistRedemptionStrategies([[liquidator], [true]]);
          await publicClient.waitForTransactionReceipt({ hash: tx });
          console.log(`Whitelisted on ${iLiquidator.address}: ${liquidator} at ${tx}`);
        } else {
          console.log(`${liquidator} already whitelisted on ${iLiquidator.address}`);
        }
      }
    }
  }
);

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
    await resetLiquidationStrategies(viem, deployments, deployer as Address, pairs);
  }
);

task("base:liquidation:get-redemption-strategies", "Get redemption strategies").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const publicClient = await viem.getPublicClient();
    const liquidatorRegistry = await viem.getContractAt(
      "ILiquidatorsRegistry",
      (await deployments.get("LiquidatorsRegistry")).address as Address
    );
    const wsuperOETHContract = await viem.getContractAt("ICErc20", wsuperOETH_MARKET);
    const wsuperOETHUnderlying = await wsuperOETHContract.read.underlying();
    const wethContract = await viem.getContractAt("ICErc20", WETH_MARKET);
    const wethUnderlying = await wethContract.read.underlying();
    const strat = await liquidatorRegistry.read.redemptionStrategiesByTokens([wethUnderlying, wsuperOETHUnderlying]);
    console.log("liquidatorRegistry.read.redemptionStrategiesByTokens weth to wsuperOETH:", strat);
    const strategies = await liquidatorRegistry.read.redemptionStrategiesByTokens([
      wsuperOETHUnderlying,
      wethUnderlying
    ]);
    console.log("liquidatorRegistry.read.redemptionStrategiesByTokens strategies superOETH to weth:", strategies);
  }
);

task("base:liquidation:set-redemption-strategies", "Set redemption strategy").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();
    const uniLiquidator = await deployments.get("UniswapV3LiquidatorFunder");

    const liquidatorRegistry = await viem.getContractAt(
      "ILiquidatorsRegistry",
      (await deployments.get("LiquidatorsRegistry")).address as Address
    );

    const aeroV2Liquidator = await deployments.get("AerodromeV2Liquidator");
    const aeroCLLiquidator = await deployments.get("AerodromeCLLiquidator");
    const curveSwapLiquidator = await deployments.get("CurveSwapLiquidator");
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
    const bsdETHContract = await viem.getContractAt("ICErc20", bsdETH_MARKET);
    const bsdETHUnderlying = await bsdETHContract.read.underlying();
    const eusdContract = await viem.getContractAt("ICErc20", eUSD_MARKET);
    const eusdUnderlying = await eusdContract.read.underlying();
    const hyusdContract = await viem.getContractAt("ICErc20", hyUSD_MARKET);
    const hyusdUnderlying = await hyusdContract.read.underlying();
    const wsuperOETHContract = await viem.getContractAt("ICErc20", wsuperOETH_MARKET);
    const wsuperOETHUnderlying = await wsuperOETHContract.read.underlying();
    const superOETH = "0xDBFeFD2e8460a6Ee4955A68582F85708BAEA60A3";
    const wusdmContract = await viem.getContractAt("ICErc20", wusdm_MARKET);
    const wusdmUnderlying = await wusdmContract.read.underlying();
    const usdm = "0x59d9356e565ab3a36dd77763fc0d87feaf85508c";
    const weethContract = await viem.getContractAt("ICErc20", weETH_MARKET);
    const weethUnderlying = await weethContract.read.underlying();
    const ognAsset = base.assets.find((asset) => asset.symbol === assetSymbols.OGN);
    const eurcAsset = base.assets.find((asset) => asset.symbol === assetSymbols.EURC);
    const uSOLAsset = base.assets.find((asset) => asset.symbol === assetSymbols.uSOL);
    if (!ognAsset || !eurcAsset || !uSOLAsset) {
      throw new Error("OGN or EURC or uSOL asset not found in base assets");
    }

    const readTick = await liquidatorRegistry.read.aeroCLTickSpacings([wsuperOETHUnderlying, wethUnderlying]);
    console.log("🚀 ~ readTick:", readTick);
    if (readTick !== 1) {
      const tickTx = await liquidatorRegistry.write._setAeroCLTickSpacings([wsuperOETHUnderlying, wethUnderlying, 1]);
      await publicClient.waitForTransactionReceipt({ hash: tickTx });
      console.log("Transaction sent to set tick spacing:", tickTx);
    }
    const readTick1 = await liquidatorRegistry.read.aeroCLTickSpacings([aeroUnderlying, wethUnderlying]);
    const readTick2 = await liquidatorRegistry.read.aeroCLTickSpacings([wethUnderlying, aeroUnderlying]);
    console.log("🚀 ~ readTick1:", readTick1, readTick2);
    if (readTick1 !== 200) {
      const tickTx1 = await liquidatorRegistry.write._setAeroCLTickSpacings([aeroUnderlying, wethUnderlying, 200]);
      await publicClient.waitForTransactionReceipt({ hash: tickTx1 });
      console.log("Transaction sent to set tick spacing:", tickTx1);
    }
    if (readTick2 !== 200) {
      const tickTx2 = await liquidatorRegistry.write._setAeroCLTickSpacings([wethUnderlying, aeroUnderlying, 200]);
      await publicClient.waitForTransactionReceipt({ hash: tickTx2 });
      console.log("Transaction sent to set tick spacing:", tickTx2);
    }
    const readTickuSOLWETH = await liquidatorRegistry.read.aeroCLTickSpacings([uSOLAsset.underlying, wethUnderlying]);
    const readTickWETHuSOL = await liquidatorRegistry.read.aeroCLTickSpacings([wethUnderlying, uSOLAsset.underlying]);
    console.log("🚀 ~ readTick usol weth:", readTickuSOLWETH, readTickWETHuSOL);
    if (readTickuSOLWETH !== 200) {
      const tickTx3 = await liquidatorRegistry.write._setAeroCLTickSpacings([uSOLAsset.underlying, wethUnderlying, 1]);
      await publicClient.waitForTransactionReceipt({ hash: tickTx3 });
      console.log("Transaction sent to set tick spacing:", tickTx3);
    }
    if (readTickWETHuSOL !== 200) {
      const tickTx4 = await liquidatorRegistry.write._setAeroCLTickSpacings([
        wethUnderlying,
        uSOLAsset.underlying,
        200
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tickTx4 });
      console.log("Transaction sent to set tick spacing:", tickTx4);
    }
    const readWrapped = await liquidatorRegistry.read.wrappedToUnwrapped4626([wsuperOETHUnderlying]);
    console.log("🚀 ~ readWrapped:", readWrapped);
    if (readWrapped.toLowerCase() !== superOETH.toLowerCase()) {
      const setTx = await liquidatorRegistry.write._setWrappedToUnwrapped4626([wsuperOETHUnderlying, superOETH]);
      await publicClient.waitForTransactionReceipt({ hash: setTx });
      console.log("Transaction sent to set wrapped to unwrapped:", setTx);
    }

    const readUsdm = await liquidatorRegistry.read.wrappedToUnwrapped4626([wusdmUnderlying]);
    console.log("🚀 ~ readUsdm:", readUsdm);
    if (readUsdm.toLowerCase() !== usdm.toLowerCase()) {
      const setTx = await liquidatorRegistry.write._setWrappedToUnwrapped4626([wusdmUnderlying, usdm]);
      await publicClient.waitForTransactionReceipt({ hash: setTx });
      console.log("Transaction sent to set wrapped to unwrapped:", setTx);
    }

    const read1 = await liquidatorRegistry.read.aeroV2IsStable([usdcUnderlying, eusdUnderlying]);
    const read2 = await liquidatorRegistry.read.aeroV2IsStable([eusdUnderlying, usdcUnderlying]);
    console.log("🚀 ~ read1, read2:", read1, read2);
    if (!read1) {
      const setTx = await liquidatorRegistry.write._setAeroV2IsStable([usdcUnderlying, eusdUnderlying, true]);
      await publicClient.waitForTransactionReceipt({ hash: setTx });
      console.log("Transaction sent to set special routers to indicate stable pairs:", setTx);
    } else {
      console.log("Stable pairs already set");
    }

    if (!read2) {
      const setTx = await liquidatorRegistry.write._setAeroV2IsStable([eusdUnderlying, usdcUnderlying, true]);
      await publicClient.waitForTransactionReceipt({ hash: setTx });
      console.log("Transaction sent to set special routers to indicate stable pairs for read2:", setTx);
    } else {
      console.log("Stable pairs already set for read2");
    }
    const pairs: { inputToken: Address; outputToken: Address; strategy: Address }[] = [
      {
        inputToken: wethUnderlying,
        outputToken: aeroUnderlying,
        strategy: aeroCLLiquidator.address as Address
      },
      {
        inputToken: aeroUnderlying,
        outputToken: wethUnderlying,
        strategy: aeroCLLiquidator.address as Address
      },
      {
        inputToken: ezETHUnderlying,
        outputToken: wethUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: wethUnderlying,
        outputToken: ezETHUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: wethUnderlying,
        outputToken: wstETHUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: wstETHUnderlying,
        outputToken: wethUnderlying,
        strategy: uniLiquidator.address as Address
      },
      {
        inputToken: bsdETHUnderlying,
        outputToken: wethUnderlying,
        strategy: aeroV2Liquidator.address as Address
      },
      {
        inputToken: wethUnderlying,
        outputToken: bsdETHUnderlying,
        strategy: aeroV2Liquidator.address as Address
      },
      {
        inputToken: eusdUnderlying,
        outputToken: usdcUnderlying,
        strategy: aeroV2Liquidator.address as Address
      },
      {
        inputToken: usdcUnderlying,
        outputToken: eusdUnderlying,
        strategy: aeroV2Liquidator.address as Address
      },
      {
        inputToken: hyusdUnderlying,
        outputToken: eusdUnderlying,
        strategy: aeroV2Liquidator.address as Address
      },
      {
        inputToken: eusdUnderlying,
        outputToken: hyusdUnderlying,
        strategy: aeroV2Liquidator.address as Address
      },
      {
        inputToken: wsuperOETHUnderlying,
        outputToken: wethUnderlying,
        strategy: aeroCLLiquidator.address as Address
      },
      {
        inputToken: wethUnderlying,
        outputToken: wsuperOETHUnderlying,
        strategy: aeroCLLiquidator.address as Address
      },
      {
        inputToken: wusdmUnderlying,
        outputToken: usdcUnderlying,
        strategy: curveSwapLiquidator.address as Address
      },
      {
        inputToken: usdcUnderlying,
        outputToken: wusdmUnderlying,
        strategy: curveSwapLiquidator.address as Address
      },
      {
        inputToken: weethUnderlying,
        outputToken: wethUnderlying,
        strategy: aeroV2Liquidator.address as Address
      },
      {
        inputToken: wethUnderlying,
        outputToken: weethUnderlying,
        strategy: aeroV2Liquidator.address as Address
      },
      {
        inputToken: ognAsset.underlying,
        outputToken: wsuperOETHUnderlying,
        strategy: aeroV2Liquidator.address as Address
      },
      {
        inputToken: wsuperOETHUnderlying,
        outputToken: ognAsset.underlying,
        strategy: aeroV2Liquidator.address as Address
      },
      {
        inputToken: eurcAsset.underlying,
        outputToken: wethUnderlying,
        strategy: aeroV2Liquidator.address as Address
      },
      {
        inputToken: wethUnderlying,
        outputToken: eurcAsset.underlying,
        strategy: aeroV2Liquidator.address as Address
      },
      {
        inputToken: uSOLAsset.underlying,
        outputToken: wethUnderlying,
        strategy: aeroCLLiquidator.address as Address
      },
      {
        inputToken: wethUnderlying,
        outputToken: uSOLAsset.underlying,
        strategy: aeroCLLiquidator.address as Address
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
      }
    ];
    const liqTx = await liquidatorRegistry.write._resetRedemptionStrategies([
      pairs.map((pair) => pair.strategy),
      pairs.map((pair) => pair.inputToken),
      pairs.map((pair) => pair.outputToken)
    ]);
    await publicClient.waitForTransactionReceipt({ hash: liqTx });
    console.log("Transaction sent to reset redemption strategies:", liqTx);

    await setOptimalSwapPath(viem, deployments, deployer as Address, {
      inputToken: ognAsset.underlying,
      outputToken: wethUnderlying,
      optimalPath: [wsuperOETHUnderlying, weethUnderlying]
    });

    await setOptimalSwapPath(viem, deployments, deployer as Address, {
      inputToken: wsuperOETHUnderlying,
      outputToken: ognAsset.underlying,
      optimalPath: [wethUnderlying, ognAsset.underlying]
    });
  }
);

