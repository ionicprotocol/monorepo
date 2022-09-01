import { providers } from "ethers";
import { task, types } from "hardhat/config";

import { CErc20PluginDelegate } from "../lib/contracts/typechain/CErc20PluginDelegate";
import { Comptroller } from "../lib/contracts/typechain/Comptroller";
import { DiaPriceOracle } from "../lib/contracts/typechain/DiaPriceOracle.sol/DiaPriceOracle";
import { FuseFlywheelCore } from "../lib/contracts/typechain/FuseFlywheelCore";
import { FusePoolDirectory } from "../lib/contracts/typechain/FusePoolDirectory";
import { MasterPriceOracle } from "../lib/contracts/typechain/MasterPriceOracle";
import { MidasERC4626 } from "../lib/contracts/typechain/MidasERC4626";
import { Ownable } from "../lib/contracts/typechain/Ownable";
import { OwnableUpgradeable } from "../lib/contracts/typechain/OwnableUpgradeable";
import { SafeOwnableUpgradeable } from "../lib/contracts/typechain/SafeOwnableUpgradeable";
import { Unitroller } from "../lib/contracts/typechain/Unitroller";

export default task("system:admin:change", "Changes the system admin to a new address")
  .addParam("currentDeployer", "The address of the current deployer", undefined, types.string)
  .addParam("newDeployer", "The address of the new deployer", undefined, types.string)
  .setAction(async ({ currentDeployer, newDeployer }, { ethers }) => {
    let tx: providers.TransactionResponse;

    const deployer = await ethers.getSigner(currentDeployer);

    // hardcode it here
    if (newDeployer !== "0x85165a9a25B6a3e9DCA240d2dA0f7019561233Bc") {
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
      }

      {
        // SafeOwnableUpgradeable - _setPendingOwner() / _acceptOwner()
        const ffd = (await ethers.getContract("FuseFeeDistributor", deployer)) as SafeOwnableUpgradeable;
        const currentOwnerFFD = await ffd.callStatic.owner();
        console.log(`current FFD owner ${currentOwnerFFD}`);
        if (currentOwnerFFD == currentDeployer) {
          tx = await ffd._setPendingOwner(newDeployer);
          await tx.wait();
          console.log(`ffd._setPendingOwner tx mined ${tx.hash}`);
        } else if (currentOwnerFFD != newDeployer) {
          console.error(`unknown owner ${currentOwnerFFD}`);
        }

        const fpd = (await ethers.getContract("FusePoolDirectory", deployer)) as SafeOwnableUpgradeable;
        const currentOwnerFPD = await fpd.callStatic.owner();
        console.log(`current FPD owner ${currentOwnerFPD}`);
        if (currentOwnerFPD == currentDeployer) {
          tx = await fpd._setPendingOwner(newDeployer);
          await tx.wait();
          console.log(`fpd._setPendingOwner tx mined ${tx.hash}`);
        } else if (currentOwnerFPD != newDeployer) {
          console.error(`unknown owner ${currentOwnerFPD}`);
        }

        const curveOracle = (await ethers.getContract(
          "CurveLpTokenPriceOracleNoRegistry",
          deployer
        )) as SafeOwnableUpgradeable;
        const currentOwnerCurveOracle = await curveOracle.callStatic.owner();
        console.log(`current curve oracle owner ${currentOwnerCurveOracle}`);
        if (currentOwnerCurveOracle == currentDeployer) {
          tx = await curveOracle._setPendingOwner(newDeployer);
          await tx.wait();
          console.log(`curveOracle._setPendingOwner tx mined ${tx.hash}`);
        } else if (currentOwnerCurveOracle != newDeployer) {
          console.error(`unknown  owner ${currentOwnerCurveOracle}`);
        }
      }

      {
        // DefaultProxyAdmin / TransparentUpgradeableProxy
        const dpa = (await ethers.getContract("DefaultProxyAdmin", deployer)) as Ownable;
        const currentOwnerDpa = await dpa.callStatic.owner();
        console.log(`current DPA owner ${currentOwnerDpa}`);
        if (currentOwnerDpa == currentDeployer) {
          tx = await dpa.transferOwnership(newDeployer);
          await tx.wait();
          console.log(`dpa.transferOwnership tx mined ${tx.hash}`);
        } else if (currentOwnerDpa != newDeployer) {
          console.error(`unknown owner ${currentOwnerDpa}`);
        }
      }

      {
        // custom
        const dpo = (await ethers.getContract("DiaPriceOracle", deployer)) as DiaPriceOracle;
        const currentOwnerDpo = await dpo.callStatic.admin();
        console.log(`current DPO admin ${currentOwnerDpo}`);
        if (currentOwnerDpo == currentDeployer) {
          tx = await dpo.changeAdmin(newDeployer);
          await tx.wait();
          console.log(`dpo.changeAdmin tx mined ${tx.hash}`);
        } else if (currentOwnerDpo != newDeployer) {
          console.error(`unknown  owner ${currentOwnerDpo}`);
        }

        const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
        const currentOwnerMpo = await mpo.callStatic.admin();
        console.log(`current MPO admin ${currentOwnerMpo}`);
        if (currentOwnerMpo == currentDeployer) {
          tx = await mpo.changeAdmin(newDeployer);
          await tx.wait();
          console.log(`mpo.changeAdmin tx mined ${tx.hash}`);
        } else if (currentOwnerMpo != newDeployer) {
          console.error(`unknown  owner ${currentOwnerMpo}`);
        }

      }

      const fusePoolDirectory = (await ethers.getContract("FusePoolDirectory", deployer)) as FusePoolDirectory;
      const pools = await fusePoolDirectory.callStatic.getAllPools();
      for (let i = 0; i < pools.length; i++) {
        const pool = pools[i];
        console.log("pool name", pool.name);
        const comptroller = (await ethers.getContractAt("Comptroller", pool.comptroller, deployer)) as Comptroller;
        const admin = await comptroller.callStatic.admin();
        console.log("pool admin", admin);

        if (admin === currentDeployer) {
          {
            // Unitroller - _setPendingAdmin/_acceptAdmin
            const unitroller = (await ethers.getContractAt("Unitroller", pool.comptroller, deployer)) as Unitroller;
            const currentAdmin = unitroller.callStatic.admin();
            if (currentAdmin == currentDeployer) {
              tx = await unitroller._setPendingAdmin(newDeployer);
              await tx.wait();
              console.log(`unitroller._setPendingAdmin tx mined ${tx.hash}`);
            }
          }
        } else {
          console.log(`pool admin is no the current deployer`);
        }

        const flywheels = await comptroller.callStatic.getRewardsDistributors();
        for (const flywheelAddress in flywheels) {
          {
            // Auth
            const ffc = (await ethers.getContractAt("FuseFlywheelCore", flywheelAddress, deployer)) as FuseFlywheelCore;

            const currentOwnerFFC = await ffc.callStatic.owner();
            console.log(`current owner ${currentOwnerFFC} of FFC ${ffc.address}`);

            tx = await ffc.setAuthority(newDeployer);
            await tx.wait();
            console.log(`ffc.setAuthority tx mined ${tx.hash}`);

            tx = await ffc.setOwner(newDeployer);
            await tx.wait();
            console.log(`ffc.setOwner tx mined ${tx.hash}`);
          }
        }

        const markets = await comptroller.callStatic.getAllMarkets();
        for (let j = 0; j < markets.length; j++) {
          const market = markets[j];
          const cTokenInstance = (await ethers.getContractAt(
            "CErc20PluginDelegate",
            market,
            deployer
          )) as CErc20PluginDelegate;

          console.log("market", {
            cToken: market,
            cTokenName: await cTokenInstance.callStatic.name(),
            cTokenNameSymbol: await cTokenInstance.callStatic.symbol(),
            implementation: await cTokenInstance.callStatic.implementation(),
          });

          try {
            const pluginAddress = await cTokenInstance.callStatic.plugin();
            {
              // Ownable - transferOwnership(address newOwner)
              const midasERC4626 = (await ethers.getContractAt(
                "MidasERC4626",
                pluginAddress,
                deployer
              )) as MidasERC4626;
              tx = await midasERC4626.transferOwnership(newDeployer);
              await tx.wait();
              console.log(`midasERC4626.transferOwnership tx mined ${tx.hash}`);
            }
          } catch (pluginError) {
            console.log(`most probably the market has no plugin`, pluginError);
          }
        }
      }
    }
  });

task("system:admin:accept", "Accepts the pending admin/owner roles as the new admin/owner")
  .addParam("newDeployer", "The address of the new deployer", undefined, types.string)
  .setAction(async ({ newDeployer }, { ethers }) => {
    let tx: providers.TransactionResponse;

    const deployer = await ethers.getSigner(newDeployer);

    const fusePoolDirectory = (await ethers.getContract("FusePoolDirectory", deployer)) as FusePoolDirectory;
    const pools = await fusePoolDirectory.callStatic.getAllPools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool name", pool.name);
      const comptroller = (await ethers.getContractAt("Comptroller", pool.comptroller, deployer)) as Comptroller;

      const admin = await comptroller.callStatic.admin();
      console.log("pool admin", admin);

      const pendingAdmin = await comptroller.callStatic.pendingAdmin();
      console.log("pool pending admin", pendingAdmin);

      if (pendingAdmin === newDeployer) {
        {
          // Unitroller - _setPendingAdmin/_acceptAdmin
          const unitroller = (await ethers.getContractAt("Unitroller", pool.comptroller, deployer)) as Unitroller;
          tx = await unitroller._acceptAdmin();
          await tx.wait();
          console.log(`unitroller._acceptAdmin tx mined ${tx.hash}`);
        }
      } else {
        if (pendingAdmin !== ethers.constants.AddressZero) {
          console.error(`the pending admin ${pendingAdmin} is not the new deployer`);
        }
      }
    }

    {
      // SafeOwnableUpgradeable - _setPendingOwner() / _acceptOwner()
      const ffd = (await ethers.getContract("FuseFeeDistributor", deployer)) as SafeOwnableUpgradeable;
      tx = await ffd._acceptOwner();
      await tx.wait();
      console.log(`ffd._acceptOwner tx mined ${tx.hash}`);

      const fpd = (await ethers.getContract("FusePoolDirectory", deployer)) as SafeOwnableUpgradeable;
      tx = await fpd._acceptOwner();
      await tx.wait();
      console.log(`fpd._acceptOwner tx mined ${tx.hash}`);

      const curveOracle = (await ethers.getContract(
        "CurveLpTokenPriceOracleNoRegistry",
        deployer
      )) as SafeOwnableUpgradeable;
      tx = await curveOracle._acceptOwner();
      await tx.wait();
      console.log(`curveOracle._acceptOwner tx mined ${tx.hash}`);
    }
  });
