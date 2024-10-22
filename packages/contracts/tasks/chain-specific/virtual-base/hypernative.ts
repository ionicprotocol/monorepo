import { task } from "hardhat/config";
import { Address } from "viem";
import { oracleAbi } from "./oracleAbi";

const oracle = "0x09585BD75De5Ec03529fbf9cf747ab43fE8D7537";

task("hypernative:set-operator-role", "Set the operator role").setAction(
  async (taskArgs, { viem, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const walletClient = await viem.getWalletClient(deployer as Address);

    const addTx = await walletClient.writeContract({
      address: oracle,
      abi: oracleAbi,
      functionName: "addOperator",
      args: ["0xea1D2636A782a963309dE919f62100ea8bea5C42"]
    });

    console.log("🚀 ~ addTx:", addTx);
  }
);

task("hypernative:set-consumer-role", "Set the consumer role").setAction(
  async (taskArgs, { viem, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const walletClient = await viem.getWalletClient(deployer as Address);

    let addTx = await walletClient.writeContract({
      address: oracle,
      abi: oracleAbi,
      functionName: "addConsumer",
      args: ["0x302b30d61B4A78469EADc631E66433A965F5a288"]
    });
    console.log("🚀 ~ addTx:", addTx);

    addTx = await walletClient.writeContract({
      address: oracle,
      abi: oracleAbi,
      functionName: "addConsumer",
      args: ["0xa900A17a49Bc4D442bA7F72c39FA2108865671f0"] // ionUSDC
    });
    console.log("🚀 ~ addTx:", addTx);
  }
);

task("hypernative:set-oracle", "Set the oracle address").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const oracleProtected = await viem.getContractAt(
      "OracleRegistry",
      (await deployments.get("OracleRegistry")).address as Address
    );
    const setOracleTx = await oracleProtected.write.setOracle([oracle]);

    console.log("🚀 ~ setOracleTx:", setOracleTx);
  }
);

task("hypernative:set-strict-mode", "Set the strict mode").setAction(async (_, { viem, deployments }) => {
  const oracleProtected = await viem.getContractAt(
    "OracleRegistry",
    (await deployments.get("OracleRegistry")).address as Address
  );
  const setStrictModeTx = await oracleProtected.write.setIsStrictMode([true]);
  console.log("🚀 ~ setStrictModeTx:", setStrictModeTx);
});

task("hypernative:register-strict", "Register a strict account").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const oracleProtected = await viem.getContractAt(
      "OracleRegistry",
      (await deployments.get("OracleRegistry")).address as Address
    );
    const registerStrictTx = await oracleProtected.write.oracleRegister([deployer as Address]);
    console.log("🚀 ~ registerStrictTx:", registerStrictTx);
  }
);
const ionUSDC = "0xa900a17a49bc4d442ba7f72c39fa2108865671f0";

task("hypernative:set-oracle:address-provider", "Set the oracle address for USDC").setAction(
  async (_, { viem, deployments }) => {
    const ap = await viem.getContractAt(
      "AddressesProvider",
      (await deployments.get("AddressesProvider")).address as Address
    );
    const setOracleTx = await ap.write.setAddress(["HYPERNATIVE_ORACLE", oracle]);
    console.log("🚀 ~ setOracleTx:", setOracleTx);
  }
);

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
