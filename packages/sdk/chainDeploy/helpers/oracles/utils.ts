import { constants, Contract } from "ethers";

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
    const tx = await mpo.add(underlyings, oracles);
    await tx.wait();
    console.log(`Master Price Oracle updated for token ${underlyings.join(",")}`);
  }
}
