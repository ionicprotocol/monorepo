import { task, types } from "hardhat/config";
import { Address, Hash, parseEther } from "viem";
import { mode } from "@ionicprotocol/chains";

//
export default task("irm:deploy:custom-jrm", "deploys custom JRM")
  .addParam("irm", "IRM to use", "JumpRateModel", types.string)
  .addParam("postfix", "Postfix to use for the deployment name", undefined, types.string)
  .addParam("args", "args to use", undefined, types.string)
  .setAction(async ({ irm: _irm, args: _args, postfix: _postfix }, { deployments, viem, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const [baseRatePerYear, multiplierPerYear, jumpMultiplierPerYear, kink] = _args
      .split(",")
      .map((a: string) => parseEther(a));

    console.log(
      baseRatePerYear.toString(),
      multiplierPerYear.toString(),
      jumpMultiplierPerYear.toString(),
      kink.toString()
    );

    let args;

    if (_irm === "JumpRateModel") {
      args = [
        mode.specificParams.blocksPerYear,
        baseRatePerYear.toString(),
        multiplierPerYear.toString(),
        jumpMultiplierPerYear.toString(),
        kink.toString()
      ];
      console.log(`Deploying JRM with arguments: ${args.join(", ")}`);
    } else if (_irm === "AdjustableJumpRateModel") {
      args = [
        {
          blocksPerYear: mode.specificParams.blocksPerYear,
          baseRatePerYear: baseRatePerYear.toString(),
          multiplierPerYear: multiplierPerYear.toString(),
          jumpMultiplierPerYear: jumpMultiplierPerYear.toString(),
          kink: kink.toString()
        }
      ];
      console.log(`Deploying JRM with arguments: ${args[0]}`);
    } else {
      throw new Error("Unknown irm");
    }

    const deploymentName = [_irm, "_", _postfix].join("");
    console.log(`Deploying JRM as ${deploymentName}`);

    const deployment = await deployments.deploy(_irm + "_" + _postfix, {
      contract: _irm,
      from: deployer,
      args: args,
      log: true
    });

    if (deployment.transactionHash)
      await publicClient.waitForTransactionReceipt({ hash: deployment.transactionHash as Hash });

    console.log("IRM Deployed: ", deployment.address);
  });

task("irm:edit:adjustable-jrm-params", "Edit adjustable JRM parameters")
  .addParam("irmAddress", "IRM address to adjust", undefined, types.string)
  .addParam("args", "args to use", undefined, types.string)
  .setAction(async ({ irmAddress: _irm, args: _args }, { viem, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();

    const irm = await viem.getContractAt("AdjustableJumpRateModel", _irm as Address);

    let promises: Array<Promise<any>>;
    let blocksPerYear;
    let multiplierPerBlock;
    let baseRatePerBlock;
    let kink_;

    promises = [irm.read.blocksPerYear(), irm.read.multiplierPerBlock(), irm.read.baseRatePerBlock(), irm.read.kink()];

    [blocksPerYear, multiplierPerBlock, baseRatePerBlock, kink_] = await (
      await Promise.all(promises)
    ).map((v) => v.toString());
    console.log("Params before: ", { blocksPerYear, multiplierPerBlock, baseRatePerBlock, kink_ });

    const [baseRatePerYear, multiplierPerYear, jumpMultiplierPerYear, kink] = _args
      .split(",")
      .map((a: string) => parseEther(a));

    const args = {
      blocksPerYear: BigInt(mode.specificParams.blocksPerYear),
      baseRatePerYear: baseRatePerYear.toString(),
      multiplierPerYear: multiplierPerYear.toString(),
      jumpMultiplierPerYear: jumpMultiplierPerYear.toString(),
      kink: kink.toString()
    };

    console.log({ args });

    const tx = await irm.write._setIrmParameters([args]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`IRM ${_irm} updated`);

    promises = [irm.read.blocksPerYear(), irm.read.multiplierPerBlock(), irm.read.baseRatePerBlock(), irm.read.kink()];

    [blocksPerYear, multiplierPerBlock, baseRatePerBlock, kink_] = (await Promise.all(promises)).map((v) =>
      v.toString()
    );
    console.log("Params after: ", { blocksPerYear, multiplierPerBlock, baseRatePerBlock, kink_ });
  });
