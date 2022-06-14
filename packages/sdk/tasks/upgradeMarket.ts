import {task, types} from "hardhat/config";
import { MarketConfig } from "../src";
import {assetSymbols} from "../src/chainConfig";
import {deployERC4626Plugin} from "../chainDeploy/helpers/erc4626Plugins";
import {deployConfig} from "../chainDeploy/testnets/chapel";
import {DeployedAsset} from "../tests/utils/pool";
import {MasterPriceOracle, SimplePriceOracle} from "../lib/contracts/typechain";

// npx hardhat market:upgrade --network chapel

export default task("market:upgrade", "Upgrades a market's implementation")
    .addParam("deployer", "Named account from which to upgrade the implementation", "deployer", types.string)
    .setAction(async (taskArgs, { ethers, getChainId, getNamedAccounts, deployments, run}) => {
        // const bob = await ethers.getNamedSigner("bob");
        const signer = await ethers.getNamedSigner(taskArgs.deployer);
        // await bob.sendTransaction({value: ethers.utils.parseEther("0.5"), to: signer.address});

        // @ts-ignore
        const enumsModule = await import("../src/enums");
        // @ts-ignore
        const assetModule = await import("../tests/utils/assets");
        // @ts-ignore
        const poolModule = await import("../tests/utils/pool");
        // @ts-ignore
        const fuseModule = await import("../tests/utils/fuseSdk");
        const sdk = await fuseModule.getOrCreateFuse();

        const fuseFeeDistributor = await ethers.getContractAt("FuseFeeDistributor", sdk.contracts.FuseFeeDistributor.address);

        const fee = await fuseFeeDistributor.defaultInterestFeeRate();
        console.log(`ffd fee ${fee}`);

        // for bsc mainnet      0x5373C052Df65b317e48D6CAD8Bb8AC50995e9459

        const chainId = await getChainId();
        if (chainId == "97") {
            const assets = sdk.supportedAssets;
            const busd = assets.find((a) => a.symbol === assetSymbols.BUSD)!.underlying;

            const deployedSpo = await ethers.getContractOrNull("SimplePriceOracle", signer);

            if (!deployedSpo) {
                const spo = await deployments.deploy("SimplePriceOracle", {
                    from: signer.address,
                    args: [],
                    log: true,
                });
                if (spo.transactionHash) await ethers.provider.waitForTransaction(spo.transactionHash);
                console.log("SimplePriceOracle: ", spo.address);

                const busdArray = [];
                const busdOracleArray = [];
                busdArray.push(busd);
                busdOracleArray.push(spo.address);

                const mpo = await ethers.getContract("MasterPriceOracle", signer) as MasterPriceOracle;

                let tx = await mpo.add(busdArray, busdOracleArray);

                await tx.wait();
                console.log(
                    `Master Price Oracle updated for tokens ${busdArray.join(", ")} with oracles ${busdOracleArray.join(", ")}`
                );
            }

            const simplePO = await ethers.getContract("SimplePriceOracle", signer) as SimplePriceOracle;
            let tx = await simplePO.setDirectPrice(busd, ethers.utils.parseEther("2"));
            await tx.wait();
            console.log(`Simple Price Oracle updated for busd`);

            // for chapel           0x401d109d1eab112f80ab0035b78f01d6092c9097
            // const fusePoolDirectory = await ethers.getContract("FusePoolDirectory", signer);
            const poolAddress = "0x3d12762B0460da2fE8D731E03706f38aE2dD633a"; // pool name: velikos4 0x3d12762B0460da2fE8D731E03706f38aE2dD633a
            // chapel irm 0x6527539967fd5448ad43a83e9a4c232e0ba7daa1
            const interestRateModelAddress = "0xb5Ef3b4418D05021816CA3735B013440781e8651"; // Jump rate model "0x6527539967fd5448ad43a83e9a4c232e0ba7daa1";

            const assetConfig: MarketConfig = {
                underlying: busd,
                comptroller: poolAddress,
                fuseFeeDistributor: fuseFeeDistributor.address,
                interestRateModel: interestRateModelAddress,
                name: "velikos token",
                symbol: "VMT",
                collateralFactor: 75,
                reserveFactor: 15,
                adminFee: 0,
                bypassPriceFeedCheck: true,
            };
            // await deployERC4626Plugin({ ethers, getNamedAccounts, deployments, run, deployConfig, dynamicFlywheels });

            assetConfig.plugin = sdk.chainPlugins[assetConfig.underlying].find((p) => p.strategyCode === "MockERC4626_BUSD");

            console.log(
                `Creating market for token ${assetConfig.underlying}, pool ${poolAddress}, impl: ${
                    assetConfig.plugin ? assetConfig.plugin.cTokenContract : enumsModule.DelegateContractName.CErc20Delegate
                }`
            );
            const deployedAssets = await poolModule.deployAssets([assetConfig], signer);
            for (let i=0; i < deployedAssets.length; i++) {
                const deployedAsset: DeployedAsset = deployedAssets[i];
                console.log(
                    `Created market at address ${deployedAsset.assetAddress}, implementation address ${deployedAsset.implementationAddress}, symbol: ${deployedAsset.symbol}`
                );
            }
        } else if(chainId == "56") {
            // await fuseFeeDistributor._setDefaultInterestFeeRate(ethers.utils.parseEther("0.1"));

        }
    });
