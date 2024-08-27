import { task, types } from "hardhat/config";
import { assetFilter } from "../../chainDeploy/helpers/utils";
import { Address, formatEther, parseUnits } from "viem";

// const underlyingsMapping = {
//   [sepolia.chainId]: sepolia.assets
// };

// task("borrow", "Borrow assets")
//   .addParam("signer", "Named account to use for transactions", "deployer", types.string)
//   .addParam("comptroller", "Address of the Comptroller contract", undefined, types.string)
//   .addParam("symbol", "Symbol of the asset for which to deploy the plugin", undefined, types.string)
//   .addParam("amount", "Amount to borrow, specified in underlying units", undefined, types.string)
//   .setAction(async (taskArgs, { viem, getChainId }) => {
//     const publicClient = await viem.getPublicClient();
//     const chainId = parseInt(await getChainId());
//     const underlyings = underlyingsMapping[chainId];

//     // task argument parsing
//     const comptroller = taskArgs.comptroller;
//     const symbol = taskArgs.symbol;

//     const { underlying, decimals } = assetFilter(underlyings, symbol);
//     const _comptroller = await viem.getContractAt("IonicComptroller", comptroller as Address);
//     const marketAddress = await _comptroller.read.cTokensByUnderlying([underlying]);

//     const cToken = await viem.getContractAt("ICErc20PluginRewards", marketAddress);
//     console.log("cToken: ", cToken.address);

//     const result = await cToken.simulate.borrow([parseUnits(taskArgs.amount, decimals)]);
//     if (result.result !== 0n) {
//       throw new Error(`Failed to borrow, error code: ${result.result}`);
//     }

//     const tx = await cToken.write.borrow([parseUnits(taskArgs.amount, decimals)]);
//     await publicClient.waitForTransactionReceipt({ hash: tx });
//     console.log("Transaction confirmed!");
//   });

task("market:userHealth", "deploy market")
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("user", "User being queried", undefined, types.string)
  .setAction(async (taskArgs, { viem }) => {
    const comptroller = await viem.getContractAt("IonicComptroller", taskArgs.comptroller);

    // Query account liquidity to check the user's financial health
    const [error, collateralValue, liquidity, shortfall] = await comptroller.read.getAccountLiquidity([taskArgs.user]);
    if (error !== 0n) {
      console.error(`Error occurred: ${error.toString()}`);
      return;
    }

    // Print the liquidity and shortfall details
    console.log(`Liquidity: ${formatEther(liquidity)} ETH`);
    console.log(`Shortfall: ${formatEther(shortfall)} ETH`);

    if (shortfall === 0n) {
      console.log("User account is healthy.");
    } else {
      console.log("User account is at risk of liquidation.");
    }
  });
