import { task } from "hardhat/config";
import { Address } from "viem";
import { oracleAbi } from "./oracleAbi";

const oracle = "0x489B3a5cE40E574D403ed9b0d2be4354A897C687";

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
