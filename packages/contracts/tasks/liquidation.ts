import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address } from "viem";
import { prepareAndLogTransaction } from "../chainDeploy/helpers/logging";
import { task } from "hardhat/config";

export const resetLiquidationStrategies = async (
  viem: HardhatRuntimeEnvironment["viem"],
  deployments: HardhatRuntimeEnvironment["deployments"],
  deployer: Address,
  pairs: { inputToken: Address; outputToken: Address; strategy: Address }[]
) => {
  const publicClient = await viem.getPublicClient();
  const liquidatorRegistry = await viem.getContractAt(
    "ILiquidatorsRegistry",
    (await deployments.get("LiquidatorsRegistry")).address as Address
  );
  const owner = await liquidatorRegistry.read.owner();
  if (pairs.length > 0) {
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: liquidatorRegistry,
        functionName: "_resetRedemptionStrategies",
        args: [
          pairs.map((pair) => pair.strategy),
          pairs.map((pair) => pair.inputToken),
          pairs.map((pair) => pair.outputToken)
        ],
        description: "Set redemption strategies",
        inputs: [
          { internalType: "address[]", name: "strategies", type: "address[]" },
          { internalType: "address[]", name: "inputTokens", type: "address[]" },
          { internalType: "address[]", name: "outputTokens", type: "address[]" }
        ]
      });
    } else {
      console.log(`Setting redemption strategies for ${pairs.length} pairs`);
      const tx = await liquidatorRegistry.write._resetRedemptionStrategies([
        pairs.map((pair) => pair.strategy),
        pairs.map((pair) => pair.inputToken),
        pairs.map((pair) => pair.outputToken)
      ]);
      console.log("Transaction sent:", tx);
      await publicClient.waitForTransactionReceipt({ hash: tx });
    }
  } else {
    console.log("Redemption strategy already set");
  }
};

export const setOptimalSwapPath = async (
  viem: HardhatRuntimeEnvironment["viem"],
  deployments: HardhatRuntimeEnvironment["deployments"],
  deployer: Address,
  pair: { inputToken: Address; outputToken: Address; optimalPath: Address[] }
) => {
  const liquidatorRegistry = await viem.getContractAt(
    "ILiquidatorsRegistry",
    (await deployments.get("LiquidatorsRegistry")).address as Address
  );
  const owner = await liquidatorRegistry.read.owner();
  if (owner.toLowerCase() !== deployer.toLowerCase()) {
    await prepareAndLogTransaction({
      contractInstance: liquidatorRegistry,
      functionName: "_setOptimalSwapPath",
      args: [pair.inputToken, pair.outputToken, pair.optimalPath],
      description: "Set optimal swap path",
      inputs: [
        { internalType: "address", name: "inputToken", type: "address" },
        { internalType: "address", name: "outputToken", type: "address" },
        { internalType: "address[]", name: "optimalPath", type: "address[]" }
      ]
    });
  } else {
    const tx = await liquidatorRegistry.write._setOptimalSwapPath([
      pair.inputToken,
      pair.outputToken,
      pair.optimalPath
    ]);
    console.log("Transaction sent:", tx);
  }
};

task("liquidation:set-strategies", "Set redemption strategies for liquidators").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const univ2 = await deployments.getOrNull("KimUniV2Liquidator");
    const algebra = await deployments.getOrNull("AlgebraSwapLiquidator");
    const solidly = await deployments.getOrNull("SolidlySwapLiquidator");
    const univ3 = await deployments.getOrNull("UniswapV3LiquidatorFunder");
    const strategies = [univ2, algebra, solidly, univ3]
      .map((strategy) => strategy?.address)
      .filter((address) => address !== undefined) as Address[];

    const liquidator = await viem.getContractAt(
      "IonicLiquidator",
      (await deployments.get("IonicLiquidator")).address as Address
    );
    const liquidators: any[] = [liquidator];
    if (await deployments.getOrNull("IonicUniV3Liquidator")) {
      const liquidatorV3 = await viem.getContractAt(
        "IonicUniV3Liquidator",
        (await deployments.get("IonicUniV3Liquidator")).address as Address
      );
      liquidators.push(liquidatorV3);
    }
    for (const liquidator of liquidators) {
      const toBeSet: Address[] = [];
      for (const strategy of strategies) {
        const strat = await liquidator.read.redemptionStrategiesWhitelist([strategy]);
        console.log(`Strategy ${strategy} is whitelisted: ${strat}`);
        if (!strat) {
          toBeSet.push(strategy);
        }
      }
      console.log(`Setting strategies: ${toBeSet}`);
      const owner = await liquidator.read.owner();
      if (owner.toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: liquidator,
          functionName: "_whitelistRedemptionStrategies",
          args: [toBeSet, Array(toBeSet.length).fill(true)],
          description: "Whitelist redemption strategies",
          inputs: [
            { internalType: "address[]", name: "strategies", type: "address[]" },
            { internalType: "bool[]", name: "whitelisted", type: "bool[]" }
          ]
        });
      } else {
        const tx = await liquidator.write._whitelistRedemptionStrategies([toBeSet, Array(toBeSet.length).fill(true)]);
        console.log("Transaction sent:", tx);
      }
    }
  }
);

// import { CErc20Delegate } from "../typechain/CErc20Delegate";
// import { ERC20 } from "../typechain/ERC20";
// import { ILiquidator } from "../typechain/ILiquidator";
// import { IonicLiquidator } from "../typechain/IonicLiquidator";

// export default task("get-liquidations", "Get potential liquidations")
//   .addOptionalParam(
//     "excludedComptrollers",
//     "Supported comptrollers for which to search for liquidations",
//     undefined,
//     types.string
//   )
//   .addOptionalParam("maxHealth", "Filter pools by max health", "1", types.string)
//   .setAction(async (taskArgs, hre) => {
//     const ionicSdkModule = await import("./ionicSdk");
//     const sdk = await ionicSdkModule.getOrCreateIonic();

//     let excludedComptrollers: Array<string> = [];

//     if (taskArgs.excludedComptrollers) excludedComptrollers = taskArgs.excludedComptrollers.split(",");

//     const [liquidations, _] = await sdk.getPotentialLiquidations(
//       excludedComptrollers,
//       hre.ethers.utils.parseEther(taskArgs.maxHealth)
//     );
//     liquidations.map((l) => {
//       console.log(`Found ${l.liquidations.length} liquidations for pool: ${l.comptroller}}`);
//       l.liquidations.map((tx, i) => {
//         console.log(`\n #${i}: method: ${tx.method}, args: ${tx.args}, value: ${tx.value}`);
//       });
//     });
//   });

// // npx hardhat liquidate --borrower 0xd6b2095e913695dd10c071cc2f20247e921efb8e --repay-amount 103636250967557372900 --debt-cerc20 0x82A3103bc306293227B756f7554AfAeE82F8ab7a --collateral-cerc20 0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9 --min-output-amount 0 --exchange-seized-to 0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9 --uniswap-v2-router 0x10ED43C718714eb63d5aA57B78B54704E256024E --network bsc

// task("liquidate", "Liquidate a position without a flash loan")
//   .addParam(
//     "borrower",
//     "The address of the borrower whose debt will be repaid and collateral will be seized",
//     undefined,
//     types.string,
//     false
//   )
//   .addParam("repayAmount", "The amount to repay to liquidate the unhealthy loan", undefined, types.string, false)
//   .addParam("debtCerc20", "The borrowed cErc20 to repay", undefined, types.string, false)
//   .addParam("collateralCerc20", "The cToken collateral to be liquidated", undefined, types.string, false)
//   .addOptionalParam(
//     "minOutputAmount",
//     "The minimum amount of collateral to seize (or the minimum exchange output if applicable) required for execution. Reverts if this condition is not met.",
//     0,
//     types.int
//   )
//   .addOptionalParam(
//     "exchangeSeizedTo",
//     "If set to an address other than `cTokenCollateral`, exchange seized collateral to this ERC20 token contract address (or the zero address for NATIVE).",
//     "",
//     types.string
//   )
//   .addParam(
//     "uniswapV2Router",
//     "The UniswapV2Router to use to convert the seized underlying collateral. (Is interchangable with any UniV2 forks)"
//   )
//   .addParam(
//     "redemptionStrategies",
//     "The IRedemptionStrategy contracts to use, if any, to redeem 'special' collateral tokens (before swapping the output for borrowed tokens to be repaid via Uniswap).",
//     [],
//     types.json
//   )
//   .addParam("strategyData", "The data for the chosen IRedemptionStrategy contracts, if any.", [], types.json)
//   .addParam("signer", "The signer address", "deployer", types.string)
//   .setAction(async (taskArgs, hre) => {
//     let tx: providers.TransactionResponse;
//     let receipt: providers.TransactionReceipt;
//     const signer = await hre.ethers.getNamedSigner(taskArgs.signer);
//     const repayAmount = BigNumber.from(taskArgs.repayAmount);
//     const safeLiquidator = (await hre.ethers.getContract("IonicLiquidator", signer)) as IonicLiquidator;

//     const debtToken = (await hre.ethers.getContractAt(
//       "CTokenInterfaces.sol:ICErc20",
//       taskArgs.debtCerc20,
//       signer
//     )) as CErc20Delegate;

//     const underlyingAddress = await debtToken.callStatic.underlying();
//     const underlying = (await hre.ethers.getContractAt("ERC20", underlyingAddress, signer)) as ERC20;
//     const signerBorrowedTokenBalance = await underlying.callStatic.balanceOf(signer.address);

//     console.log(`Signer ${signer.address} has balance of underlying ${signerBorrowedTokenBalance}`);

//     const repayAmountPlus = repayAmount.mul(2);
//     let fslUnderlyingAllowance = await underlying.callStatic.allowance(signer.address, safeLiquidator.address);
//     if (fslUnderlyingAllowance.lt(repayAmountPlus)) {
//       console.log(`FSL has insufficient allowance of underlying from the signer, increasing to ${repayAmountPlus}`);
//       tx = await underlying.approve(safeLiquidator.address, repayAmountPlus);
//       receipt = await tx.wait();
//       fslUnderlyingAllowance = await underlying.callStatic.allowance(signer.address, safeLiquidator.address);
//       console.log(
//         `Approved FSL ${safeLiquidator.address} to spend ${fslUnderlyingAllowance} from ${signer.address} with tx ${receipt.transactionHash}`
//       );
//     }
//     console.log(`FSL has allowance for the underlying ${fslUnderlyingAllowance} to pull from ${signer.address}`);

//     console.log(`Liquidating...`);
//     tx = await safeLiquidator.safeLiquidate(
//       taskArgs.borrower,
//       taskArgs.repayAmount,
//       taskArgs.debtCerc20,
//       taskArgs.collateralCerc20,
//       taskArgs.minOutputAmount
//     );
//     receipt = await tx.wait();
//     console.log(`Liquidated ${receipt.transactionHash}`);
//   });

// task("liquidate:nonfl:hardcoded").setAction(async ({}, { run }) => {
//   await run("liquidate", {
//     borrower: "0xF93A5F0A4925EeC32cD585641c88a498523f383C",
//     repayAmount: "1372091245495",
//     debtCerc20: "0xa9736bA05de1213145F688e4619E5A7e0dcf4C72",
//     collateralCerc20: "0xb3D83F2CAb787adcB99d4c768f1Eb42c8734b563",
//     exchangeSeizedTo: "0x191cf2602Ca2e534c5Ccae7BCBF4C46a704bb949",
//     uniswapV2Router: "0x70085a09D30D6f8C4ecF6eE10120d1847383BB57",
//     redemptionStrategies: [],
//     strategyData: []
//   });
// });

// // npx hardhat liquidate:hardcoded --network bsc

// task("liquidate:hardcoded", "Liquidate a position without a flash loan").setAction(async (taskArgs, hre) => {
//   const signer = await hre.ethers.getNamedSigner("deployer");
//   const safeLiquidator = (await hre.ethers.getContract("IonicLiquidator", signer)) as IonicLiquidator;

//   console.log(`Liquidating...`);
//   const vars: ILiquidator.LiquidateToTokensWithFlashSwapVarsStruct = {
//     borrower: "0xF93A5F0A4925EeC32cD585641c88a498523f383C",
//     repayAmount: "1372091245495",
//     cErc20: "0xa9736bA05de1213145F688e4619E5A7e0dcf4C72",
//     cTokenCollateral: "0xb3D83F2CAb787adcB99d4c768f1Eb42c8734b563",
//     flashSwapContract: "0xa927E1e1E044CA1D9fe1854585003477331fE2Af",
//     minProfitAmount: BigNumber.from("0"),
//     redemptionStrategies: [],
//     strategyData: [],
//     debtFundingStrategies: ["0xB8423EE8aa0476a909786D079dF5C0766cB09142"],
//     debtFundingStrategiesData: [
//       "0x00000000000000000000000070085a09d30d6f8c4ecf6ee10120d1847383bb5700000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000931715FEE2d06333043d11F658C8CE934aC61D0c000000000000000000000000ffffffff1fcacbd218edc0eba20fc2308c778080"
//     ]
//   };
//   const tx: providers.TransactionResponse = await safeLiquidator.safeLiquidateToTokensWithFlashLoan(vars, {
//     gasLimit: 2100000
//   });
//   const receipt: providers.TransactionReceipt = await tx.wait();
//   console.log(`Liquidated ${receipt.transactionHash}`);
// });
