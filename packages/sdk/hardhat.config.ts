import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-abi-exporter";
import "hardhat-tracer";
import { config as dotEnvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/types";

import "./tasks/market";
import "./tasks/oracle";
import "./tasks/plugin";
import "./tasks/pool";
import "./tasks/irm";
import "./tasks/fork";
import "./tasks/swap";

import "./tasks/addChainlinkFeeds";
import "./tasks/createPoolsWithAssets";
import "./tasks/e2e";
import "./tasks/editDeployers";
import "./tasks/fluxFeed";
import "./tasks/flywheel";
import "./tasks/getPoolData";
import "./tasks/liquidation";
import "./tasks/sendTestTokens";
import "./tasks/upgradeMarket";
import "./tasks/updateFuseFee";
import "./tasks/upgradePools";
import "./tasks/replaceDeployer";
import "./tasks/replacePlugins";

import "./tasks/one-time/setNonAccruingFlywheels";
import "./tasks/one-time/dot-dot-bsc-plugins";
import "./tasks/one-time/jarvis-polygon-mimo-plugin";
import "./tasks/one-time/arrakis-polygon-plugins";

dotEnvConfig();

const urlOverride = process.env.ETH_PROVIDER_URL;

console.log("urlOverride: ", urlOverride);
console.log("FORK_RPC_URL: ", process.env.FORK_RPC_URL);

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
    hardhat: {
      chainId: process.env.FORK_CHAIN_ID ? Number(process.env.FORK_CHAIN_ID) : 1337,
      accounts: { mnemonic },
      gasPrice: 20e10,
      gas: 25e6,
    },
    localhost: {
      url: urlOverride || "http://localhost:8545",
      saveDeployments: true,
      chainId: process.env.FORK_CHAIN_ID ? Number(process.env.FORK_CHAIN_ID) : 1337,
      gasPrice: 20e9,
      gas: 25e6,
      accounts: { mnemonic },
    },
    fpolygon: {
      url: "http://localhost:8546",
      accounts: { mnemonic },
      chainId: 137,
      // gasPrice: 20e9,
      // gas: 7500000,
    },
    fbsc: {
      accounts: { mnemonic },
      chainId: 56,
      gasPrice: 20e9,
      gas: 7500000,
      url: "http://localhost:8545",
    },
    rinkeby: {
      accounts: { mnemonic },
      chainId: 4,
      url: urlOverride || process.env.RINKEBY_ETH_PROVIDER_URL || "https://rpc.ankr.com/eth_rinkeby",
    },
    kovan: {
      accounts: { mnemonic },
      chainId: 42,
      url: "https://kovan.infura.io/v3/10bc2717e7f14941a3ab5bea569da361",
    },
    bsc: {
      accounts: { mnemonic },
      chainId: 56,
      url: urlOverride || process.env.BSC_PROVIDER_URL || "https://bsc-dataseed.binance.org/",
    },

    chapel: {
      accounts: { mnemonic },
      chainId: 97,
      url: urlOverride || "https://data-seed-prebsc-1-s1.binance.org:8545/",
    },
    mainnet: {
      accounts: { mnemonic },
      chainId: 1,
      url: urlOverride || "https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN",
    },
    evmostestnet: {
      accounts: { mnemonic },
      chainId: 9000,
      url: "https://eth.bd.evmos.dev:8545",
    },
    moonbase: {
      url: urlOverride || `https://rpc.api.moonbase.moonbeam.network`,
      accounts: { mnemonic },
      chainId: 1287,
      saveDeployments: true,
      gasPrice: 1000000000,
      gas: 8000000,
    },
    moonbeam: {
      url: urlOverride || `https://rpc.api.moonbeam.network`,
      accounts: { mnemonic },
      chainId: 1284,
      saveDeployments: true,
    },
    neondevnet: {
      url: urlOverride || `https://proxy.devnet.neonlabs.org/solana`,
      accounts: { mnemonic },
      chainId: 245022926,
    },
    polygon: {
      url: urlOverride || `https://polygon-rpc.com/`,
      accounts: { mnemonic },
      chainId: 137,
    },
    arbitrum: {
      url: urlOverride || `https://rpc.ankr.com/arbitrum`,
      accounts: { mnemonic },
      chainId: 42161,
    },
  },
};

export default config;
