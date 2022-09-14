import { task } from "hardhat/config";
import { IUniswapV3Pool__factory } from "../../lib/contracts/typechain";

task("oracle:increase-cardinality", "Increase cardinality for pair")
  .addParam("pair")
  .setAction(async (taskArgs, hre) => {
    const { deployer } = await hre.ethers.getNamedSigners();

    const address = taskArgs.pair;

    const pairContract = new hre.ethers.Contract(address, IUniswapV3Pool__factory.abi, deployer);
    const tx = await pairContract.increaseObservationCardinalityNext(10);
    const txReceipt = tx.wait();

    console.log(`Cardinality increased for pair ${address} - ${txReceipt.transactionHash}`);
  });
