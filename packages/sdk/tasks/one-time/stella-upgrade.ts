import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";

import { FuseFeeDistributor } from "../../lib/contracts/typechain/FuseFeeDistributor";

task("plugin:deploy", "Deploy ERC4626 Strategy")
  .addParam("creator", "Deployer Address", "deployer", types.string)
  .addOptionalParam(
    "otherParams",
    "other params that might be required to construct the strategy",
    undefined,
    types.string
  )
  .setAction(async (taskArgs, { ethers, deployments }) => {
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const signer = await ethers.getNamedSigner(taskArgs.creator);

    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", signer)) as FuseFeeDistributor;

    const erc20PluginRewardsDel = await deployments.deploy("CErc20PluginRewardsDelegate", {
      from: signer.address,
      args: [],
      log: true,
      waitConfirmations: 1,
    });
    console.log("CErc20PluginRewardsDelegate: ", erc20PluginRewardsDel.address);

    const erc20PluginRewardsDelegate = await ethers.getContract("CErc20PluginRewardsDelegate", signer);

    const oldImplementations = [];
    const newImplementations = [];
    const arrayOfFalse = [];
    const arrayOfTrue = [];

    if (sdk.chainDeployment.CErc20PluginRewardsDelegate.address !== "0xad0538f54d7a503FE138b9fB62711B2034E0FD94") {
      throw "CErc20PluginRewardsDelegate address is not correct";
    }

    oldImplementations.push(sdk.chainDeployment.CErc20PluginRewardsDelegate.address);
    newImplementations.push(erc20PluginRewardsDelegate.address);

    arrayOfFalse.push(false);
    arrayOfTrue.push(true);

    const tx = await fuseFeeDistributor._editCErc20DelegateWhitelist(
      oldImplementations,
      newImplementations,
      arrayOfFalse,
      arrayOfTrue
    );

    await tx.wait();
    console.log("_editCErc20DelegateWhitelist:", tx.hash);

    const abiCoder = new ethers.utils.AbiCoder();

    const pluginAddress = "0x46eC3122C73CA62A18FFCFd434cDc1C341Fe96dB";
    const stellaMarket = "0x32Be4b977BaB44e9146Bb414c18911e652C56568";

    const implementationAddress = erc20PluginRewardsDelegate.address;
    const implementationData = abiCoder.encode(["address"], [pluginAddress]);

    const cTokenInstance = sdk.createCErc20PluginRewardsDelegate(stellaMarket);

    console.log(`Setting implementation to ${implementationAddress} with plugin ${pluginAddress}`);
    const setImplementationTx = await cTokenInstance._setImplementationSafe(
      implementationAddress,
      false,
      implementationData
    );

    const receipt: TransactionReceipt = await setImplementationTx.wait();
    if (receipt.status != ethers.constants.One.toNumber()) {
      throw `Failed set implementation to ${implementationAddress}`;
    }
    console.log(
      `Implementation successfully set to ${implementationAddress} with plugin ${await cTokenInstance.callStatic.plugin()}`
    );
  });
