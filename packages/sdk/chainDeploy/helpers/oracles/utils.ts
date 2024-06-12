import { constants, Contract } from "ethers";
import { addTransaction } from "../logging";

export async function addUnderlyingsToMpo(mpo: Contract, underlyingsToCheck: string[], oracleAddress: string) {
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
    const tx = await mpo.populateTransaction.add(underlyings, oracles);

    addTransaction({
      to: tx.to,
      value: tx.value ? tx.value.toString() : "0",
      data: tx.data,
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

    console.log(`Transaction for Master Price Oracle update for tokens ${underlyings.join(",")} added to log.`);
  }
}

export async function addUnderlyingsToMpoFallback(mpo: Contract, underlyingsToCheck: string[], oracleAddress: string) {
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
    const tx = await mpo.populateTransaction.addFallbacks(underlyings, oracles);
    addTransaction({
      to: tx.to,
      value: tx.value ? tx.value.toString() : "0",
      data: tx.data,
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
    console.log(
      `Transaction for Master Price Oracle update fallbacks for tokens ${underlyings.join(",")} added to log.`
    );
  }
}
