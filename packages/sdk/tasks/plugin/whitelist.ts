import { ethers } from "ethers";
import { task, types } from "hardhat/config";

import { FeeDistributor } from "../../typechain/FeeDistributor";

export default task("plugin:whitelist", "Whitelists a plugin implementation")
  .addParam("oldImplementation", "The old plugin implementation address", undefined, types.string)
  .addParam("newImplementation", "The new plugin implementation address", undefined, types.string)
  .addOptionalParam("admin", "Named account that is an admin of the FeeDistributor", "deployer", types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const oldPluginImplementation = taskArgs.oldImplementation;
    const newPluginImplementation = taskArgs.newImplementation;
    const signer = await ethers.getNamedSigner(taskArgs.admin);

    const oldImplementations = [];
    const newImplementations = [];
    const arrayOfTrue = [];
    const feeDistributor = (await ethers.getContract("FeeDistributor", signer)) as FeeDistributor;

    let tx: ethers.ContractTransaction;

    if (oldPluginImplementation) {
      oldImplementations.push(oldPluginImplementation);
      newImplementations.push(newPluginImplementation);
      arrayOfTrue.push(true);

      tx = await feeDistributor._setLatestPluginImplementation(oldPluginImplementation, newPluginImplementation);
      await tx.wait();
      console.log(`Set latest plugin implementation to: ${newPluginImplementation} from ${newPluginImplementation}`);
    }

    tx = await feeDistributor._editPluginImplementationWhitelist(oldImplementations, newImplementations, arrayOfTrue);
    const receipt = await tx.wait();
    console.log("Set whitelist for plugins with status:", receipt.status);
  });
