import { task, types } from "hardhat/config";

//
export default task("irm:deploy:custom-jrm", "deploys custom JRM")
  .addParam("irm", "IRM to use", "JumpRateModel", types.string)
  .addParam("postfix", "Postfix to use for the deployment name", undefined, types.string)
  .addParam("args", "args to use", undefined, types.string)
  .setAction(async ({ irm: _irm, args: _args, postfix: _postfix }, { deployments, ethers }) => {
    const { deployer } = await ethers.getNamedSigners();

    const midasSdkModule = await import("../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const [baseRatePerYear, multiplierPerYear, jumpMultiplierPerYear, kink] = _args
      .split(",")
      .map((a: string) => ethers.utils.parseEther(a));

    console.log(
      baseRatePerYear.toString(),
      multiplierPerYear.toString(),
      jumpMultiplierPerYear.toString(),
      kink.toString()
    );

    let args;

    if (_irm === "JumpRateModel") {
      args = [
        sdk.chainSpecificParams.blocksPerYear.toNumber(),
        baseRatePerYear.toString(),
        multiplierPerYear.toString(),
        jumpMultiplierPerYear.toString(),
        kink.toString(),
      ];
      console.log(`Deploying JRM with arguments: ${args.join(", ")}`);
    } else if (_irm === "AdjustableJumpRateModel") {
      args = [
        {
          blocksPerYear: sdk.chainSpecificParams.blocksPerYear.toNumber(),
          baseRatePerYear: baseRatePerYear.toString(),
          multiplierPerYear: multiplierPerYear.toString(),
          jumpMultiplierPerYear: jumpMultiplierPerYear.toString(),
          kink: kink.toString(),
        },
      ];
      console.log(`Deploying JRM with arguments: ${args[0]}`);
    } else {
      throw new Error("Unknown irm");
    }

    const deploymentName = [_irm, "_", _postfix].join("");
    console.log(`Deploying JRM as ${deploymentName}`);

    const deployment = await deployments.deploy(_irm + "_" + _postfix, {
      contract: _irm,
      from: deployer.address,
      args: args,
      log: true,
    });

    if (deployment.transactionHash) await ethers.provider.waitForTransaction(deployment.transactionHash);

    console.log("IRM Deployed: ", deployment.address);
  });

task("irm:edit:adjustable-jrm-params", "Edit adjustable JRM parameters")
  .addParam("irmAddress", "IRM address to adjust", undefined, types.string)
  .addParam("args", "args to use", undefined, types.string)
  .setAction(async ({ irmAddress: _irm, args: _args }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();

    const midasSdkModule = await import("../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
    const irm = await ethers.getContractAt("AdjustableJumpRateModel", _irm, deployer);

    let promises: Array<Promise<any>>;
    let blocksPerYear;
    let multiplierPerBlock;
    let baseRatePerBlock;
    let kink_;

    promises = [
      irm.callStatic.blocksPerYear(),
      irm.callStatic.multiplierPerBlock(),
      irm.callStatic.baseRatePerBlock(),
      irm.callStatic.kink(),
    ];

    [blocksPerYear, multiplierPerBlock, baseRatePerBlock, kink_] = await (
      await Promise.all(promises)
    ).map((v) => v.toString());
    console.log("Params before: ", { blocksPerYear, multiplierPerBlock, baseRatePerBlock, kink_ });

    const [baseRatePerYear, multiplierPerYear, jumpMultiplierPerYear, kink] = _args
      .split(",")
      .map((a: string) => ethers.utils.parseEther(a));

    const args = {
      blocksPerYear: sdk.chainSpecificParams.blocksPerYear.toNumber(),
      baseRatePerYear: baseRatePerYear.toString(),
      multiplierPerYear: multiplierPerYear.toString(),
      jumpMultiplierPerYear: jumpMultiplierPerYear.toString(),
      kink: kink.toString(),
    };

    console.log({ args });

    const tx = await irm._setIrmParameters(args);
    await tx.wait();
    console.log(`IRM ${_irm} updated`);

    promises = [
      irm.callStatic.blocksPerYear(),
      irm.callStatic.multiplierPerBlock(),
      irm.callStatic.baseRatePerBlock(),
      irm.callStatic.kink(),
    ];

    [blocksPerYear, multiplierPerBlock, baseRatePerBlock, kink_] = await (
      await Promise.all(promises)
    ).map((v) => v.toString());
    console.log("Params after: ", { blocksPerYear, multiplierPerBlock, baseRatePerBlock, kink_ });
  });
