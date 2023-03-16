import { constants, Contract } from "ethers";

export async function addUnderlyingsToMpo(mpo: Contract, underlyingsToCheck: string[], oracleAddress: string) {
  const oracles = [];
  const underlyings = [];
  for (const underlying of underlyingsToCheck) {
    if ((await mpo.callStatic.oracles(underlying)) === constants.AddressZero) {
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
