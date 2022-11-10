import { BigNumber, providers } from "ethers";
import { task, types } from "hardhat/config";

import { CErc20Delegate } from "../lib/contracts/typechain/CErc20Delegate";
import { ERC20 } from "../lib/contracts/typechain/ERC20";
import { FuseSafeLiquidator } from "../lib/contracts/typechain/FuseSafeLiquidator";

export default task("get-liquidations", "Get potential liquidations")
  .addOptionalParam(
    "excludedComptrollers",
    "Supported comptrollers for which to search for liquidations",
    undefined,
    types.string
  )
  .addOptionalParam("maxHealth", "Filter pools by max health", "1", types.string)
  .setAction(async (taskArgs, hre) => {
    // @ts-ignore
    const midasSdkModule = await import("../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    let excludedComptrollers: Array<string> = [];
    if (taskArgs.excludedComptrollers) excludedComptrollers = taskArgs.excludedComptrollers.split(",");

    const [liquidations, _] = await sdk.getPotentialLiquidations(
      excludedComptrollers,
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
  .addParam("signer", "The signer address", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    let tx: providers.TransactionResponse;
    let receipt: providers.TransactionReceipt;
    const signer = await hre.ethers.getNamedSigner(taskArgs.signer);
    const repayAmount = BigNumber.from(taskArgs.repayAmount);
    const fuseSafeLiquidator = (await hre.ethers.getContract("FuseSafeLiquidator", signer)) as FuseSafeLiquidator;

    const debtToken = (await hre.ethers.getContractAt("CErc20", taskArgs.debtCerc20, signer)) as CErc20Delegate;

    const underlyingAddress = await debtToken.callStatic.underlying();
    const underlying = (await hre.ethers.getContractAt("ERC20", underlyingAddress, signer)) as ERC20;
    const signerBorrowedTokenBalance = await underlying.callStatic.balanceOf(signer.address);

    console.log(`Signer ${signer.address} has balance of underlying ${signerBorrowedTokenBalance}`);

    const repayAmountPlus = repayAmount.mul(2);
    let fslUnderlyingAllowance = await underlying.callStatic.allowance(signer.address, fuseSafeLiquidator.address);
    if (fslUnderlyingAllowance.lt(repayAmountPlus)) {
      console.log(`FSL has insufficient allowance of underlying from the signer, increasing to ${repayAmountPlus}`);
      tx = await underlying.approve(fuseSafeLiquidator.address, repayAmountPlus);
      receipt = await tx.wait();
      fslUnderlyingAllowance = await underlying.callStatic.allowance(signer.address, fuseSafeLiquidator.address);
      console.log(
        `Approved FSL ${fuseSafeLiquidator.address} to spend ${fslUnderlyingAllowance} from ${signer.address} with tx ${receipt.transactionHash}`
      );
    }
    console.log(`FSL has allowance for the underlying ${fslUnderlyingAllowance} to pull from ${signer.address}`);

    console.log(`Liquidating...`);
    tx = await fuseSafeLiquidator[
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
    receipt = await tx.wait();
    console.log(`Liquidated ${receipt.transactionHash}`);
  });

// npx hardhat liquidate:hardcoded --network bsc

task("liquidate:hardcoded", "Liquidate a position without a flash loan").setAction(async (taskArgs, hre) => {
  const signer = await hre.ethers.getNamedSigner("deployer");
  const fuseSafeLiquidator = (await hre.ethers.getContract("FuseSafeLiquidator", signer)) as FuseSafeLiquidator;

  console.log(`big num ${BigNumber.from("20853697380464596")}`);

  console.log(`Liquidating...`);
  const vars: FuseSafeLiquidator.LiquidateToTokensWithFlashSwapVarsStruct = {
    borrower: "0x02E7b714fae84e4BA80f3CDa5508553e7CF5042A",
    repayAmount: BigNumber.from("1036500101199996"),
    cErc20: "0x38982105A2F81dc5dBDEA6c131bB4bF5a416513A",
    cTokenCollateral: "0xdB1C2240004a3Fd33BF71B2D66b1662604168eAc",
    flashSwapPair: "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16",
    minProfitAmount: BigNumber.from("0"),
    exchangeProfitTo: hre.ethers.constants.AddressZero,
    uniswapV2RouterForBorrow: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    uniswapV2RouterForCollateral: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    redemptionStrategies: [],
    strategyData: [],
    ethToCoinbase: BigNumber.from(0),
    debtFundingStrategies: [],
    debtFundingStrategiesData: [],
  };
  const tx: providers.TransactionResponse = await fuseSafeLiquidator.safeLiquidateToTokensWithFlashLoan(vars, {
    gasLimit: 2100000,
  });
  const receipt: providers.TransactionReceipt = await tx.wait();
  console.log(`Liquidated ${receipt.transactionHash}`);
});
