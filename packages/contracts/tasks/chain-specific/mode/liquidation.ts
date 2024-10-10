import { task } from "hardhat/config";
import { Address } from "viem";
import { mode } from "@ionicprotocol/chains";
import { resetLiquidationStrategies, setOptimalSwapPath } from "../../liquidation";
import { assetSymbols } from "@ionicprotocol/types";
import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";

task("mode:liquidation:whitelist-redemption-strategies", "Whitelist redemption strategies").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const aerodromeV2Liquidator = await deployments.get("AerodromeV2Liquidator");
    const kimLiquidator = await deployments.get("AlgebraSwapLiquidator");
    const velodromeV2Liquidator = await deployments.get("VelodromeV2Liquidator");
    const ionicLiquidator = await viem.getContractAt(
      "IonicUniV3Liquidator",
      (await deployments.get("IonicUniV3Liquidator")).address as Address
    );
    const liquidators = [
      aerodromeV2Liquidator.address as Address,
      kimLiquidator.address as Address,
      velodromeV2Liquidator.address as Address
    ];
    for (const liquidator of liquidators) {
      const isWhitelisted = await ionicLiquidator.read.redemptionStrategiesWhitelist([liquidator]);
      if (!isWhitelisted) {
        const tx = await ionicLiquidator.write._whitelistRedemptionStrategies([[liquidator], [true]]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`Whitelisted ${liquidator} at ${tx}`);
      } else {
        console.log(`${liquidator} already whitelisted`);
      }
    }
  }
);

task("mode:liquidation:set-redemption-strategies", "Set redemption strategy").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const modeToken = mode.assets.find((asset) => asset.symbol === assetSymbols.MODE);
    const usdtToken = mode.assets.find((asset) => asset.symbol === assetSymbols.USDT);
    const wethToken = mode.assets.find((asset) => asset.symbol === assetSymbols.WETH);
    const stoneToken = mode.assets.find((asset) => asset.symbol === assetSymbols.STONE);
    const mbtcToken = mode.assets.find((asset) => asset.symbol === assetSymbols.mBTC);
    const weethToken = mode.assets.find((asset) => asset.symbol === assetSymbols.weETH);
    const ezethToken = mode.assets.find((asset) => asset.symbol === assetSymbols.ezETH);
    const usdcToken = mode.assets.find((asset) => asset.symbol === assetSymbols.USDC);
    const rsETHToken = mode.assets.find((asset) => asset.symbol === assetSymbols.wrsETH);
    const wbtcToken = mode.assets.find((asset) => asset.symbol === assetSymbols.WBTC);
    const weEthOld = "0x028227c4dd1e5419d11Bb6fa6e661920c519D4F5";
    if (
      !modeToken ||
      !usdtToken ||
      !stoneToken ||
      !mbtcToken ||
      !weethToken ||
      !wethToken ||
      !ezethToken ||
      !usdcToken ||
      !rsETHToken ||
      !wbtcToken
    ) {
      throw new Error("Tokens not found");
    }
    const liquidatorsRegistry = await viem.getContractAt(
      "ILiquidatorsRegistry",
      (await deployments.get("LiquidatorsRegistry")).address as Address
    );
    const isStables = [[wethToken.underlying, weethToken.underlying]];
    for (const stable of isStables) {
      let isStable = await liquidatorsRegistry.read.aeroV2IsStable([stable[0], stable[1]]);
      if (!isStable) {
        await prepareAndLogTransaction({
          contractInstance: liquidatorsRegistry,
          functionName: "_setAeroV2IsStable",
          args: [stable[0], stable[1], true],
          description: `Set ${stable[0]} to ${stable[1]} as stable`,
          inputs: [
            {
              internalType: "address",
              name: "inputToken",
              type: "address"
            },
            {
              internalType: "address",
              name: "outputToken",
              type: "address"
            },
            {
              internalType: "bool",
              name: "isStable",
              type: "bool"
            }
          ]
        });
      }
      isStable = await liquidatorsRegistry.read.aeroV2IsStable([stable[1], stable[0]]);
      if (!isStable) {
        await prepareAndLogTransaction({
          contractInstance: liquidatorsRegistry,
          functionName: "_setAeroV2IsStable",
          args: [stable[1], stable[0], true],
          description: `Set ${stable[1]} to ${stable[0]} as stable`,
          inputs: [
            {
              internalType: "address",
              name: "inputToken",
              type: "address"
            },
            {
              internalType: "address",
              name: "outputToken",
              type: "address"
            },
            {
              internalType: "bool",
              name: "isStable",
              type: "bool"
            }
          ]
        });
      }
    }
    const kimLiquidator = await deployments.get("AlgebraSwapLiquidator");
    const velodromeV2Liquidator = await deployments.get("VelodromeV2Liquidator");
    await resetLiquidationStrategies(viem, deployments, deployer as Address, [
      {
        inputToken: modeToken.underlying,
        outputToken: wethToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: modeToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: usdtToken.underlying,
        outputToken: usdcToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: usdcToken.underlying,
        outputToken: usdtToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: usdcToken.underlying,
        outputToken: wethToken.underlying,
        strategy: velodromeV2Liquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: usdcToken.underlying,
        strategy: velodromeV2Liquidator.address as Address
      },
      {
        inputToken: stoneToken.underlying,
        outputToken: wethToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: stoneToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: mbtcToken.underlying,
        outputToken: wethToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: mbtcToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: weethToken.underlying,
        outputToken: wethToken.underlying,
        strategy: velodromeV2Liquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: weethToken.underlying,
        strategy: velodromeV2Liquidator.address as Address
      },
      {
        inputToken: weEthOld,
        outputToken: wethToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: ezethToken.underlying,
        outputToken: wethToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: ezethToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: usdcToken.underlying,
        outputToken: usdtToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: usdtToken.underlying,
        outputToken: usdcToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: rsETHToken.underlying,
        outputToken: wethToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: rsETHToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: wbtcToken.underlying,
        outputToken: wethToken.underlying,
        strategy: kimLiquidator.address as Address
      },
      {
        inputToken: wethToken.underlying,
        outputToken: wbtcToken.underlying,
        strategy: kimLiquidator.address as Address
      }
    ]);

    await setOptimalSwapPath(viem, deployments, deployer as Address, {
      inputToken: modeToken.underlying,
      outputToken: usdtToken.underlying,
      optimalPath: [wethToken.underlying, usdcToken.underlying, usdtToken.underlying]
    });

    await setOptimalSwapPath(viem, deployments, deployer as Address, {
      inputToken: ezethToken.underlying,
      outputToken: usdtToken.underlying,
      optimalPath: [wethToken.underlying, usdcToken.underlying, usdtToken.underlying]
    });

    await setOptimalSwapPath(viem, deployments, deployer as Address, {
      inputToken: ezethToken.underlying,
      outputToken: usdcToken.underlying,
      optimalPath: [wethToken.underlying, usdcToken.underlying]
    });

    await setOptimalSwapPath(viem, deployments, deployer as Address, {
      inputToken: rsETHToken.underlying,
      outputToken: stoneToken.underlying,
      optimalPath: [wethToken.underlying, stoneToken.underlying]
    });

    await setOptimalSwapPath(viem, deployments, deployer as Address, {
      inputToken: wbtcToken.underlying,
      outputToken: weethToken.underlying,
      optimalPath: [wethToken.underlying, weethToken.underlying]
    });

    await setOptimalSwapPath(viem, deployments, deployer as Address, {
      inputToken: weethToken.underlying,
      outputToken: wbtcToken.underlying,
      optimalPath: [wethToken.underlying, wbtcToken.underlying]
    });

    await setOptimalSwapPath(viem, deployments, deployer as Address, {
      inputToken: wbtcToken.underlying,
      outputToken: usdtToken.underlying,
      optimalPath: [wethToken.underlying, usdcToken.underlying, usdtToken.underlying]
    });

    await setOptimalSwapPath(viem, deployments, deployer as Address, {
      inputToken: usdtToken.underlying,
      outputToken: wbtcToken.underlying,
      optimalPath: [usdcToken.underlying, wethToken.underlying, wbtcToken.underlying]
    });
  }
);
