import { task, types } from "hardhat/config";
import { Address } from "viem";

export default task("oracle:set:mpo", "Sets an oracle for an underlying asset on the MasterPriceOracle")
  .addParam("underlying", "Underlying to set", undefined, types.string)
  .addParam("oracle", "Oracle to set underlying to", undefined, types.string)
  .setAction(async ({ underlying, oracle }, { viem, deployments }) => {
    const mpo = await viem.getContractAt(
      "MasterPriceOracle",
      (await deployments.get("MasterPriceOracle")).address as Address
    );
    const addTx = await mpo.write.add([[underlying], [oracle]]);
    console.log("addTx: ", addTx);
  });
