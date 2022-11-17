import { task, types } from "hardhat/config";

import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { FuseFeeDistributor } from "../../lib/contracts/typechain/FuseFeeDistributor";

task("non-owner-pool:upgrade")
  .addParam("comptrollerAddress", "Named account to use for tx", "deployer", types.string)
  .setAction(async ({ comptrollerAddress }, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");
    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", signer)) as FuseFeeDistributor;
    const sliced = comptrollerAddress.slice(2);
    const comptroller = (await ethers.getContractAt("Comptroller", comptrollerAddress, signer)) as Comptroller;

    const admin = await comptroller.callStatic.admin();
    console.log("pool admin", admin);

    const toggleOnTx = {
      to: fuseFeeDistributor.address,
      data: `0xb01b86fd000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000${sliced}0000000000000000000000000000000000000000000000000000000000000024d5333166000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000`,
    };

    let tx = await signer.sendTransaction(toggleOnTx);
    await tx.wait();
    console.log(`toggled on with ${tx.hash}`);

    tx = await comptroller.enterMarkets([]);
    await tx.wait();
    console.log(`upgraded with ${tx.hash}`);

    const toggleOffTx = {
      to: fuseFeeDistributor.address,
      data: `0xb01b86fd000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000${sliced}0000000000000000000000000000000000000000000000000000000000000024d5333166000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`,
    };

    tx = await signer.sendTransaction(toggleOffTx);
    await tx.wait();
    console.log(`toggled off with ${tx.hash}`);
  });
