import { task } from "hardhat/config";

import { UniswapTwapPriceOracleV2Factory } from "../../typechain/UniswapTwapPriceOracleV2Factory";

const apeSwapFactory = "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6";
const sd = "0x3BC5AC0dFdC871B365d159f728dd1B9A0B5481E8";
const wtoken = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const busd = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";

task("oracle:deploy-apeswap-oracle").setAction(async (taskArgs, hre) => {
  const { deployer } = await hre.ethers.getNamedSigners();

  const mpo = await hre.ethers.getContract("MasterPriceOracle", deployer);

  const uniTwapOracleFactory = (await hre.ethers.getContract(
    "UniswapTwapPriceOracleV2Factory",
    deployer
  )) as UniswapTwapPriceOracleV2Factory;

  let tx = await uniTwapOracleFactory.deploy(apeSwapFactory, wtoken);
  await tx.wait();

  tx = await uniTwapOracleFactory.deploy(apeSwapFactory, busd);
  await tx.wait();

  const tokenOracle = await uniTwapOracleFactory.callStatic.oracles(apeSwapFactory, busd);

  const oracles = [tokenOracle];
  const underlyings = [sd];

  tx = await mpo.add(underlyings, oracles);
  await tx.wait();
});
