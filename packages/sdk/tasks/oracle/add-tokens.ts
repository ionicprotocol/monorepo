import { task, types } from "hardhat/config";

task("oracle:add-tokens", "Initialize MasterPriceOracle with underlying oracle for assets")
  // .addOptionalParam("underlyings", "Token for which to set the price", undefined, types.string)
  // .addOptionalParam("oracles", "Token address for which to set the price", undefined, types.string)
  .setAction(async ({ underlyings: _underlyings, oracles: _oracles }, { ethers }) => {
    const { deployer } = await ethers.getNamedSigners();
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const mpo = await ethers.getContractAt("MasterPriceOracle", sdk.oracles.MasterPriceOracle.address, deployer);
    // const underlyingTokens = _underlyings.split(",");

    // let underlyingOracles: Array<string>;

    // if (!_oracles) {
    //   // by default, get uniswap's twap oracle address
    //   const uniOracleFactory = await ethers.getContractAt(
    //     "UniswapTwapPriceOracleV2Factory",
    //     sdk.chainDeployment.UniswapTwapPriceOracleV2Factory.address,
    //     deployer
    //   );
    //   const underlyingOracle = await uniOracleFactory.callStatic.oracles(
    //     sdk.chainSpecificAddresses.UNISWAP_V2_FACTORY,
    //     sdk.chainSpecificAddresses.W_TOKEN
    //   );
    //   underlyingOracles = Array(underlyingTokens.length).fill(underlyingOracle);
    // } else {
    //   underlyingOracles = _oracles.split(",");
    //   if (underlyingOracles.length === 1) {
    //     underlyingOracles = Array(underlyingTokens.length).fill(underlyingOracles[0]);
    //   }
    // }
    const tx = await mpo.add(
      ["0x5887cEa5e2bb7dD36F0C06Da47A8Df918c289A29"],
      ["0x4544d21EB5B368b3f8F98DcBd03f28aC0Cf6A0CA"]
    );
    await tx.wait();
    // console.log(`Master Price Oracle updated for tokens ${underlyingTokens.join(", ")}`);
  });
