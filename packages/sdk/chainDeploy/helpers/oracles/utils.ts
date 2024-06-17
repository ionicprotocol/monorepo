import { constants, Contract } from "ethers";
import { addTransaction } from "../logging";

export async function addUnderlyingsToMpo(mpo: Contract, underlyingsToCheck: string[], oracleAddress: string) {
  const hre = require("hardhat");
  const { deployer } = await hre.getNamedAccounts();
  const oracles: string[] = [];
  const underlyings: string[] = [];
  for (const underlying of underlyingsToCheck) {
    const currentOracle = await mpo.callStatic.oracles(underlying);
    if (currentOracle === constants.AddressZero || currentOracle !== oracleAddress) {
      oracles.push(oracleAddress);
      underlyings.push(underlying);
    }
  }

  if (underlyings.length) {
    if ((await mpo.callStatic.admin()).toLowerCase() === deployer.toLowerCase()) {
      const tx = await mpo.add(underlyings, oracles);
      await tx.wait();
      console.log(`Master Price Oracle updated oracles for tokens ${underlyings.join(",")} at ${tx.hash}`);
    } else {
      const tx = await mpo.populateTransaction.add(underlyings, oracles);
      addTransaction({
        to: tx.to,
        value: tx.value ? tx.value.toString() : "0",
        data: null,
        contractMethod: {
          inputs: [
            { internalType: "address[]", name: "underlyings", type: "address[]" },
            { internalType: "address[]", name: "_oracles", type: "address[]" }
          ],
          name: "add",
          payable: false
        },
        contractInputsValues: {
          underlyings: underlyings,
          _oracles: oracles
        }
      });

      console.log(`Logged Transaction for Master Price Oracle update for tokens ${underlyings.join(",")}`);
    }
  }
}

export async function addUnderlyingsToMpoFallback(mpo: Contract, underlyingsToCheck: string[], oracleAddress: string) {
  const hre = require("hardhat");
  const { deployer } = await hre.getNamedAccounts();
  const oracles: string[] = [];
  const underlyings: string[] = [];
  for (const underlying of underlyingsToCheck) {
    const currentOracle = await mpo.callStatic.fallbackOracles(underlying);
    if (currentOracle === constants.AddressZero || currentOracle !== oracleAddress) {
      oracles.push(oracleAddress);
      underlyings.push(underlying);
    }
  }

  if (underlyings.length) {
    if ((await mpo.callStatic.admin()).toLowerCase() === deployer.toLowerCase()) {
      const tx = await mpo.addFallbacks(underlyings, oracles);
      await tx.wait();
      console.log(`Master Price Oracle updated fallbacks for tokens ${underlyings.join(",")} at tx ${tx.hash}.`);
    } else {
      const tx = await mpo.populateTransaction.addFallbacks(underlyings, oracles);
      addTransaction({
        to: tx.to,
        value: tx.value ? tx.value.toString() : "0",
        data: null,
        contractMethod: {
          inputs: [
            { internalType: "address[]", name: "underlyings", type: "address[]" },
            { internalType: "address[]", name: "_oracles", type: "address[]" }
          ],
          name: "addFallbacks",
          payable: false
        },
        contractInputsValues: {
          underlyings: underlyings,
          _oracles: oracles
        }
      });
      console.log(`Logged Transaction for Master Price Oracle update fallbacks for tokens ${underlyings.join(",")}.`);
    }
  }
}
