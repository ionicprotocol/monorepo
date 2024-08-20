import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address } from "viem";

export const upgradeMarketToSupportFlywheel = async (
  market: Address,
  viem: HardhatRuntimeEnvironment["viem"],
  deployments: HardhatRuntimeEnvironment["deployments"]
) => {
  const _ctoken = await viem.getContractAt("ICErc20", market);
  const type = await _ctoken.read.delegateType();
  if (type !== 3) {
    // upgrade pool
    const cErc20 = await viem.getContractAt("ICErc20", market);
    const comptroller = await cErc20.read.comptroller();
    const publicClient = await viem.getPublicClient();
    // Upgrade markets to the new implementation
    console.log(`Upgrading market: ${market} to CErc20RewardsDelegate`);
    const _comptroller = await viem.getContractAt("IonicComptroller", comptroller);

    const implementationData = "0x";
    const implementationAddress = (await deployments.get("CErc20RewardsDelegate")).address;
    console.log(`Setting implementation to ${implementationAddress}`);
    const setImplementationTx = await cErc20.write._setImplementationSafe([
      implementationAddress as Address,
      implementationData
    ]);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: setImplementationTx
    });
    if (receipt.status !== "success") {
      throw `Failed set implementation to ${implementationAddress}`;
    }
    console.log(`Implementation successfully set to ${implementationAddress}: ${setImplementationTx}`);
  } else {
    console.log("Market does not need to be upgraded. type: ", type);
  }
};
