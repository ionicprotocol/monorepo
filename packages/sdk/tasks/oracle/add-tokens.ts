import { task, types } from "hardhat/config";

task("oracle:add-tokens", "Initialize MasterPriceOracle with underlying oracle for assets")
  .addOptionalParam("underlyings", "Token for which to set the price", undefined, types.string)
  .addOptionalParam("oracles", "Token address for which to set the price", undefined, types.string)
  .setAction(async ({ underlyings: _underlyings, oracles: _oracles }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();
    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(deployer);

    const mpo = sdk.createMasterPriceOracle(deployer);
    const underlyingTokens = _underlyings.split(",");
    const underlyingOracleInput = _oracles.split(",");

    let underlyingOracles: Array<string>;
    if (underlyingOracleInput.length === 1) {
      underlyingOracles = Array(underlyingTokens.length).fill(underlyingOracleInput[0]);
    } else {
      underlyingOracles = underlyingOracleInput;
    }

    const tx = await mpo.add(underlyingTokens, underlyingOracles);
    console.log("tx: ", tx.hash);
    console.log(`Master Price Oracle updated for tokens ${underlyingTokens.join(", ")}`);
  });
