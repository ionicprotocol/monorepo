import { providers } from "ethers";
import { task, types } from "hardhat/config";

import { AddressesProvider } from "../../typechain/AddressesProvider";
import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { ICErc20Plugin } from "../../typechain/CTokenInterfaces.sol/ICErc20Plugin";
import { DiaPriceOracle } from "../../typechain/DiaPriceOracle.sol/DiaPriceOracle";
import { IonicERC4626 } from "../../typechain/IonicERC4626";
import { IonicFlywheelCore } from "../../typechain/IonicFlywheelCore";
import { MasterPriceOracle } from "../../typechain/MasterPriceOracle";
import { Ownable } from "../../typechain/Ownable";
import { OwnableUpgradeable } from "../../typechain/OwnableUpgradeable";
import { PoolDirectory } from "../../typechain/PoolDirectory";
import { SafeOwnable } from "../../typechain/SafeOwnable";
import { SafeOwnableUpgradeable } from "../../typechain/SafeOwnableUpgradeable";
import { Unitroller } from "../../typechain/Unitroller";

async function safeOwnableUpgrTransferOwnership(ethers, contractName, signer, currentDeployer, newDeployer) {
  const contract = (await ethers.getContractOrNull(contractName, signer)) as SafeOwnableUpgradeable;
  if (contract) {
    const currentOwner = await contract.callStatic.owner();
    console.log(`current ${contractName} owner ${currentOwner}`);
    if (currentOwner == currentDeployer) {
      const currentPendingOwner = await contract.callStatic.pendingOwner();
      console.log(`current pending owner ${currentPendingOwner}`);
      if (currentPendingOwner != newDeployer) {
        const tx = await contract._setPendingOwner(newDeployer);
        await tx.wait();
        console.log(`${contractName}._setPendingOwner tx mined ${tx.hash}`);
      }
    } else if (currentOwner != newDeployer) {
      console.error(`unknown owner ${currentOwner}`, new Error());
    }
  }
}

async function ownable2StepTransferOwnership(ethers, contractName, signer, currentDeployer, newDeployer) {
  const contract = (await ethers.getContractOrNull(contractName, signer)) as SafeOwnable;
  if (contract) {
    const currentOwner = await contract.callStatic.owner();
    console.log(`current ${contractName} owner ${currentOwner}`);
    if (currentOwner == currentDeployer) {
      const currentPendingOwner = await contract.callStatic.pendingOwner();
      console.log(`current pending owner ${currentPendingOwner}`);
      if (currentPendingOwner != newDeployer) {
        const tx = await contract.transferOwnership(newDeployer);
        await tx.wait();
        console.log(`${contractName}.transferOwnership (pending owner) tx mined ${tx.hash}`);
      }
    } else if (currentOwner != newDeployer) {
      console.error(`unknown owner ${currentOwner}`, new Error());
    }
  }
}

async function safeOwnableUpgrAcceptOwnership(ethers, contractName, signer, newDeployer) {
  const contract = (await ethers.getContractOrNull(contractName, signer)) as SafeOwnableUpgradeable;
  if (contract) {
    const currentOwner = await contract.callStatic.owner();
    console.log(`current ${contractName} owner ${currentOwner}`);
    const pendingOwner = await contract.callStatic.pendingOwner();
    console.log(`current pending owner ${pendingOwner}`);
    if (pendingOwner == newDeployer) {
      const tx = await contract._acceptOwner();
      await tx.wait();
      console.log(`${contractName}._acceptOwner tx mined ${tx.hash}`);
    }
  }
}

async function ownable2StepAcceptOwnership(ethers, contractName, signer, newDeployer) {
  const contract = (await ethers.getContractOrNull(contractName, signer)) as SafeOwnable;
  if (contract) {
    const currentOwner = await contract.callStatic.owner();
    console.log(`current ${contractName} owner ${currentOwner}`);
    const pendingOwner = await contract.callStatic.pendingOwner();
    console.log(`current pending owner ${pendingOwner}`);
    if (pendingOwner == newDeployer) {
      const tx = await contract.acceptOwnership();
      await tx.wait();
      console.log(`${contractName}.acceptOwnership tx mined ${tx.hash}`);
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
  .setAction(async ({ currentDeployer, newDeployer }, { ethers }) => {
    let tx: providers.TransactionResponse;

    const deployer = await ethers.getSigner(currentDeployer);

    // hardcode it here
    if (newDeployer !== "hardcode it here") {
      throw new Error(`wrong new deployer`);
    } else {
      {
        // OwnableUpgradeable - transferOwnership(newDeployer)
        const fsl = (await ethers.getContract("IonicLiquidator", deployer)) as OwnableUpgradeable;
        const currentOwnerFSL = await fsl.callStatic.owner();
        console.log(`current FSL owner ${currentOwnerFSL}`);

        if (currentOwnerFSL == currentDeployer) {
          tx = await fsl.transferOwnership(newDeployer);
          await tx.wait();
          console.log(`fsl.transferOwnership tx mined ${tx.hash}`);
        } else if (currentOwnerFSL != newDeployer) {
          console.error(`unknown  owner ${currentOwnerFSL}`);
        }

        const ap = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
        const currentOwnerAp = await ap.callStatic.owner();
        console.log(`current AP owner ${currentOwnerAp}`);
        if (currentOwnerAp == currentDeployer) {
          tx = await ap.transferOwnership(newDeployer);
          await tx.wait();
          console.log(`ap.transferOwnership tx mined ${tx.hash}`);
        } else if (currentOwnerAp != newDeployer) {
          console.error(`unknown  owner ${currentOwnerAp}`);
        }
      }

      {
        // SafeOwnableUpgradeable - _setPendingOwner() / _acceptOwner()
        for (const safeOwnableContract of safeOwnableUpgrContracts) {
          await safeOwnableUpgrTransferOwnership(ethers, safeOwnableContract, deployer, currentDeployer, newDeployer);
        }
      }

      {
        // SafeOwnable - transferOwnership() / _acceptOwner()
        for (const ownableContract of ownable2StepContracts) {
          await ownable2StepTransferOwnership(ethers, ownableContract, deployer, currentDeployer, newDeployer);
        }
      }

      {
        // DefaultProxyAdmin / TransparentUpgradeableProxy
        const dpa = (await ethers.getContract("DefaultProxyAdmin", deployer)) as Ownable;
        const currentOwnerDPA = await dpa.callStatic.owner();
        console.log(`current dpa owner ${currentOwnerDPA}`);
        if (currentOwnerDPA == currentDeployer) {
          tx = await dpa.transferOwnership(newDeployer);
          await tx.wait();
          console.log(`dpa.transferOwnership tx mined ${tx.hash}`);
        } else if (currentOwnerDPA != newDeployer) {
          console.error(`unknown owner ${currentOwnerDPA}`);
        }
      }

      {
        // custom
        const dpo = (await ethers.getContractOrNull("DiaPriceOracle", deployer)) as DiaPriceOracle;
        if (dpo) {
          const currentOwnerDpo = await dpo.callStatic.admin();
          console.log(`current DPO admin ${currentOwnerDpo}`);
          if (currentOwnerDpo == currentDeployer) {
            tx = await dpo.changeAdmin(newDeployer);
            await tx.wait();
            console.log(`dpo.changeAdmin tx mined ${tx.hash}`);
          } else if (currentOwnerDpo != newDeployer) {
            console.error(`unknown  owner ${currentOwnerDpo}`);
          }
        }

        const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
        const currentAdminMPO = await mpo.callStatic.admin();
        console.log(`current MPO admin ${currentAdminMPO}`);
        if (currentAdminMPO == currentDeployer) {
          tx = await mpo.changeAdmin(newDeployer);
          await tx.wait();
          console.log(`mpo.changeAdmin tx mined ${tx.hash}`);
        } else if (currentAdminMPO != newDeployer) {
          console.error(`unknown  admin ${currentAdminMPO}`);
        }
      }

      const poolDirectory = (await ethers.getContract("PoolDirectory", deployer)) as PoolDirectory;
      const [, pools] = await poolDirectory.callStatic.getActivePools();
      for (let i = 0; i < pools.length; i++) {
        const pool = pools[i];
        console.log("pool name", pool.name);
        const unitroller = (await ethers.getContractAt("Unitroller", pool.comptroller, deployer)) as Unitroller;
        const admin = await unitroller.callStatic.admin();
        console.log("pool admin", admin);
        console.log("pool comptroller", pool.comptroller);

        if (admin === currentDeployer) {
          {
            // Unitroller - _setPendingAdmin/_acceptAdmin
            const pendingAdmin = await unitroller.callStatic.pendingAdmin();
            if (pendingAdmin != newDeployer) {
              tx = await unitroller._setPendingAdmin(newDeployer);
              await tx.wait();
              console.log(`unitroller._setPendingAdmin tx mined ${tx.hash}`);
            }
          }
        } else if (admin != newDeployer) {
          console.error(`unknown pool admin ${admin}`);
        }

        const comptrollerAsExtension = (await ethers.getContractAt(
          "ComptrollerFirstExtension",
          pool.comptroller,
          deployer
        )) as ComptrollerFirstExtension;
        const flywheels = await comptrollerAsExtension.callStatic.getRewardsDistributors();
        for (let k = 0; k < flywheels.length; k++) {
          const flywheelAddress = flywheels[k];
          {
            const flywheelCore = (await ethers.getContractAt(
              "IonicFlywheelCore",
              flywheelAddress,
              deployer
            )) as IonicFlywheelCore;

            const currentOwner = await flywheelCore.callStatic.owner();
            console.log(`current owner ${currentOwner} of the flywheel at ${flywheelCore.address}`);

            if (currentOwner == currentDeployer) {
              const currentPendingOwner = await flywheelCore.callStatic.pendingOwner();
              console.log(`current pending owner ${currentPendingOwner}`);
              if (currentPendingOwner != newDeployer) {
                tx = await flywheelCore._setPendingOwner(newDeployer);
                await tx.wait();
                console.log(`_setPendingOwner tx mined ${tx.hash}`);
              }
            } else if (currentOwner != newDeployer) {
              console.error(`unknown flywheel owner ${currentOwner}`);
            }
          }
        }

        const markets = await comptrollerAsExtension.callStatic.getAllMarkets();
        for (let j = 0; j < markets.length; j++) {
          const market = markets[j];
          console.log(`market ${market}`);
          const cTokenInstance = (await ethers.getContractAt("ICErc20Plugin", market, deployer)) as ICErc20Plugin;

          console.log("market", {
            cTokenName: await cTokenInstance.callStatic.name(),
            cTokenNameSymbol: await cTokenInstance.callStatic.symbol(),
            implementation: await cTokenInstance.callStatic.implementation()
          });

          let pluginAddress;
          try {
            pluginAddress = await cTokenInstance.callStatic.plugin();
          } catch (pluginError) {
            console.log(`most probably the market has no plugin`);
          }
          if (pluginAddress) {
            // Ownable - transferOwnership(address newOwner)
            const midasERC4626 = (await ethers.getContractAt("IonicERC4626", pluginAddress, deployer)) as IonicERC4626;

            let currentOwner;
            try {
              currentOwner = await midasERC4626.callStatic.owner();
            } catch (pluginError) {
              console.log(`most probably the market has no plugin`);
            }

            if (currentOwner == currentDeployer) {
              //tx = await midasERC4626.transferOwnership(newDeployer);
              const currentPendingOwner = await midasERC4626.callStatic.pendingOwner();
              console.log(`current pending owner ${currentPendingOwner} of plugin ${pluginAddress}`);
              if (currentPendingOwner != newDeployer) {
                tx = await midasERC4626._setPendingOwner(newDeployer);
                await tx.wait();
                console.log(`midasERC4626._setPendingOwner tx mined ${tx.hash}`);
              }
            } else if (currentOwner != newDeployer) {
              console.error(`unknown plugin owner ${currentOwner} for ${pluginAddress}`);
            }
          }
        }
      }

      // transfer all the leftover funds to the new deployer
      const newDeployerSigner = await ethers.getSigner(newDeployer);
      const newDeployerBalance = await newDeployerSigner.getBalance();
      if (newDeployerBalance.isZero()) {
        const oldDeployerBalance = await deployer.getBalance();
        const transaction: providers.TransactionRequest = {
          to: newDeployer,
          value: oldDeployerBalance,
          gasLimit: 21000
        };

        transaction.gasLimit = await ethers.provider.estimateGas(transaction);

        const feeData = await ethers.provider.getFeeData();
        const chainId = ethers.provider.network.chainId;
        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas && chainId != 137 && chainId != 250 && chainId != 97) {
          transaction.maxFeePerGas = feeData.maxFeePerGas;
          transaction.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas; //.div(2);
        } else {
          transaction.gasPrice = ethers.BigNumber.from(feeData.gasPrice);
        }
        // leave 10% for the old to clean up any other holdings
        transaction.value = oldDeployerBalance.mul(9).div(10);

        tx = await deployer.sendTransaction(transaction);
        await tx.wait();
        console.log(`funding the new deployer tx mined ${tx.hash}`);
      }
    }

    console.log("now change the mnemonic in order to run the accept owner role task");
  });

task("system:admin:accept", "Accepts the pending admin/owner roles as the new admin/owner")
  .addParam("newDeployer", "The address of the new deployer", undefined, types.string)
  .setAction(async ({ newDeployer }, { ethers }) => {
    let tx: providers.TransactionResponse;

    const deployer = await ethers.getSigner(newDeployer);

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

    const ap = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
    const currentDep = await ap.callStatic.getAddress("deployer");
    if (currentDep.toLowerCase() != newDeployer.toLowerCase()) {
      tx = await ap.setAddress("deployer", newDeployer);
      await tx.wait();
      console.log(`ap set deployer tx mined ${tx.hash}`);
    }

    // SafeOwnableUpgradeable - _setPendingOwner() / _acceptOwner()
    for (const safeOwnableContract of safeOwnableUpgrContracts) {
      await safeOwnableUpgrAcceptOwnership(ethers, safeOwnableContract, deployer, newDeployer);
    }

    // SafeOwnable - transferOwnership() / acceptOwnership()
    for (const ownableContract of ownable2StepContracts) {
      await ownable2StepAcceptOwnership(ethers, ownableContract, deployer, newDeployer);
    }

    const poolDirectory = (await ethers.getContract("PoolDirectory", deployer)) as PoolDirectory;
    const [, pools] = await poolDirectory.callStatic.getActivePools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool name", pool.name);
      const unitroller = (await ethers.getContractAt("Unitroller", pool.comptroller, deployer)) as Unitroller;

      const admin = await unitroller.callStatic.admin();
      console.log("pool admin", admin);

      const pendingAdmin = await unitroller.callStatic.pendingAdmin();
      console.log("pool pending admin", pendingAdmin);

      if (pendingAdmin === newDeployer) {
        {
          // Unitroller - _setPendingAdmin/_acceptAdmin
          tx = await unitroller._acceptAdmin();
          await tx.wait();
          console.log(`unitroller._acceptAdmin tx mined ${tx.hash}`);
        }
      } else {
        if (pendingAdmin !== ethers.constants.AddressZero) {
          console.error(`the pending admin ${pendingAdmin} is not the new deployer`);
        }
      }

      // IonicFlywheelCore - SafeOwnableUpgradeable - _setPendingOwner() / _acceptOwner()
      {
        const comptroller = (await ethers.getContractAt(
          "ComptrollerFirstExtension",
          pool.comptroller,
          deployer
        )) as ComptrollerFirstExtension;
        const flywheels = await comptroller.callStatic.getRewardsDistributors();
        for (let k = 0; k < flywheels.length; k++) {
          const flywheelAddress = flywheels[k];
          {
            const flywheelCore = (await ethers.getContractAt(
              "IonicFlywheelCore",
              flywheelAddress,
              deployer
            )) as IonicFlywheelCore;
            const flywheelPendingOwner = await flywheelCore.callStatic.pendingOwner();
            if (flywheelPendingOwner == deployer.address) {
              console.log(`accepting the owner role for flywheel ${flywheelAddress}`);
              tx = await flywheelCore._acceptOwner();
              await tx.wait();
              console.log(`flywheelCore._acceptAdmin tx mined ${tx.hash}`);
            } else {
              console.log(`not the flywheel ${flywheelAddress} pending owner ${flywheelPendingOwner}`);
            }
          }
        }

        const comptrollerAsExtension = (await ethers.getContractAt(
          "ComptrollerFirstExtension",
          pool.comptroller,
          deployer
        )) as ComptrollerFirstExtension;

        const markets = await comptrollerAsExtension.callStatic.getAllMarkets();
        for (let j = 0; j < markets.length; j++) {
          const market = markets[j];
          console.log(`market ${market}`);
          const cTokenInstance = (await ethers.getContractAt("ICErc20Plugin", market, deployer)) as ICErc20Plugin;

          let pluginAddress;
          try {
            pluginAddress = await cTokenInstance.callStatic.plugin();
          } catch (pluginError) {
            console.log(`most probably the market has no plugin`);
          }
          if (pluginAddress) {
            // SafeOwnableUpgradeable - _setPendingOwner() / _acceptOwner()
            const midasERC4626 = (await ethers.getContractAt("IonicERC4626", pluginAddress, deployer)) as IonicERC4626;

            try {
              const pendingOwner = await midasERC4626.callStatic.pendingOwner();
              if (pendingOwner == deployer.address) {
                tx = await midasERC4626._acceptOwner();
                await tx.wait();
                console.log(`midasERC4626._acceptOwner tx mined ${tx.hash}`);
              } else if (pendingOwner != ethers.constants.AddressZero) {
                console.error(`unknown plugin owner ${pendingOwner} for ${pluginAddress}`);
              }
            } catch (pluginError) {
              console.error(`check if ownable or safeownable - ${midasERC4626.address}`);
            }
          }
        }
      }
    }
  });
