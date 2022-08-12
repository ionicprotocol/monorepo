import { task, types } from "hardhat/config";

//
export default task("irm:deploy:custom-jrm", "deploys custom JRM")
  .addParam("irm", "IRM to use", "JumpRateModel", types.string)
  .addParam("postfix", "Postfix to use for the deployment name", undefined, types.string)
  .addParam("args", "args to use", undefined, types.string)
  .setAction(async ({ irm: _irm, args: _args, postfix: _postfix }, { deployments, ethers }) => {
    const { deployer } = await ethers.getNamedSigners();

    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
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
    const args = [
      sdk.chainSpecificParams.blocksPerYear.toNumber(),
      baseRatePerYear.toString(),
      multiplierPerYear.toString(),
      jumpMultiplierPerYear.toString(),
      kink.toString(),
    ];

    const deploymentName = [_irm, "_", _postfix].join("");

    console.log(`Deploying JRM as ${deploymentName} with arguments: ${args.toString()}`);
    const deployment = await deployments.deploy(_irm + "_" + _postfix, {
      contract: _irm,
      from: deployer.address,
      args: args,
      log: true,
    });

    if (deployment.transactionHash) await ethers.provider.waitForTransaction(deployment.transactionHash);

    console.log("IRM Deployed: ", deployment.address);
  });
