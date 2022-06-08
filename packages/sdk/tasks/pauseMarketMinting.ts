import { task, types } from "hardhat/config";
import { CToken } from "../lib/contracts/typechain/CToken";
import { Comptroller } from "../lib/contracts/typechain/Comptroller";
import { providers, constants } from "ethers";

// npx hardhat market-mint-pause --market 0xCTokenAddress --admin deployer --paused true --network bsc

export default task("market-mint-pause", "Pauses minting on a market")
    .addParam("market", "The address of the CToken", undefined, types.string)
    .addParam("admin", "Named account from which to pause the minting on the market", "deployer", types.string)
    .addOptionalParam("paused", "If the market should be paused or not", "true", types.boolean)
    .setAction(async (taskArgs, hre) => {
            let tx: providers.TransactionResponse;

        const admin = await hre.ethers.getNamedSigner(taskArgs.admin);

        const market: CToken = await hre.ethers.getContractAt("CToken.sol:CToken", taskArgs.market, admin) as CToken;
        const comptroller = await market.comptroller();
        const pool: Comptroller = await hre.ethers.getContractAt("Comptroller.sol:Comptroller", comptroller, admin) as Comptroller;

        const currentPauseGuardian = await pool.pauseGuardian();
        if (currentPauseGuardian === constants.AddressZero) {
                tx = await pool._setPauseGuardian(admin.address);
                await tx.wait();
                console.log(`Set the pause guardian to ${admin.address}`);
        }

        const isPaused: boolean = await pool.mintGuardianPaused(market.address);
        if (isPaused != taskArgs.paused) {
                tx = await pool._setMintPaused(market.address, taskArgs.paused);
                await tx.wait();

                console.log(`Market pause tx ${tx.hash}`);
        } else {
                console.log(`No need to set the minting pause to ${taskArgs.paused} as it is already set to that value`);
        }

        const isPausedAfter: boolean = await pool.mintGuardianPaused(market.address);

        console.log(`The market at ${market.address} minting pause has been to ${isPausedAfter}`);

        return isPausedAfter;
    });
