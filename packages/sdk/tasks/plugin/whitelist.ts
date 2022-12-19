import { ethers } from "ethers";
import { task, types } from "hardhat/config";

import { FuseFeeDistributor } from "../../typechain/FuseFeeDistributor";

export default task("plugin:whitelist", "Whitelists a plugin implementation")
  .addParam("oldImplementation", "The old plugin implementation address", undefined, types.string)
  .addParam("newImplementation", "The new plugin implementation address", undefined, types.string)
  .addOptionalParam("admin", "Named account that is an admin of the FuseFeeDistributor", "deployer", types.string)
  .setAction(async (taskArgs, { ethers, run }) => {
    const oldPluginImplementation = taskArgs.oldImplementation;
    const newPluginImplementation = taskArgs.newImplementation;
    const signer = await ethers.getNamedSigner(taskArgs.admin);

    const oldImplementations = [];
    const newImplementations = [];
    const arrayOfTrue = [];
    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", signer)) as FuseFeeDistributor;

    let tx: ethers.ContractTransaction;

    if (oldPluginImplementation) {
      oldImplementations.push(oldPluginImplementation);
      newImplementations.push(newPluginImplementation);
      arrayOfTrue.push(true);

      tx = await fuseFeeDistributor._setLatestPluginImplementation(oldPluginImplementation, newPluginImplementation);
      await tx.wait();
      console.log(`Set latest plugin implementation to: ${newPluginImplementation} from ${newPluginImplementation}`);
    }

    tx = await fuseFeeDistributor._editPluginImplementationWhitelist(
      oldImplementations,
      newImplementations,
      arrayOfTrue
    );
    const receipt = await tx.wait();
    console.log("Set whitelist for plugins with status:", receipt.status);
  });
