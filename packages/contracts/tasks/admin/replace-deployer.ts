import { DeploymentsExtension } from "hardhat-deploy/types";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address, Hash, zeroAddress } from "viem";

async function safeOwnableUpgrTransferOwnership(
  viem: HardhatRuntimeEnvironment["viem"],
  contractName: string,
  currentDeployer: Address,
  newDeployer: Address,
  deployments: DeploymentsExtension
) {
  const publicClient = await viem.getPublicClient();
  const _contract = await deployments.getOrNull(contractName);
  if (_contract) {
    const contract = await viem.getContractAt("SafeOwnableUpgradeable", _contract!.address as Address);
    const currentOwner = await contract.read.owner();
    console.log(`current ${contractName} owner ${currentOwner}`);
    if (currentOwner == currentDeployer) {
      const currentPendingOwner = await contract.read.pendingOwner();
      console.log(`current pending owner ${currentPendingOwner}`);
      if (currentPendingOwner != newDeployer) {
        const tx = await contract.write._setPendingOwner([newDeployer]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`${contractName}._setPendingOwner tx mined ${tx}`);
      }
    } else if (currentOwner != newDeployer) {
      console.error(`unknown owner ${currentOwner}`, new Error());
    }
  }
}

async function ownable2StepTransferOwnership(
  viem: HardhatRuntimeEnvironment["viem"],
  contractName: string,
  currentDeployer: Address,
  newDeployer: Address,
  deployments: DeploymentsExtension
) {
  const publicClient = await viem.getPublicClient();
  const _contract = await deployments.getOrNull(contractName);
  if (_contract) {
    const contract = await viem.getContractAt("SafeOwnable", _contract!.address as Address);
    const currentOwner = await contract.read.owner();
    console.log(`current ${contractName} owner ${currentOwner}`);
    if (currentOwner == currentDeployer) {
      const currentPendingOwner = await contract.read.pendingOwner();
      console.log(`current pending owner ${currentPendingOwner}`);
      if (currentPendingOwner != newDeployer) {
        const tx = await contract.write.transferOwnership([newDeployer]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`${contractName}.transferOwnership (pending owner) tx mined ${tx}`);
      }
    } else if (currentOwner != newDeployer) {
      console.error(`unknown owner ${currentOwner}`, new Error());
    }
  }
}

async function safeOwnableUpgrAcceptOwnership(
  viem: HardhatRuntimeEnvironment["viem"],
  contractName: string,
  newDeployer: Address,
  deployments: DeploymentsExtension
) {
  const publicClient = await viem.getPublicClient();
  const _contract = await deployments.getOrNull(contractName);
  if (_contract) {
    const contract = await viem.getContractAt("SafeOwnableUpgradeable", _contract!.address as Address);
    const currentOwner = await contract.read.owner();
    console.log(`current ${contractName} owner ${currentOwner}`);
    const pendingOwner = await contract.read.pendingOwner();
    console.log(`current pending owner ${pendingOwner}`);
    if (pendingOwner == newDeployer) {
      const tx = await contract.write._acceptOwner();
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`${contractName}._acceptOwner tx mined ${tx}`);
    }
  }
}

async function ownable2StepAcceptOwnership(
  viem: HardhatRuntimeEnvironment["viem"],
  contractName: string,
  newDeployer: Address,
  deployments: DeploymentsExtension
) {
  const publicClient = await viem.getPublicClient();
  const _contract = await deployments.getOrNull(contractName);
  if (_contract) {
    const contract = await viem.getContractAt("SafeOwnable", _contract!.address as Address);
    const currentOwner = await contract.read.owner();
    console.log(`current ${contractName} owner ${currentOwner}`);
    const pendingOwner = await contract.read.pendingOwner();
    console.log(`current pending owner ${pendingOwner}`);
    if (pendingOwner == newDeployer) {
      const tx = await contract.write.acceptOwnership();
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`${contractName}.acceptOwnership tx mined ${tx}`);
    }
  }
}

const safeOwnableUpgrContracts = [
  "FeeDistributor",
  "PoolDirectory",
  "OptimizedVaultsRegistry",
  "AnkrCertificateTokenPriceOracle",
  "BalancerLpLinearPoolPriceOracle",
  "BalancerLpStablePoolPriceOracle",
  "BalancerLpTokenPriceOracle",
  "BalancerLpTokenPriceOracleNTokens",
  "BalancerRateProviderOracle",
  "BNBxPriceOracle",
  "CurveLpTokenPriceOracleNoRegistry",
  "CurveV2LpTokenPriceOracleNoRegistry",
  "CurveV2PriceOracle",
  "ERC4626Oracle",
  "GammaPoolUniswapV3PriceOracle",
  "GammaPoolAlgebraPriceOracle",
  "PythPriceOracle",
  "SimplePriceOracle",
  "SolidlyPriceOracle",
  "StkBNBPriceOracle",
  "WSTEthPriceOracle",
  "NativeUSDPriceOracle"
];

const ownable2StepContracts = ["LiquidatorsRegistry", "LeveredPositionFactory", "OptimizedAPRVault"];

// TODO add ERC20Wrapper from CErc20WrappingDelegate
export default task("system:admin:change", "Changes the system admin to a new address")
  .addParam("currentDeployer", "The address of the current deployer", undefined, types.string)
  .addParam("newDeployer", "The address of the new deployer", undefined, types.string)
  .setAction(async ({ currentDeployer, newDeployer }, { viem, deployments, getNamedAccounts }) => {
    const accounts = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const deployer = accounts[currentDeployer];

    let tx: Hash;
    // hardcode it here
    if (newDeployer !== "hardcode it here") {
      throw new Error(`wrong new deployer`);
    } else {
      {
        // OwnableUpgradeable - transferOwnership(newDeployer)
        const fsl = await viem.getContractAt(
          "IonicLiquidator",
          (await deployments.get("IonicLiquidator")).address as Address
        );
        const currentOwnerFSL = await fsl.read.owner();
        console.log(`current FSL owner ${currentOwnerFSL}`);

        if (currentOwnerFSL == currentDeployer) {
          tx = await fsl.write.transferOwnership([newDeployer]);
          await publicClient.waitForTransactionReceipt({ hash: tx });
          console.log(`fsl.transferOwnership tx mined ${tx}`);
        } else if (currentOwnerFSL != newDeployer) {
          console.error(`unknown  owner ${currentOwnerFSL}`);
        }

        const ap = await viem.getContractAt(
          "AddressesProvider",
          (await deployments.get("AddressesProvider")).address as Address
        );
        const currentOwnerAp = await ap.read.owner();
        console.log(`current AP owner ${currentOwnerAp}`);
        if (currentOwnerAp == currentDeployer) {
          tx = await ap.write.transferOwnership([newDeployer]);
          await publicClient.waitForTransactionReceipt({ hash: tx });
          console.log(`ap.transferOwnership tx mined ${tx}`);
        } else if (currentOwnerAp != newDeployer) {
          console.error(`unknown  owner ${currentOwnerAp}`);
        }
      }

      {
        // SafeOwnableUpgradeable - _setPendingOwner() / _acceptOwner()
        for (const safeOwnableContract of safeOwnableUpgrContracts) {
          await safeOwnableUpgrTransferOwnership(
            viem,
            safeOwnableContract,
            deployer as Address,
            currentDeployer,
            newDeployer
          );
        }
      }

      {
        // SafeOwnable - transferOwnership() / _acceptOwner()
        for (const ownableContract of ownable2StepContracts) {
          await ownable2StepTransferOwnership(viem, ownableContract, deployer as Address, currentDeployer, newDeployer);
        }
      }

      {
        // DefaultProxyAdmin / TransparentUpgradeableProxy
        const dpa = await viem.getContractAt(
          "DefaultProxyAdmin",
          (await deployments.get("DefaultProxyAdmin")).address as Address
        );
        const currentOwnerDPA = await dpa.read.owner();
        console.log(`current dpa owner ${currentOwnerDPA}`);
        if (currentOwnerDPA == currentDeployer) {
          tx = await dpa.write.transferOwnership([newDeployer]);
          await publicClient.waitForTransactionReceipt({ hash: tx });
          console.log(`dpa.transferOwnership tx mined ${tx}`);
        } else if (currentOwnerDPA != newDeployer) {
          console.error(`unknown owner ${currentOwnerDPA}`);
        }
      }

      {
        // custom
        const dpoAddress = await deployments.getOrNull("DiaPriceOracle");
        if (dpoAddress) {
          const dpo = await viem.getContractAt("DiaPriceOracle", dpoAddress.address as Address);
          const currentOwnerDpo = await dpo.read.admin();
          console.log(`current DPO admin ${currentOwnerDpo}`);
          if (currentOwnerDpo == currentDeployer) {
            tx = await dpo.write.changeAdmin([newDeployer]);
            await publicClient.waitForTransactionReceipt({ hash: tx });
            console.log(`dpo.changeAdmin tx mined ${tx}`);
          } else if (currentOwnerDpo != newDeployer) {
            console.error(`unknown  owner ${currentOwnerDpo}`);
          }
        }

        const mpo = await viem.getContractAt(
          "MasterPriceOracle",
          (await deployments.get("MasterPriceOracle")).address as Address
        );
        const currentAdminMPO = await mpo.read.admin();
        console.log(`current MPO admin ${currentAdminMPO}`);
        if (currentAdminMPO == currentDeployer) {
          tx = await mpo.write.changeAdmin([newDeployer]);
          await publicClient.waitForTransactionReceipt({ hash: tx });
          console.log(`mpo.changeAdmin tx mined ${tx}`);
        } else if (currentAdminMPO != newDeployer) {
          console.error(`unknown  admin ${currentAdminMPO}`);
        }
      }

      const poolDirectory = await viem.getContractAt(
        "PoolDirectory",
        (await deployments.get("PoolDirectory")).address as Address
      );
      const [, pools] = await poolDirectory.read.getActivePools();
      for (let i = 0; i < pools.length; i++) {
        const pool = pools[i];
        console.log("pool name", pool.name);
        const unitroller = await viem.getContractAt("Unitroller", pool.comptroller);
        const admin = await unitroller.read.admin();
        console.log("pool admin", admin);
        console.log("pool comptroller", pool.comptroller);

        if (admin === currentDeployer) {
          {
            // Unitroller - _setPendingAdmin/_acceptAdmin
            const pendingAdmin = await unitroller.read.pendingAdmin();
            if (pendingAdmin != newDeployer) {
              tx = await unitroller.write._setPendingAdmin([newDeployer]);
              await publicClient.waitForTransactionReceipt({ hash: tx });
              console.log(`unitroller._setPendingAdmin tx mined ${tx}`);
            }
          }
        } else if (admin != newDeployer) {
          console.error(`unknown pool admin ${admin}`);
        }

        const comptrollerAsExtension = await viem.getContractAt("ComptrollerFirstExtension", pool.comptroller);
        const flywheels = await comptrollerAsExtension.read.getRewardsDistributors();
        for (let k = 0; k < flywheels.length; k++) {
          const flywheelAddress = flywheels[k];
          {
            const flywheelCore = await viem.getContractAt("IonicFlywheelCore", flywheelAddress);

            const currentOwner = await flywheelCore.read.owner();
            console.log(`current owner ${currentOwner} of the flywheel at ${flywheelCore.address}`);

            if (currentOwner == currentDeployer) {
              const currentPendingOwner = await flywheelCore.read.pendingOwner();
              console.log(`current pending owner ${currentPendingOwner}`);
              if (currentPendingOwner != newDeployer) {
                tx = await flywheelCore.write._setPendingOwner([newDeployer]);
                await publicClient.waitForTransactionReceipt({ hash: tx });
                console.log(`_setPendingOwner tx mined ${tx}`);
              }
            } else if (currentOwner != newDeployer) {
              console.error(`unknown flywheel owner ${currentOwner}`);
            }
          }
        }

        const markets = await comptrollerAsExtension.read.getAllMarkets();
        for (let j = 0; j < markets.length; j++) {
          const market = markets[j];
          console.log(`market ${market}`);
          const cTokenInstance = await viem.getContractAt("ICErc20Plugin", market);

          console.log("market", {
            cTokenName: await cTokenInstance.read.name(),
            cTokenNameSymbol: await cTokenInstance.read.symbol(),
            implementation: await cTokenInstance.read.implementation()
          });

          let pluginAddress;
          try {
            pluginAddress = await cTokenInstance.read.plugin();
          } catch (pluginError) {
            console.log(`most probably the market has no plugin`);
          }
          if (pluginAddress) {
            // Ownable - transferOwnership(address newOwner)
            const ionicERC4626 = await viem.getContractAt("IonicERC4626", pluginAddress);

            let currentOwner;
            try {
              currentOwner = await ionicERC4626.read.owner();
            } catch (pluginError) {
              console.log(`most probably the market has no plugin`);
            }

            if (currentOwner == currentDeployer) {
              //tx = await midasERC4626.transferOwnership(newDeployer);
              const currentPendingOwner = await ionicERC4626.read.pendingOwner();
              console.log(`current pending owner ${currentPendingOwner} of plugin ${pluginAddress}`);
              if (currentPendingOwner != newDeployer) {
                tx = await ionicERC4626.write._setPendingOwner([newDeployer]);
                await publicClient.waitForTransactionReceipt({ hash: tx });
                console.log(`midasERC4626._setPendingOwner tx mined ${tx}`);
              }
            } else if (currentOwner != newDeployer) {
              console.error(`unknown plugin owner ${currentOwner} for ${pluginAddress}`);
            }
          }
        }
      }

      // transfer all the leftover funds to the new deployer
      const newDeployerSigner = accounts[newDeployer];
      const newDeployerBalance = await publicClient.getBalance({ address: newDeployerSigner as Address });
      if (newDeployerBalance === 0n) {
        const oldDeployerBalance = await publicClient.getBalance({ address: deployer as Address });
        const transaction = {
          to: newDeployer,
          value: oldDeployerBalance,
          gasLimit: 21000n
        };

        transaction.gasLimit = await publicClient.estimateGas(transaction);

        // leave 10% for the old to clean up any other holdings
        transaction.value = (oldDeployerBalance * 9n) / 10n;
        const walletClient = await viem.getWalletClient(deployer as Address);

        tx = await walletClient.sendTransaction(transaction);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`funding the new deployer tx mined ${tx}`);
      }
    }

    console.log("now change the mnemonic in order to run the accept owner role task");
  });

task("system:admin:accept", "Accepts the pending admin/owner roles as the new admin/owner")
  .addParam("newDeployer", "The address of the new deployer", undefined, types.string)
  .setAction(async ({ newDeployer }, { viem, getNamedAccounts, deployments }) => {
    let tx: Hash;
    const publicClient = await viem.getPublicClient();

    const oldDeployer = "0x27521eae4eE4153214CaDc3eCD703b9B0326C908";

    // const fundingAmount = ethers.utils.parseEther("0.00082673836433862");
    // if ((await ethers.provider.getBalance(oldDeployer)).lt(fundingAmount)) {
    //   tx = await deployer.sendTransaction({
    //     to: oldDeployer,
    //     value: fundingAmount,
    //   })
    //   await tx.wait();
    //   console.log(`funded the old deployer`);
    //   return;
    // }

    const ap = await viem.getContractAt(
      "AddressesProvider",
      (await deployments.get("AddressesProvider")).address as Address
    );
    const currentDep = await ap.read.getAddress(["deployer"]);
    if (currentDep.toLowerCase() != newDeployer.toLowerCase()) {
      tx = await ap.write.setAddress(["deployer", newDeployer]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`ap set deployer tx mined ${tx}`);
    }

    // SafeOwnableUpgradeable - _setPendingOwner() / _acceptOwner()
    for (const safeOwnableContract of safeOwnableUpgrContracts) {
      await safeOwnableUpgrAcceptOwnership(viem, safeOwnableContract, newDeployer, deployments);
    }

    // SafeOwnable - transferOwnership() / acceptOwnership()
    for (const ownableContract of ownable2StepContracts) {
      await ownable2StepAcceptOwnership(viem, ownableContract, newDeployer, deployments);
    }

    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );
    const [, pools] = await poolDirectory.read.getActivePools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool name", pool.name);
      const unitroller = await viem.getContractAt("Unitroller", pool.comptroller);

      const admin = await unitroller.read.admin();
      console.log("pool admin", admin);

      const pendingAdmin = await unitroller.read.pendingAdmin();
      console.log("pool pending admin", pendingAdmin);

      if (pendingAdmin === newDeployer) {
        {
          // Unitroller - _setPendingAdmin/_acceptAdmin
          tx = await unitroller.write._acceptAdmin();
          await publicClient.waitForTransactionReceipt({ hash: tx });
          console.log(`unitroller._acceptAdmin tx mined ${tx}`);
        }
      } else {
        if (pendingAdmin !== zeroAddress) {
          console.error(`the pending admin ${pendingAdmin} is not the new deployer`);
        }
      }

      // IonicFlywheelCore - SafeOwnableUpgradeable - _setPendingOwner() / _acceptOwner()
      {
        const comptroller = await viem.getContractAt("ComptrollerFirstExtension", pool.comptroller);
        const flywheels = await comptroller.read.getRewardsDistributors();
        for (let k = 0; k < flywheels.length; k++) {
          const flywheelAddress = flywheels[k];
          {
            const flywheelCore = await viem.getContractAt("IonicFlywheelCore", flywheelAddress);
            const flywheelPendingOwner = await flywheelCore.read.pendingOwner();
            if (flywheelPendingOwner == newDeployer) {
              console.log(`accepting the owner role for flywheel ${flywheelAddress}`);
              tx = await flywheelCore.write._acceptOwner();
              await publicClient.waitForTransactionReceipt({ hash: tx });
              console.log(`flywheelCore._acceptAdmin tx mined ${tx}`);
            } else {
              console.log(`not the flywheel ${flywheelAddress} pending owner ${flywheelPendingOwner}`);
            }
          }
        }

        const comptrollerAsExtension = await viem.getContractAt("ComptrollerFirstExtension", pool.comptroller);

        const markets = await comptrollerAsExtension.read.getAllMarkets();
        for (let j = 0; j < markets.length; j++) {
          const market = markets[j];
          console.log(`market ${market}`);
          const cTokenInstance = await viem.getContractAt("ICErc20Plugin", market);

          let pluginAddress;
          try {
            pluginAddress = await cTokenInstance.read.plugin();
          } catch (pluginError) {
            console.log(`most probably the market has no plugin`);
          }
          if (pluginAddress) {
            // SafeOwnableUpgradeable - _setPendingOwner() / _acceptOwner()
            const ionicERC4626 = await viem.getContractAt("IonicERC4626", pluginAddress);

            try {
              const pendingOwner = await ionicERC4626.read.pendingOwner();
              if (pendingOwner == newDeployer) {
                tx = await ionicERC4626.write._acceptOwner();
                await publicClient.waitForTransactionReceipt({ hash: tx });
                console.log(`_acceptOwner tx mined ${tx}`);
              } else if (pendingOwner !== zeroAddress) {
                console.error(`unknown plugin owner ${pendingOwner} for ${pluginAddress}`);
              }
            } catch (pluginError) {
              console.error(`check if ownable or safeownable - ${ionicERC4626.address}`);
            }
          }
        }
      }
    }
  });
