import { task } from "hardhat/config";

import { IUniswapV3Pool__factory } from "@typechain/factories/IUniswapV3Pool__factory";

task("oracle:increase-cardinality", "Increase cardinality for pool")
  .addParam("address")
  .setAction(async (taskArgs, hre) => {
    const { deployer } = await hre.ethers.getNamedSigners();

    const address = taskArgs.address;

    const poolContract = new hre.ethers.Contract(address, IUniswapV3Pool__factory.abi, deployer);
    await poolContract.increaseObservationCardinalityNext(10, {
      gasLimit: 1000000,
    });

    console.log(`Cardinality increased for pool ${address}`);
  });
