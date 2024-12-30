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
        let implementationAddress = (await deployments.get("IonicFlywheel_SupplyVaults_v1")).address;
        let flywheel = await viem.getContractAt("IonicFlywheel", ionicFlywheelAddress as Address);
        const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

        const ionicFlywheelBoosterAddress = (await deployments.get("IonicFlywheelSupplyBooster")).address as Address;
        if ((await flywheel.read.flywheelBooster()) == ZERO_ADDRESS) {
          if (!opSupplyFlywheels.includes(ionicFlywheelAddress)) {
            throw new Error(
              `Invalid flwheel: ${ionicFlywheelAddress}. Must be one of ${opSupplyFlywheels.join(", ")}.`
            );
          }
          console.log("Supply Flywheel detected, setting booster");
          //await flywheel.write.setBooster([ionicFlywheelBoosterAddress]);
        } else if (opSupplyFlywheels.includes(ionicFlywheelAddress)) {
          console.log("Supply Flywheel detected, skipping setting booster");
        } else {
          if (!opBorrowFlywheels.includes(ionicFlywheelAddress)) {
            throw new Error(
              `Invalid flwheel: ${ionicFlywheelAddress}. Must be one of ${opBorrowFlywheels.join(", ")}.`
            );
          }
          console.log("Borrow Flywheel detected, skipping setting booster");

          implementationAddress = (await deployments.get("IonicFlywheelBorrow_SupplyVaults_v1")).address;
        }

        const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
        let currentImplementationAddress = await publicClient.getStorageAt({
          address: ionicFlywheelAddress,
          slot: IMPLEMENTATION_SLOT
        });
        if (!currentImplementationAddress) {
          throw new Error(`Failed to get current implementation address for ${ionicFlywheelAddress}`);
        }
        currentImplementationAddress = `0x${currentImplementationAddress.slice(26)}`;
        if (currentImplementationAddress.toLowerCase() != implementationAddress.toLowerCase()) {
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
        } else {
          console.log("Flywheel is already upgraded to latest implementation");
        }
        /*console.log("Deploying new IonicFlywheelStaticRewards to replace FlywheelDynamicRewards");
        let newFlywheelRewardsDeployment = await deployments.getOrNull(
          `IonicFlywheelStaticRewards_SupplyVaults_${ionicFlywheelAddress}`
        );
        let newFlywheelRewardsAddress = newFlywheelRewardsDeployment?.address as Address;
        if (!newFlywheelRewardsAddress) {
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
          newFlywheelRewardsAddress = flywheelRewardsReceipt.address as Address;
          if (flywheelRewardsReceipt.transactionHash) {
            await publicClient.waitForTransactionReceipt({
              hash: flywheelRewardsReceipt.transactionHash as Address
            });
          }
        }

        console.log(`Deployed new flywheel rewards: ${newFlywheelRewardsAddress}`);
        const flywheelRewardsAddress = await flywheel.read.flywheelRewards();
        const oldFlywheelRewards = await viem.getContractAt(
          "IonicFlywheelDynamicRewards",
          flywheelRewardsAddress as Address
        );
        const newFlywheelRewards = await viem.getContractAt(`IonicFlywheelStaticRewards`, newFlywheelRewardsAddress);
        if (flywheelRewardsAddress === newFlywheelRewardsAddress) {
          console.log("Flywheel rewards are already set to new flywheel static rewards");
          continue;
        }
        const ion = "0x887d1c6A4f3548279c2a8A9D0FA61B5D458d14fC" as Address;
        const markets = await flywheel.read.getAllStrategies();
        for (const market of markets) {
          const rewardsInfo = await oldFlywheelRewards.read.rewardsCycle([market]);
          const rewardsPerSecond = Math.round(Number(rewardsInfo[2]) / (rewardsInfo[1] - rewardsInfo[0]));
          console.log("Market", market, "Reward per second: ", rewardsPerSecond);
          if (rewardsPerSecond != 0) {
            // we have to accrue each market that has live rewards. The user is not important, since we just want to invoke
            // accrueStrategy which is private function
            const accrueTx = await flywheel.write.accrue([market, deployer as Address]);
            await publicClient.waitForTransactionReceipt({
              hash: accrueTx
            });
            console.log("Accrued: ", accrueTx);
            const currentRewardPerSecond = await newFlywheelRewards.read.getRewardsPerSecond([market]);
            if (currentRewardPerSecond === 0n) {
              console.log("Setting rewards info to new flywheel static rewards for market: ", market);
              const setRewardsInfoTx = await newFlywheelRewards.write.setRewardsInfo([
                market,
                { rewardsPerSecond: BigInt(rewardsPerSecond), rewardsEndTimestamp: rewardsInfo[1] }
              ]);
              await publicClient.waitForTransactionReceipt({
                hash: setRewardsInfoTx
              });
              console.log("Set rewards info: ", setRewardsInfoTx);
            }
          }
          const strategy = await viem.getContractAt("CErc20RewardsDelegate", market as Address);
          const ionContract = await viem.getContractAt("ERC20", ion as Address);
          const allowance = await ionContract.read.allowance([market, newFlywheelRewardsAddress]);
          if (allowance == BigInt(0)) {
            await strategy.write.approve([ion, newFlywheelRewardsAddress]);
          }
        }
        const setFlywheelRewardsTx = await flywheel.write.setFlywheelRewards([newFlywheelRewardsAddress]);
        await publicClient.waitForTransactionReceipt({
          hash: setFlywheelRewardsTx
        });
        console.log("Set flywheel rewards: ", setFlywheelRewardsTx);
        // Accrue all markets after new flywheel rewards are set
        for (const market of markets) {
          const accrueTx = await flywheel.write.accrue([market, deployer as Address]);
          await publicClient.waitForTransactionReceipt({
            hash: accrueTx
          });
          console.log("Accrued: ", accrueTx);
        }*/
      }
    }
  }
);
