import { task, types } from "hardhat/config";
import { Unitroller } from "../../lib/contracts/typechain/Unitroller";
import { FuseFeeDistributor } from "../../lib/contracts/typechain/FuseFeeDistributor";
import { Comptroller } from "../../lib/contracts/typechain/Comptroller";

task("risedle-pool:upgrade")
.setAction(async ({}, { ethers }) => {
  const signer = await ethers.getNamedSigner("deployer");

  const poolAddress = "0xb2234eE69555EE4C3b6cEA4fd25c4979BbDBf0fd";

  const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", signer)) as FuseFeeDistributor;

  const unitroller = (await ethers.getContractAt("Unitroller", poolAddress, signer)) as Unitroller;

  const comptroller = (await ethers.getContractAt("Comptroller", poolAddress, signer)) as Comptroller;

  const admin = await comptroller.callStatic.admin();
  console.log("pool admin", admin);

  const toggleOnTx = {
    to: fuseFeeDistributor.address,
    data: "0xb01b86fd000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000b2234ee69555ee4c3b6cea4fd25c4979bbdbf0fd0000000000000000000000000000000000000000000000000000000000000024d5333166000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000"
  };

  let tx = await signer.sendTransaction(toggleOnTx);
  await tx.wait();
  console.log(`toggled on with ${tx.hash}`);


  tx = await comptroller.enterMarkets([]);
  await tx.wait();
  console.log(`upgraded with ${tx.hash}`);

  const toggleOffTx = {
    to: fuseFeeDistributor.address,
    data: "0xb01b86fd000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000b2234ee69555ee4c3b6cea4fd25c4979bbdbf0fd0000000000000000000000000000000000000000000000000000000000000024d5333166000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
  };

  tx = await signer.sendTransaction(toggleOffTx);
  await tx.wait();
  console.log(`toggled off with ${tx.hash}`);

});
