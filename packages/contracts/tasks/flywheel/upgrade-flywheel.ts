import { task } from "hardhat/config";
import { Address } from "viem";
import { prepareAndLogTransaction } from "../../chainDeploy/helpers/logging";

task("flywheel:upgrade-flywheels-to-support-supply-vaults", "Upgrades the flywheel contracts").setAction(
  async ({}, hre) => {
    const viem = hre.viem;
    const deployments = hre.deployments;
    const publicClient = await viem.getPublicClient();
    const { deployer } = await hre.getNamedAccounts();
    const walletClient = await viem.getWalletClient(deployer as Address);

    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );

    // Used as additional security check, because checking if booster is non-zero address won't be sufficinet
    // due to boosters that are going to be set for supply flywheels also
    const opSupplyFlywheels = [
      "0x4D01bb5710F1989b6C2Dde496a5400E7F3b88162",
      "0x6671AfE7c3aBd9Db195b3e58D348166c21405B88",
      "0x05c3e910F7639457f92220605966e7f86A2ef966"
    ];
    const opBorrowFlywheels = ["0x6660174886cb3B26B38E5D4c1324E0BfB361F7CA"];

    const pools = (await poolDirectory.read.getAllPools()) as any[];
    for (const pool of pools) {
      let comptroller = await viem.getContractAt("IonicComptroller", pool.comptroller as Address);
      const flywheels = await comptroller.read.getAccruingFlywheels();
      for (const ionicFlywheelAddress of flywheels) {
        let flywheelContractName = "IonicFlywheel";
        let implementationAddress = (await deployments.get("IonicFlywheel_SupplyVaults")).address;
        let flywheel = await viem.getContractAt(flywheelContractName, ionicFlywheelAddress as Address);
        const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

        const ionicFlywheelBoosterAddress = (await deployments.get("IonicFlywheelSupplyBooster")).address as Address;
        if ((await flywheel.read.flywheelBooster()) == ZERO_ADDRESS) {
          if (!opSupplyFlywheels.includes(ionicFlywheelAddress)) {
            throw new Error(
              `Invalid flwheel: ${ionicFlywheelAddress}. Must be one of ${opSupplyFlywheels.join(", ")}.`
            );
          }
          console.log("Supply Flywheel detected, setting booster");
          flywheel.write.setBooster([ionicFlywheelBoosterAddress]);
        } else if (opSupplyFlywheels.includes(ionicFlywheelAddress)) {
          console.log("Supply Flywheel detected, skipping setting booster");
        } else {
          if (!opBorrowFlywheels.includes(ionicFlywheelAddress)) {
            throw new Error(
              `Invalid flwheel: ${ionicFlywheelAddress}. Must be one of ${opBorrowFlywheels.join(", ")}.`
            );
          }
          console.log("Borrow Flywheel detected, skipping setting booster");

          flywheelContractName = "IonicFlywheelBorrow";
          flywheel = await viem.getContractAt(flywheelContractName, ionicFlywheelAddress as Address);
          implementationAddress = (await deployments.get("IonicFlywheelBorrow_SupplyVaults")).address;
        }

        console.log("Upgrading flywheel at: ", ionicFlywheelAddress);
        const owner = await poolDirectory.read.owner();
        if (owner.toLowerCase() !== deployer.toLowerCase()) {
          let defaultProxyAdmin = await viem.getContractAt(
            "DefaultProxyAdmin",
            (await deployments.get("DefaultProxyAdmin")).address as Address
          );

          await prepareAndLogTransaction({
            contractInstance: defaultProxyAdmin,
            functionName: "defaultProxyAdmin",
            inputs: [
              {
                internalType: "address",
                name: "proxy",
                type: "address"
              },
              {
                internalType: "address",
                name: "implementation",
                type: "address"
              }
            ],
            args: [ionicFlywheelAddress, implementationAddress],
            description: `Set implementation to ${implementationAddress}`
          });
        } else {
          const setImplementationTx = await walletClient.writeContract({
            address: (await deployments.get("DefaultProxyAdmin")).address as Address,
            abi: [
              {
                inputs: [
                  {
                    internalType: "address",
                    name: "initialOwner",
                    type: "address"
                  }
                ],
                stateMutability: "nonpayable",
                type: "constructor"
              },
              {
                anonymous: false,
                inputs: [
                  {
                    indexed: true,
                    internalType: "address",
                    name: "previousOwner",
                    type: "address"
                  },
                  {
                    indexed: true,
                    internalType: "address",
                    name: "newOwner",
                    type: "address"
                  }
                ],
                name: "OwnershipTransferred",
                type: "event"
              },
              {
                inputs: [
                  {
                    internalType: "contract TransparentUpgradeableProxy",
                    name: "proxy",
                    type: "address"
                  },
                  {
                    internalType: "address",
                    name: "newAdmin",
                    type: "address"
                  }
                ],
                name: "changeProxyAdmin",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function"
              },
              {
                inputs: [
                  {
                    internalType: "contract TransparentUpgradeableProxy",
                    name: "proxy",
                    type: "address"
                  }
                ],
                name: "getProxyAdmin",
                outputs: [
                  {
                    internalType: "address",
                    name: "",
                    type: "address"
                  }
                ],
                stateMutability: "view",
                type: "function"
              },
              {
                inputs: [
                  {
                    internalType: "contract TransparentUpgradeableProxy",
                    name: "proxy",
                    type: "address"
                  }
                ],
                name: "getProxyImplementation",
                outputs: [
                  {
                    internalType: "address",
                    name: "",
                    type: "address"
                  }
                ],
                stateMutability: "view",
                type: "function"
              },
              {
                inputs: [],
                name: "owner",
                outputs: [
                  {
                    internalType: "address",
                    name: "",
                    type: "address"
                  }
                ],
                stateMutability: "view",
                type: "function"
              },
              {
                inputs: [],
                name: "renounceOwnership",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function"
              },
              {
                inputs: [
                  {
                    internalType: "address",
                    name: "newOwner",
                    type: "address"
                  }
                ],
                name: "transferOwnership",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function"
              },
              {
                inputs: [
                  {
                    internalType: "contract TransparentUpgradeableProxy",
                    name: "proxy",
                    type: "address"
                  },
                  {
                    internalType: "address",
                    name: "implementation",
                    type: "address"
                  }
                ],
                name: "upgrade",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function"
              },
              {
                inputs: [
                  {
                    internalType: "contract TransparentUpgradeableProxy",
                    name: "proxy",
                    type: "address"
                  },
                  {
                    internalType: "address",
                    name: "implementation",
                    type: "address"
                  },
                  {
                    internalType: "bytes",
                    name: "data",
                    type: "bytes"
                  }
                ],
                name: "upgradeAndCall",
                outputs: [],
                stateMutability: "payable",
                type: "function"
              }
            ] as const,
            functionName: "upgrade",
            args: [ionicFlywheelAddress, implementationAddress as Address]
          });
          console.log("setImplementationTx: ", setImplementationTx);

          const receipt = await publicClient.waitForTransactionReceipt({
            hash: setImplementationTx
          });

          if (receipt.status !== "success") {
            throw `Failed set implementation to ${implementationAddress}`;
          }
          console.log(`Implementation successfully set to ${implementationAddress}: ${setImplementationTx}`);
        }

        console.log("Deploying new IonicFlywheelStaticRewards to replace FlywheelDynamicRewards");
        const flywheelRewardsReceipt = await deployments.deploy(
          `IonicFlywheelStaticRewards_SupplyVaults_${ionicFlywheelAddress}`,
          {
            contract: "IonicFlywheelStaticRewards",
            from: deployer,
            log: true,
            args: [ionicFlywheelAddress],
            waitConfirmations: 1
          }
        );
        const newFlywheelRewardsAddress = flywheelRewardsReceipt.address as Address;

        console.log(`Deployed new flywheel lens router: ${newFlywheelRewardsAddress}`);
        const flywheelRewardsAddress = await flywheel.read.flywheelRewards();
        const oldFlywheelRewards = await viem.getContractAt(
          "IonicFlywheelDynamicRewards",
          flywheelRewardsAddress as Address
        );
        const newFlywheelRewards = await viem.getContractAt(`IonicFlywheelStaticRewards`, newFlywheelRewardsAddress);
        const ion = "0x887d1c6A4f3548279c2a8A9D0FA61B5D458d14fC" as Address;
        const markets = (await flywheel.read.getAllStrategies()) as any[];
        for (const market of markets) {
          const rewardsInfo = await oldFlywheelRewards.read.rewardsCycle([market]);
          const rewardPerSecond = Math.round(Number(rewardsInfo[2]) / (rewardsInfo[1] - rewardsInfo[0]));
          console.log("Market", market, "Reward per second: ", rewardPerSecond);
          if (rewardPerSecond != 0) {
            // we have to accrue each market that has live rewards. The user is not important, since we just want to invoke
            // accrueStrategy which is private function
            flywheel.write.accrue(market, owner);
            console.log("Setting rewards info to new flywheel static rewards for market: ", market);
            newFlywheelRewards.write.setRewardsInfo([rewardPerSecond, rewardsInfo[1]]);
          }
          const strategy = await viem.getContractAt("CErc20RewardsDelegate", market as Address);
          strategy.write.approve([ion, newFlywheelRewardsAddress]);
        }
        flywheel.write.setFlywheelRewards([newFlywheelRewardsAddress]);
        // Accrue all markets after new flywheel rewards are set
        for (const market of markets) {
          flywheel.write.accrue(market, owner);
        }
      }
    }
  }
);
