import { task } from "hardhat/config";
import { Address, parseUnits } from "viem";
import { oracleAbi } from "./oracleAbi";
import { COMPTROLLER } from "../base";

const oracle = "0xd30CB636E561C6dAC6ee136767BAe0933eC9Aeb8";
const basePool = COMPTROLLER;
const ionUSDC = "0xa900a17a49bc4d442ba7f72c39fa2108865671f0";
const multisig = "0x9eC25b8063De13d478Ba8121b964A339A1BB0ebB";

// yarn workspace @ionicprotocol/contracts hardhat deploy --tags security-oracle --network virtual_base

task("hypernative:change-admin", "Change the admin to deployer for testing").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const unitroller = await viem.getContractAt("Unitroller", basePool);
    const admin = await unitroller.read.admin();
    console.log("🚀 ~ admin:", admin);
    if (admin.toLowerCase() !== deployer.toLowerCase()) {
      const pendingAdmin = await unitroller.read.pendingAdmin();
      console.log("🚀 ~ pendingAdmin:", pendingAdmin);
      if (pendingAdmin.toLowerCase() !== deployer.toLowerCase()) {
        const changeAdminTx = await unitroller.write._setPendingAdmin([deployer as Address]);
        console.log("🚀 ~ changeAdminTx:", changeAdminTx);
        await publicClient.waitForTransactionReceipt({ hash: changeAdminTx });
      }
      const acceptAdminTx = await unitroller.write._acceptAdmin();
      console.log("🚀 ~ acceptAdminTx:", acceptAdminTx);
    }

    const ffd = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address
    );
    const owner = await ffd.read.owner();
    console.log("🚀 ~ owner:", owner);
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      // const setOwnerTx = await ffd.write.transferOwnership([deployer as Address]);
      // console.log("🚀 ~ setOwnerTx:", setOwnerTx);
      // await publicClient.waitForTransactionReceipt({ hash: setOwnerTx });
      const acceptOwnerTx = await ffd.write._acceptOwner();
      console.log("🚀 ~ acceptOwnerTx:", acceptOwnerTx);
      await publicClient.waitForTransactionReceipt({ hash: acceptOwnerTx });
    }
  }
);

// yarn workspace @ionicprotocol/contracts hardhat deploy --tags market-setup --network virtual_base

task("hypernative:upgrade-cToken", "Upgrade the cToken").setAction(async (_, { viem, deployments, run }) => {
  const cToken = await viem.getContractAt("ICErc20", ionUSDC as Address);
  const feeDistributor = await viem.getContractAt(
    "FeeDistributor",
    (await deployments.get("FeeDistributor")).address as Address
  );

  const [latestImpl] = await feeDistributor.read.latestCErc20Delegate([await cToken.read.delegateType()]);
  await run("market:upgrade:safe", {
    marketAddress: cToken.address,
    implementationAddress: latestImpl
  });
});

task("hypernative:set-oracle", "Set the oracle address").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const oracleProtected = await viem.getContractAt(
      "OracleRegistry",
      (await deployments.get("OracleRegistry")).address as Address
    );
    const setOracleTx = await oracleProtected.write.setOracle([oracle]);

    console.log("🚀 ~ setOracleTx:", setOracleTx);

    const ap = await viem.getContractAt(
      "AddressesProvider",
      (await deployments.get("AddressesProvider")).address as Address
    );
    const setOracleApTx = await ap.write.setAddress(["HYPERNATIVE_ORACLE", oracle]);
    console.log("🚀 ~ setOracleApTx:", setOracleApTx);
  }
);

// will fail if not authorized by oracle
task("hypernative:set-reserve-factor", "Set the reserve factor").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    console.log("🚀 ~ deployer:", deployer);
    const cToken = await viem.getContractAt("ICErc20", ionUSDC as Address);
    const reserveFactor = await cToken.read.reserveFactorMantissa();
    console.log("🚀 ~ reserveFactor:", reserveFactor);
    const setReserveFactorTx = await cToken.write._setReserveFactor([48000000000000000n]);
    console.log("🚀 ~ setReserveFactorTx:", setReserveFactorTx);
  }
);

// works with EOA
task("hypernative:mint", "Mint the cToken").setAction(async (_, { viem, deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const cToken = await viem.getContractAt("ICErc20", ionUSDC as Address);
  const amount = parseUnits("1", await cToken.read.decimals());
  const underlying = await cToken.read.underlying();
  const underlyingContract = await viem.getContractAt("IERC20", underlying as Address);
  const approveTx = await underlyingContract.write.approve([ionUSDC, amount]);
  console.log("🚀 ~ approveTx:", approveTx);
  const mintTx = await cToken.write.mint([amount]);
  console.log("🚀 ~ mintTx:", mintTx);
});
