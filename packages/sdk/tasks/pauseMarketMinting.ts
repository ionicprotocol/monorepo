import { task, types } from "hardhat/config";
import { Comptroller, CToken } from "../lib/contracts/typechain";

// npx hardhat market-mint-pause --market 0xCTokenAddress --admin 0x304aE8f9300e09c8B33bb1a8AE1c14A6253a5F4D --paused true --network bsc

export default task("market:mint:pause", "Pauses minting on a market")
    .addParam("market", "The address of the CToken", undefined, types.string)
    .addParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
    .addOptionalParam("paused", "If the market should be paused or not", "true", types.boolean)
    .setAction(async (taskArgs, hre) => {
        const admin = await hre.ethers.getNamedSigner(taskArgs.admin);

        const market: CToken = await hre.ethers.getContractAt("CToken", taskArgs.market, admin) as CToken;
        const comptroller = await market.comptroller();
        const pool: Comptroller = await hre.ethers.getContractAt("Comptroller", comptroller, admin) as Comptroller;
        await pool._setMintPaused(market.address, taskArgs.paused);

        const isPaused: boolean = await pool.mintGuardianPaused(market.address);

        console.log(`The market at ${market.address} minting pause has been to ${isPaused}`);

        return isPaused;
    });
