import { providers } from "ethers";
import { task, types } from "hardhat/config";

import { ComptrollerFirstExtension } from "../../lib/contracts/typechain";
import { AddressesProvider } from "../../lib/contracts/typechain/AddressesProvider";
import { CErc20PluginDelegate } from "../../lib/contracts/typechain/CErc20PluginDelegate";
import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { DiaPriceOracle } from "../../lib/contracts/typechain/DiaPriceOracle.sol/DiaPriceOracle";
import { FusePoolDirectory } from "../../lib/contracts/typechain/FusePoolDirectory";
import { MasterPriceOracle } from "../../lib/contracts/typechain/MasterPriceOracle";
import { MidasERC4626 } from "../../lib/contracts/typechain/MidasERC4626";
import { MidasFlywheelCore } from "../../lib/contracts/typechain/MidasFlywheelCore";
import { Ownable } from "../../lib/contracts/typechain/Ownable";
import { OwnableUpgradeable } from "../../lib/contracts/typechain/OwnableUpgradeable";
import { SafeOwnableUpgradeable } from "../../lib/contracts/typechain/SafeOwnableUpgradeable";
import { Unitroller } from "../../lib/contracts/typechain/Unitroller";

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
        const fsl = (await ethers.getContract("FuseSafeLiquidator", deployer)) as OwnableUpgradeable;
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
        const ffd = (await ethers.getContract("FuseFeeDistributor", deployer)) as SafeOwnableUpgradeable;
        const currentOwnerFFD = await ffd.callStatic.owner();
        console.log(`current FFD owner ${currentOwnerFFD}`);
        if (currentOwnerFFD == currentDeployer) {
          const currentPendingOwner = await ffd.callStatic.pendingOwner();
          if (currentPendingOwner != newDeployer) {
            tx = await ffd._setPendingOwner(newDeployer);
            await tx.wait();
            console.log(`ffd._setPendingOwner tx mined ${tx.hash}`);
          }
        } else if (currentOwnerFFD != newDeployer) {
          console.error(`unknown owner ${currentOwnerFFD}`);
        }

        const fpd = (await ethers.getContract("FusePoolDirectory", deployer)) as SafeOwnableUpgradeable;
        const currentOwnerFPD = await fpd.callStatic.owner();
        console.log(`current FPD owner ${currentOwnerFPD}`);
        if (currentOwnerFPD == currentDeployer) {
          const currentPendingOwner = await fpd.callStatic.pendingOwner();
          if (currentPendingOwner != newDeployer) {
            tx = await fpd._setPendingOwner(newDeployer);
            await tx.wait();
            console.log(`fpd._setPendingOwner tx mined ${tx.hash}`);
          }
        } else if (currentOwnerFPD != newDeployer) {
          console.error(`unknown owner ${currentOwnerFPD}`);
        }

        const curveOracle = (await ethers.getContractOrNull(
          "CurveLpTokenPriceOracleNoRegistry",
          deployer
        )) as SafeOwnableUpgradeable;

        if (curveOracle) {
          const currentOwnerCurveOracle = await curveOracle.callStatic.owner();
          console.log(`current curve oracle owner ${currentOwnerCurveOracle}`);
          if (currentOwnerCurveOracle == currentDeployer) {
            const currentPendingOwner = await curveOracle.callStatic.pendingOwner();
            if (currentPendingOwner != newDeployer) {
              tx = await curveOracle._setPendingOwner(newDeployer);
              await tx.wait();
              console.log(`curveOracle._setPendingOwner tx mined ${tx.hash}`);
            }
          } else if (currentOwnerCurveOracle != newDeployer) {
            console.error(`unknown  owner ${currentOwnerCurveOracle}`);
          }
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
          console.error(`unknown  owner ${currentOwnerDPA}`);
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

      const fusePoolDirectory = (await ethers.getContract("FusePoolDirectory", deployer)) as FusePoolDirectory;
      const [, pools] = await fusePoolDirectory.callStatic.getActivePools();
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
              "MidasFlywheelCore",
              flywheelAddress,
              deployer
            )) as MidasFlywheelCore;

            const currentOwner = await flywheelCore.callStatic.owner();
            console.log(`current owner ${currentOwner} of the flywheel at ${flywheelCore.address}`);

            if (currentOwner == currentDeployer) {
              tx = await flywheelCore._setPendingOwner(newDeployer);
              await tx.wait();
              console.log(`_setPendingOwner tx mined ${tx.hash}`);
            } else if (currentOwner != newDeployer) {
              console.error(`unknown flywheel owner ${currentOwner}`);
            }
          }
        }

        const markets = await comptrollerAsExtension.callStatic.getAllMarkets();
        for (let j = 0; j < markets.length; j++) {
          const market = markets[j];
          console.log(`market ${market}`);
          const cTokenInstance = (await ethers.getContractAt(
            "CErc20PluginDelegate",
            market,
            deployer
          )) as CErc20PluginDelegate;

          console.log("market", {
            cTokenName: await cTokenInstance.callStatic.name(),
            cTokenNameSymbol: await cTokenInstance.callStatic.symbol(),
            implementation: await cTokenInstance.callStatic.implementation(),
          });

          let pluginAddress;
          try {
            pluginAddress = await cTokenInstance.callStatic.plugin();
          } catch (pluginError) {
            console.log(`most probably the market has no plugin`);
          }
          if (pluginAddress) {
            // Ownable - transferOwnership(address newOwner)
            const midasERC4626 = (await ethers.getContractAt("MidasERC4626", pluginAddress, deployer)) as MidasERC4626;

            let currentOwner;
            try {
              currentOwner = await midasERC4626.callStatic.owner();
            } catch (pluginError) {
              console.log(`most probably the market has no plugin`);
            }

            if (currentOwner == currentDeployer) {
              tx = await midasERC4626.transferOwnership(newDeployer);
              await tx.wait();
              console.log(`midasERC4626.transferOwnership tx mined ${tx.hash}`);
            } else if (currentOwner != newDeployer) {
              console.error(`unknown plugin owner ${currentOwner} for ${pluginAddress}`);
            }
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
        gasLimit: 21000,
      };

      transaction.gasLimit = await ethers.provider.estimateGas(transaction);

      const feeData = await ethers.provider.getFeeData();
      let feePerGas;
      const chainId = ethers.provider.network.chainId;
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas && chainId != 137) {
        transaction.maxFeePerGas = feeData.maxFeePerGas;
        transaction.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas; //.div(2);
        feePerGas = transaction.maxFeePerGas.add(transaction.maxPriorityFeePerGas);
      } else {
        transaction.gasPrice = feeData.gasPrice;
        feePerGas = transaction.gasPrice;
      }
      transaction.value = oldDeployerBalance.sub(feePerGas.mul(transaction.gasLimit));

      tx = await deployer.sendTransaction(transaction);
      await tx.wait();
      console.log(`funding the new deployer tx mined ${tx.hash}`);
    }

    console.log("now change the mnemonic in order to run the accept owner role task");
  });

task("system:admin:accept", "Accepts the pending admin/owner roles as the new admin/owner")
  .addParam("newDeployer", "The address of the new deployer", undefined, types.string)
  .setAction(async ({ newDeployer }, { ethers }) => {
    let tx: providers.TransactionResponse;

    const deployer = await ethers.getSigner(newDeployer);

    const fusePoolDirectory = (await ethers.getContract("FusePoolDirectory", deployer)) as FusePoolDirectory;
    const [, pools] = await fusePoolDirectory.callStatic.getActivePools();
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

      // MidasFlywheelCore - SafeOwnableUpgradeable - _setPendingOwner() / _acceptOwner()
      {
        const comptroller = (await ethers.getContractAt(
          "Comptroller.sol:Comptroller",
          pool.comptroller,
          deployer
        )) as Comptroller;
        const flywheels = await comptroller.callStatic.getRewardsDistributors();
        for (let k = 0; k < flywheels.length; k++) {
          const flywheelAddress = flywheels[k];
          {
            const flywheelCore = (await ethers.getContractAt(
              "MidasFlywheelCore",
              flywheelAddress,
              deployer
            )) as MidasFlywheelCore;
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
      }
    }

    {
      // SafeOwnableUpgradeable - _setPendingOwner() / _acceptOwner()
      {
        const ffd = (await ethers.getContract("FuseFeeDistributor", deployer)) as SafeOwnableUpgradeable;
        const pendingOwner = await ffd.callStatic.pendingOwner();
        if (pendingOwner == newDeployer) {
          tx = await ffd._acceptOwner();
          await tx.wait();
          console.log(`ffd._acceptOwner tx mined ${tx.hash}`);
        }
      }

      {
        const fpd = (await ethers.getContract("FusePoolDirectory", deployer)) as SafeOwnableUpgradeable;
        const pendingOwner = await fpd.callStatic.pendingOwner();
        if (pendingOwner == newDeployer) {
          tx = await fpd._acceptOwner();
          await tx.wait();
          console.log(`fpd._acceptOwner tx mined ${tx.hash}`);
        }
      }

      const curveOracle = (await ethers.getContractOrNull(
        "CurveLpTokenPriceOracleNoRegistry",
        deployer
      )) as SafeOwnableUpgradeable;

      if (curveOracle) {
        const pendingOwner = await curveOracle.callStatic.pendingOwner();
        if (pendingOwner == newDeployer) {
          tx = await curveOracle._acceptOwner();
          await tx.wait();
          console.log(`curveOracle._acceptOwner tx mined ${tx.hash}`);
        }
      }
    }
  });
