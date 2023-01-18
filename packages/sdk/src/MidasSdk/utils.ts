import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import Filter from "bad-words";
import { Contract, ContractFactory, Signer, utils } from "ethers";

import UnitrollerArtifact from "../../artifacts/Unitroller.json";
import ComptrollerABI from "../../abis/Comptroller";
import { Comptroller } from "../../typechain/Comptroller";
import { Unitroller } from "../../typechain/Unitroller";

export function filterOnlyObjectProperties(obj: any) {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => isNaN(k as any))) as any;
}

export const filter = new Filter({ placeHolder: " " });
filter.addWords(...["R1", "R2", "R3", "R4", "R5", "R6", "R7"]);

export const filterPoolName = (name: string) => {
  return filter.clean(name);
};

export const getSaltsHash = (from: string, poolName: string, blockNumber: number): string => {
  return utils.solidityKeccak256(["address", "string", "uint"], [from, poolName, blockNumber]);
};

export const getBytecodeHash = (fuseFeeDistributorAddress: string): string => {
  return utils.keccak256(
    UnitrollerArtifact.bytecode.object + new utils.AbiCoder().encode(["address"], [fuseFeeDistributorAddress]).slice(2)
  );
};

export const getPoolAddress = (
  from: string,
  poolName: string,
  marketsCounter: number,
  fuseFeeDistributorAddress: string,
  fusePoolDirectoryAddress: string
): string => {
  return utils.getCreate2Address(
    fusePoolDirectoryAddress,
    getSaltsHash(from, poolName, marketsCounter),
    getBytecodeHash(fuseFeeDistributorAddress)
  );
};

export const getPoolUnitroller = (poolAddress: string, signer?: Signer): Unitroller => {
  return new Contract(poolAddress, UnitrollerArtifact.abi, signer) as Unitroller;
};

export const getPoolComptroller = (poolAddress: string, signer?: Signer): Comptroller => {
  return new Contract(poolAddress, ComptrollerABI, signer) as Comptroller;
};

export const getContract = (address: string, abi: any, providerOrSigner: Web3Provider | JsonRpcProvider | Signer) => {
  return new Contract(address, abi, providerOrSigner);
};
