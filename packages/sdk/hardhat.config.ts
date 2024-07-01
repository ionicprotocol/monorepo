import { optimism } from "@ionicprotocol/chains";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import { config as dotEnvConfig } from "dotenv";
import "hardhat-abi-exporter";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/types/config";

import "./tasks/admin";
import "./tasks/flywheel";
import "./tasks/fork";
import "./tasks/irm";
import "./tasks/market";
import "./tasks/oracle";
import "./tasks/plugin";
import "./tasks/pool";
import "./tasks/swap";
import "./tasks/validate";
import "./tasks/vaults";
import "./tasks/auth";
import "./tasks/liquidation";
import "./tasks/leverage/configurePair";

import "./tasks/one-time";

dotEnvConfig();

const OVERRIDE_RPC_URL = process.env.OVERRIDE_RPC_URL || process.env.ETH_PROVIDER_URL; // Deprecated: ETH_PROVIDER_URL
const FORK_RPC_URL = process.env.FORK_RPC_URL;
const FORK_CHAIN_ID = process.env.FORK_CHAIN_ID;
const FORK_BLOCK_NUMBER = process.env.FORK_BLOCK_NUMBER;

// eslint-disable-next-line no-console
console.info({
  OVERRIDE_RPC_URL,
  FORK_RPC_URL,
  FORK_CHAIN_ID,
  FORK_BLOCK_NUMBER
});

const mnemonic =
  process.env.SUGAR_DADDY ||
  process.env.MNEMONIC ||
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const config: HardhatUserConfig = {
  mocha: {
    timeout: 200_000
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  external: {
    contracts: [{ artifacts: "./lib/contracts/out" }]
  },
  paths: {
    sources: "./none",
    tests: "./tests",
    artifacts: "./lib/contracts/out"
  },

  namedAccounts: {
    deployer: { default: 0 },
    alice: { default: 1 },
    bob: { default: 2 },
    rando: { default: 3 },
    multisig: {
      34443: "0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2",
      10: ""
    }
  },
  networks: {
    // This is the unchangeable default network which is started with `hardhat node`
    hardhat: {
      accounts: { mnemonic },
      allowUnlimitedContractSize: true,
      chainId: FORK_CHAIN_ID ? Number(FORK_CHAIN_ID) : 1337,
      gas: 25e6,
      gasPrice: 20e10,
      forking: FORK_RPC_URL
        ? {
            url: FORK_RPC_URL,
            blockNumber: FORK_BLOCK_NUMBER ? Number(FORK_BLOCK_NUMBER) : undefined
          }
        : undefined
    },
    fork: {
      allowUnlimitedContractSize: true,
      accounts: { mnemonic },
      chainId: FORK_CHAIN_ID ? Number(FORK_CHAIN_ID) : 1337,
      gasPrice: 20e9,
      gas: 7500000,
      url: "http://localhost:8545"
    },
    mode: {
      url: OVERRIDE_RPC_URL || `https://mainnet.mode.network/`,
      accounts: { mnemonic },
      chainId: 34443,
      minGasPrice: 2e9,
      initialBaseFeePerGas: 2e9,
      gasMultiplier: 3
    },
    base: {
      url: OVERRIDE_RPC_URL || `https://mainnet.base.org`,
      accounts: { mnemonic },
      chainId: 8453
    },
    optimism: {
      url: OVERRIDE_RPC_URL || optimism.specificParams.metadata.rpcUrls.default.http[0],
      accounts: { mnemonic },
      chainId: 10
    }
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5"
  }
};

export default config;
