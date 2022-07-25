import { task, types } from "hardhat/config";

import { FuseSafeLiquidator } from "../lib/contracts/typechain/FuseSafeLiquidator";

export default task("get-liquidations", "Get potential liquidations")
  .addOptionalParam(
    "comptrollers",
    "Supported comptrollers for which to search for liquidations",
    undefined,
    types.string
  )
  .addOptionalParam("maxHealth", "Filter pools by max health", "1", types.string)
  .setAction(async (taskArgs, hre) => {
    // @ts-ignore
    const fuseModule = await import("../tests/utils/fuseSdk");
    const sdk = await fuseModule.getOrCreateFuse();
    const wallet = hre.ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
    const liquidations = await sdk.getPotentialLiquidations(
      wallet,
      [],
      hre.ethers.utils.parseEther(taskArgs.maxHealth)
    );
    liquidations.map((l) => {
      console.log(`Found ${l.liquidations.length} liquidations for pool: ${l.comptroller}}`);
      l.liquidations.map((tx, i) => {
        console.log(`\n #${i}: method: ${tx.method}, args: ${tx.args}, value: ${tx.value}`);
      });
    });
  });

// npx hardhat liquidate --borrower 0xd6b2095e913695dd10c071cc2f20247e921efb8e --repay-amount 103636250967557372900 --debt-cerc20 0x82A3103bc306293227B756f7554AfAeE82F8ab7a --collateral-cerc20 0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9 --min-output-amount 0 --exchange-seized-to 0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9 --uniswap-v2-router 0x10ED43C718714eb63d5aA57B78B54704E256024E --network bsc

task("liquidate", "Liquidate a position without a flash loan")
  .addParam(
    "borrower",
    "The address of the borrower whose debt will be repaid and collateral will be seized",
    undefined,
    types.string,
    false
  )
  .addParam("repayAmount", "The amount to repay to liquidate the unhealthy loan", undefined, types.string, false)
  .addParam("debtCerc20", "The borrowed cErc20 to repay", undefined, types.string, false)
  .addParam("collateralCerc20", "The cToken collateral to be liquidated", undefined, types.string, false)
  .addOptionalParam(
    "minOutputAmount",
    "The minimum amount of collateral to seize (or the minimum exchange output if applicable) required for execution. Reverts if this condition is not met.",
    0,
    types.int
  )
  .addOptionalParam(
    "exchangeSeizedTo",
    "If set to an address other than `cTokenCollateral`, exchange seized collateral to this ERC20 token contract address (or the zero address for NATIVE).",
    "",
    types.string
  )
  .addParam(
    "uniswapV2Router",
    "The UniswapV2Router to use to convert the seized underlying collateral. (Is interchangable with any UniV2 forks)"
  )
  .addParam(
    "redemptionStrategies",
    "The IRedemptionStrategy contracts to use, if any, to redeem 'special' collateral tokens (before swapping the output for borrowed tokens to be repaid via Uniswap).",
    [],
    types.json
  )
  .addParam("strategyData", "The data for the chosen IRedemptionStrategy contracts, if any.", [], types.json)
  .setAction(async (taskArgs, hre) => {
    console.log(`taskArgs are ${JSON.stringify(taskArgs)}`);

    const fuseSafeLiquidator = (await hre.ethers.getContract("FuseSafeLiquidator")) as FuseSafeLiquidator;
    await fuseSafeLiquidator[
      "safeLiquidate(address,uint256,address,address,uint256,address,address,address[],bytes[])"
    ](
      taskArgs.borrower,
      taskArgs.repayAmount,
      taskArgs.debtCerc20,
      taskArgs.collateralCerc20,
      taskArgs.minOutputAmount,
      taskArgs.exchangeSeizedTo,
      taskArgs.uniswapV2Router,
      taskArgs.redemptionStrategies,
      taskArgs.strategyData
    );
  });
