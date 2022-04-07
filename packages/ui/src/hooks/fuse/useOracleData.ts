// Rari
import { Contract } from 'ethers';

export type OracleDataType = {
  admin: string; // Address of Oracle's admin
  adminOverwrite: boolean; // Will tell us if admin can overwrite existing oracle-token pairs
  oracleContract: Contract;
  defaultOracle: undefined | string;
};
