import { constants } from "ethers";
import { task } from "hardhat/config";

import { CErc20RewardsDelegate } from "../../typechain/CErc20RewardsDelegate";
import { Comptroller } from "../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { IERC20MetadataUpgradeable as IERC20 } from "../../typechain/IERC20MetadataUpgradeable";
import { IERC20Mintable } from "../../typechain/IERC20Mintable";
import { IonicFlywheel } from "../../typechain/IonicFlywheel";
import { MasterPriceOracle } from "../../typechain/MasterPriceOracle";
import { OptimizedAPRVaultFirstExtension } from "../../typechain/OptimizedAPRVaultFirstExtension";
import { OptimizedVaultsRegistry } from "../../typechain/OptimizedVaultsRegistry";
import { SimplePriceOracle } from "../../typechain/SimplePriceOracle";

export default task("deploy-market-with-rewards").setAction(
  async ({}, { ethers, getChainId, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const chainid = parseInt(await getChainId());
    if (chainid == 97) {
      const mintingAmount = ethers.utils.parseEther("10000000000000");

      const testingBombErc20 = await deployments.deploy("ChapelBombERC20", {
        contract: "ERC20PresetMinterPauserUpgradeable",
        from: deployer,
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        proxy: {
          execute: {
            init: {
              methodName: "initialize",
              args: ["Testing Bomb Token", "TBOMB"]
            }
          },
          proxyContract: "OpenZeppelinTransparentProxy",
          owner: deployer
        }
      });
      if (testingBombErc20.transactionHash) await ethers.provider.waitForTransaction(testingBombErc20.transactionHash);
      console.log(`deployed a dummy bomb token at ${testingBombErc20.address}`);
      const bombToken = (await ethers.getContractAt(
        "IERC20Mintable",
        testingBombErc20.address,
        deployer
      )) as IERC20Mintable;

      let tx = await bombToken.mint(deployer, mintingAmount);
      console.log(`mining tx ${tx.hash}`);
      await tx.wait();
      console.log(`minted ${mintingAmount} testing BOMB tokens to the deployer ${deployer}`);

      const rewardsErc20 = await deployments.deploy("ChapelRewardsERC20", {
        contract: "ERC20PresetMinterPauserUpgradeable",
        from: deployer,
        skipIfAlreadyDeployed: true,
        log: true,
        waitConfirmations: 1,
        proxy: {
          execute: {
            init: {
              methodName: "initialize",
              args: ["Testing Rewards Token", "TRT"]
            }
          },
          proxyContract: "OpenZeppelinTransparentProxy",
          owner: deployer
        }
      });
      if (rewardsErc20.transactionHash) await ethers.provider.waitForTransaction(rewardsErc20.transactionHash);
      console.log(`deployed a dummy rewards token at ${rewardsErc20.address}`);

      // mint some reward tokens to the deployer
      const rewardsTokenMintable = (await ethers.getContractAt(
        "IERC20Mintable",
        rewardsErc20.address,
        deployer
      )) as IERC20Mintable;
      tx = await rewardsTokenMintable.mint(deployer, mintingAmount.mul(2));
      console.log(`mining tx ${tx.hash}`);
      await tx.wait();
      console.log(`minted ${mintingAmount} tokens to the deployer ${deployer}`);

      const ionicPoolAddress = "0x044c436b2f3EF29D30f89c121f9240cf0a08Ca4b";
      const ionicPool = (await ethers.getContractAt("Comptroller", ionicPoolAddress, deployer)) as Comptroller;
      const ionicPoolAsExt = (await ethers.getContractAt(
        "ComptrollerFirstExtension",
        ionicPoolAddress,
        deployer
      )) as ComptrollerFirstExtension;
      const ffd = await ethers.getContract("FeeDistributor");
      const jrm = await ethers.getContract("JumpRateModel");
      const rewardsDelegate = await ethers.getContract("CErc20RewardsDelegate");
      const spo = (await ethers.getContract("SimplePriceOracle", deployer)) as SimplePriceOracle;
      const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
      tx = await mpo.add([testingBombErc20.address], [spo.address]);
      await tx.wait();
      console.log(`added the SPO to the MPO for the testing BOMB token`);

      tx = await spo.setDirectPrice(testingBombErc20.address, ethers.utils.parseEther("0.0003"));
      await tx.wait();
      console.log(`set a direct price for the testing BOMB token`);

      const constructorData = new ethers.utils.AbiCoder().encode(
        ["address", "address", "address", "address", "string", "string", "address", "bytes", "uint256", "uint256"],
        [
          bombToken.address,
          ionicPool.address,
          ffd.address,
          jrm.address,
          "M Testing BOMB",
          "MTB",
          rewardsDelegate.address,
          new ethers.utils.AbiCoder().encode([], []),
          0,
          0
        ]
      );
      tx = await ionicPool._deployMarket(false, constructorData, ethers.utils.parseEther("0.9"));
      console.log(`mining tx ${tx.hash}`);
      await tx.wait();
      console.log(`deployed a testing BOMB market`);

      const allMarkets = await ionicPoolAsExt.callStatic.getAllMarkets();
      const newMarketAddress = allMarkets[allMarkets.length - 1];

      const testingBombToken = (await ethers.getContractAt("IERC20", testingBombErc20.address, deployer)) as IERC20;
      tx = await testingBombToken.approve(newMarketAddress, constants.MaxUint256);
      await tx.wait();
      console.log(`approved the new market to pull the underlying testing BOMB tokens`);

      const newMarket = (await ethers.getContractAt(
        "CErc20RewardsDelegate",
        newMarketAddress,
        deployer
      )) as CErc20RewardsDelegate;
      const errCode = await newMarket.callStatic.mint(ethers.utils.parseEther("2"));
      if (!errCode.isZero()) throw new Error(`unable to mint cTokens from the new testing BOMB market`);
      else {
        tx = await newMarket.mint(ethers.utils.parseEther("2"));
        await tx.wait();
        console.log(`minted some cTokens from the testing BOMB market`);
      }

      {
        const flywheelDeployment = await deployments.deploy("ChapelRewardsFlywheel", {
          from: deployer,
          contract: "IonicFlywheel",
          log: true,
          waitConfirmations: 1,
          proxy: {
            execute: {
              init: {
                methodName: "initialize",
                args: [rewardsErc20.address, constants.AddressZero, constants.AddressZero, deployer]
              }
            },
            proxyContract: "OpenZeppelinTransparentProxy",
            owner: deployer
          }
        });
        const rewardsDeployment = await deployments.deploy("ChapelRewardsContract", {
          from: deployer,
          contract: "FuseFlywheelDynamicRewards",
          log: true,
          waitConfirmations: 1,
          args: [flywheelDeployment.address, 60 * 10] // new cycle every 10 minutes
        });
        const flywheel = (await ethers.getContractAt(
          "IonicFlywheel",
          flywheelDeployment.address,
          deployer
        )) as IonicFlywheel;
        tx = await flywheel.setFlywheelRewards(rewardsDeployment.address);
        await tx.wait();
        console.log(`configured the flywheel rewards`);

        tx = await newMarket.approve(rewardsErc20.address, rewardsDeployment.address);
        await tx.wait();
        console.log(`approved the rewards contract to pull rewards from the market`);

        tx = await flywheel.addStrategyForRewards(newMarketAddress);
        await tx.wait();
        console.log(`added the testing BOMB market for rewards in the flywheel`);

        tx = await ionicPool._addRewardsDistributor(flywheel.address);
        await tx.wait();
        console.log(`added the flywheel to the pool rewards distributors`);
      }

      const rewardsToken = (await ethers.getContractAt("IERC20", rewardsErc20.address, deployer)) as IERC20;
      tx = await rewardsToken.transfer(newMarketAddress, ethers.utils.parseEther("15"));
      await tx.wait();
      console.log(`funded the market with reward tokens`);
    }
  }
);

task("supply-chapel-market-with-rewards").setAction(async ({ vault }, { ethers, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const rewardsToken = (await ethers.getContract("ChapelRewardsERC20")) as IERC20;

  const market = "0xfa60851E76728eb31EFeA660937cD535C887fDbD";
  const ownerRewardsBalance = await rewardsToken.callStatic.balanceOf(deployer);

  const tx = await rewardsToken.transfer(market, ownerRewardsBalance.div(2000));
  await tx.wait();
  console.log(`transferred some rewards to the market`);
});

task("claim-chapel-rewards").setAction(async ({}, { ethers, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const bombToken = (await ethers.getContract("ChapelBombERC20")) as IERC20;
  const symbol = await bombToken.callStatic.symbol();
  const market = "0xfa60851E76728eb31EFeA660937cD535C887fDbD";

  const vault = await ethers.getContract(`OptimizedAPRVault_${symbol}_${bombToken.address}`);
  const registry = (await ethers.getContract("OptimizedVaultsRegistry")) as OptimizedVaultsRegistry;

  const claimable = await registry.callStatic.getClaimableRewards(deployer);
  console.log(`claimable ${JSON.stringify(claimable)}`);

  const vaultAsFirstExt = (await ethers.getContractAt(
    "OptimizedAPRVaultFirstExtension",
    vault.address,
    deployer
  )) as OptimizedAPRVaultFirstExtension;

  let tx = await vaultAsFirstExt.claimRewards();
  await tx.wait();
  console.log(`claimed the rewards for the vault`);

  const flywheels = await vaultAsFirstExt.getAllFlywheels();
  for (const flywheelAddress of flywheels) {
    const flywheel = (await ethers.getContractAt("IonicFlywheel", flywheelAddress, deployer)) as IonicFlywheel;
    tx = await flywheel["accrue(address,address)"](market, deployer);
    await tx.wait();
    console.log(`accrued in the vault fw`);

    tx = await flywheel.claimRewards(deployer);
    await tx.wait();
    console.log(`claimed the rewards from the vault fw`);
  }
});
