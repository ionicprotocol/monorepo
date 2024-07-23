import Filter from "bad-words";
import {
  Address,
  encodeAbiParameters,
  parseAbiParameters,
  getContractAddress,
  Hex,
  keccak256,
  encodePacked,
  Hash,
  GetContractReturnType,
  getContract as vGetContract,
  WalletClient,
  PublicClient
} from "viem";

import UnitrollerArtifact from "../../artifacts/Unitroller.sol/Unitroller.json";
import { ionicComptrollerAbi, unitrollerAbi } from "../generated";

export function filterOnlyObjectProperties(obj: any) {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => isNaN(k as any))) as any;
}

export const filter = new Filter({ placeHolder: " " });
filter.addWords(...["R1", "R2", "R3", "R4", "R5", "R6", "R7"]);

export const filterPoolName = (name: string) => {
  return filter.clean(name);
};

export const getSaltsHash = (from: Address, poolName: string, blockNumber: bigint): Hash => {
  return keccak256(encodePacked(["address", "string", "uint"], [from, poolName, blockNumber]));
};

export const getBytecodeHash = (feeDistributorAddress: Address): Hash => {
  return keccak256(
    ((UnitrollerArtifact.bytecode.object as Hex) +
      encodeAbiParameters(parseAbiParameters("address"), [feeDistributorAddress]).slice(2)) as Hex
  );
};

export const getPoolAddress = (
  from: Address,
  poolName: string,
  marketsCounter: bigint,
  feeDistributorAddress: Address,
  poolDirectoryAddress: Address
): Address => {
  return getContractAddress({
    bytecode: getBytecodeHash(feeDistributorAddress),
    from: poolDirectoryAddress,
    opcode: "CREATE2",
    salt: getSaltsHash(from, poolName, marketsCounter)
  });
};

export const getPoolUnitroller = (
  poolAddress: Address,
  walletClient: WalletClient
): GetContractReturnType<typeof unitrollerAbi, PublicClient> => {
  return getContract({ address: poolAddress, abi: unitrollerAbi, client: walletClient });
};

export const getPoolComptroller = (
  poolAddress: Address,
  walletClient: WalletClient
): GetContractReturnType<typeof ionicComptrollerAbi, PublicClient> => {
  return getContract({ address: poolAddress, abi: ionicComptrollerAbi, client: walletClient });
};

export const getContract = vGetContract;
