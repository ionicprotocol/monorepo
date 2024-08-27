import { task, types } from "hardhat/config";
import { Address } from "viem";

task("non-owner-pool:upgrade")
  .addParam("comptrollerAddress", "The comptroller implementation address", undefined, types.string)
  .addParam("poolAddress", "The pool address", undefined, types.string)
  .setAction(async ({ comptrollerAddress, poolAddress }, { viem }) => {
    const publicClient = await viem.getPublicClient();
    // pools to upgrade
    const pools: Address[] = [poolAddress];

    const comptrollerImpl = await viem.getContractAt("Comptroller", comptrollerAddress);

    for (let i = 0; i < pools.length; i++) {
      const asUnitroller = await viem.getContractAt("Unitroller", pools[i]);

      const currentImpl = await asUnitroller.read.comptrollerImplementation();
      if (currentImpl != comptrollerImpl.address) {
        console.log(`current impl is ${currentImpl}`);
        console.log(`should be ${comptrollerImpl.address}`);

        let tx = await asUnitroller.write._registerExtension([comptrollerImpl.address, currentImpl]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`new comptroller set with ${tx}`);
        console.log(`updating the extensions`);

        tx = await asUnitroller.write._upgrade();
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`extensions updated ${tx}`);
      } else {
        console.log(`already the needed impl ${currentImpl}`);
      }
    }
  });
