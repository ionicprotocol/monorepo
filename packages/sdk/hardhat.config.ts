import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import { config as dotEnvConfig } from "dotenv";
import "hardhat-abi-exporter";
import "hardhat-deploy";
import "hardhat-tracer";
import { HardhatUserConfig } from "hardhat/types";

import "./tasks/fork";
import "./tasks/irm";
import "./tasks/market";
import "./tasks/oracle";
import "./tasks/plugin";
import "./tasks/pool";
import "./tasks/swap";
import "./tasks/admin";

import "./tasks/createPoolsWithAssets";
import "./tasks/e2e";
import "./tasks/flywheel";
import "./tasks/liquidation";
import "./tasks/replacePlugins";
import "./tasks/sendTestTokens";

import "./tasks/one-time/arrakis-polygon-plugins";
import "./tasks/one-time/dot-dot-bsc-plugins";
import "./tasks/one-time/jarvis-polygon-mimo-plugin";
import "./tasks/one-time/downgradeMarket";
import "./tasks/oracle/add-apeswap-oracle";
import "./tasks/configureApStrategies";

dotEnvConfig();

const OVERRIDE_RPC_URL = process.env.OVERRIDE_RPC_URL || process.env.ETH_PROVIDER_URL; // Deprecated: ETH_PROVIDER_URL
const FORK_RPC_URL = process.env.FORK_RPC_URL;
const FORK_CHAIN_ID = process.env.FORK_CHAIN_ID;

console.info({
  OVERRIDE_RPC_URL,
  FORK_RPC_URL,
  FORK_CHAIN_ID,
});

const mnemonic =
  process.env.SUGAR_DADDY ||
  process.env.MNEMONIC ||
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const config: HardhatUserConfig = {
  mocha: {
    timeout: 200_000,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  external: {
    contracts: [{ artifacts: "./lib/contracts/out" }],
  },
  paths: {
    sources: "./none",
    tests: "./tests",
    artifacts: "./lib/contracts/out",
  },

  namedAccounts: {
    deployer: { default: 0 },
    alice: { default: 1 },
    bob: { default: 2 },
    rando: { default: 3 },
  },
  networks: {
    // This is the unchangeable default network which is started with `hardhat node`
    hardhat: {
      accounts: { mnemonic },
      chainId: FORK_CHAIN_ID ? Number(FORK_CHAIN_ID) : 1337,
      gas: 25e6,
      gasPrice: 20e10,
      forking: FORK_RPC_URL
        ? {
            url: FORK_RPC_URL,
          }
        : undefined,
    },
    fork: {
      accounts: { mnemonic },
      chainId: FORK_CHAIN_ID ? Number(FORK_CHAIN_ID) : 1337,
      gasPrice: 20e9,
      gas: 7500000,
      url: "http://localhost:8545",
    },
    localbsc: {
      accounts: { mnemonic },
      chainId: 56,
      gas: 25e6,
      gasPrice: 20e10,
      url: "http://localhost:8545",
    },
    localpolygon: {
      accounts: { mnemonic },
      chainId: 137,
      gas: 25e6,
      gasPrice: 20e10,
      url: "http://localhost:8546",
    },
    rinkeby: {
      accounts: { mnemonic },
      chainId: 4,
      url: OVERRIDE_RPC_URL || process.env.RINKEBY_ETH_PROVIDER_URL || "https://rpc.ankr.com/eth_rinkeby",
    },
    kovan: {
      accounts: { mnemonic },
      chainId: 42,
      url: "https://kovan.infura.io/v3/10bc2717e7f14941a3ab5bea569da361",
    },
    bsc: {
      accounts: { mnemonic },
      chainId: 56,
      url: OVERRIDE_RPC_URL || process.env.BSC_PROVIDER_URL || "https://bsc-dataseed.binance.org/",
    },
    chapel: {
      accounts: { mnemonic },
      chainId: 97,
      url: OVERRIDE_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
    },
    mainnet: {
      accounts: { mnemonic },
      chainId: 1,
      url: OVERRIDE_RPC_URL || "https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN",
    },
    evmostestnet: {
      accounts: { mnemonic },
      chainId: 9000,
      url: "https://eth.bd.evmos.dev:8545",
    },
    moonbase: {
      url: OVERRIDE_RPC_URL || `https://rpc.api.moonbase.moonbeam.network`,
      accounts: { mnemonic },
      chainId: 1287,
      saveDeployments: true,
      gasPrice: 1000000000,
      gas: 8000000,
    },
    moonbeam: {
      url: OVERRIDE_RPC_URL || `https://rpc.api.moonbeam.network`,
      accounts: { mnemonic },
      chainId: 1284,
      saveDeployments: true,
    },
    neondevnet: {
      url: OVERRIDE_RPC_URL || `https://proxy.devnet.neonlabs.org/solana`,
      accounts: { mnemonic },
      chainId: 245022926,
    },
    polygon: {
      url: OVERRIDE_RPC_URL || `https://polygon-rpc.com/`,
      accounts: { mnemonic },
      chainId: 137,
    },
    arbitrum: {
      url: OVERRIDE_RPC_URL || `https://arb1.arbitrum.io/rpc`,
      accounts: { mnemonic },
      chainId: 42161,
    },
  },
};

export default config;
