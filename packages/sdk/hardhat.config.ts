import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-abi-exporter";
import "hardhat-tracer";
import { config as dotEnvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/types";

import "./tasks/addChainlinkFeeds";
import "./tasks/createMarket";
import "./tasks/createPool";
import "./tasks/createPoolsWithAssets";
import "./tasks/createStrategy";
import "./tasks/e2e";
import "./tasks/editDeployers";
import "./tasks/fluxFeed";
import "./tasks/flywheel";
import "./tasks/getPoolData";
import "./tasks/liquidation";
import "./tasks/oracle";
import "./tasks/pauseMarketMinting";
import "./tasks/sendTestTokens";
import "./tasks/swap";
import "./tasks/upgradeMarket";
import "./tasks/jarvisFix";

dotEnvConfig();

const urlOverride = process.env.ETH_PROVIDER_URL;

console.log("FORK_URL_BSC: ", process.env.FORK_URL_BSC);

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
  },
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: { default: 0 },
    alice: { default: 1 },
    bob: { default: 2 },
    rando: { default: 3 },
  },
  networks: {
    hardhat: {
      forking: process.env.FORK_URL_BSC
        ? {
            url: process.env.FORK_URL_BSC,
            blockNumber: process.env.FORK_BLOCK_NUMBER ? Number(process.env.FORK_BLOCK_NUMBER) : undefined,
          }
        : undefined,
      saveDeployments: true,
      chainId: process.env.FORK_CHAIN_ID ? Number(process.env.FORK_CHAIN_ID) : 1337,
      gasPrice: 20e9,
      gas: 25e6,
      allowUnlimitedContractSize: true,
      accounts: { mnemonic },
    },
    localhost: {
      url: urlOverride || "http://localhost:8545",
      saveDeployments: true,
      chainId: process.env.FORK_CHAIN_ID ? Number(process.env.FORK_CHAIN_ID) : 1337,
      gasPrice: 20e9,
      gas: 25e6,
      allowUnlimitedContractSize: true,
      accounts: { mnemonic },
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
      url:
        urlOverride ||
        process.env.BSC_PROVIDER_URL ||
        "https://bsc-mainnet.nodereal.io/v1/6e60a664b05244e0b0f2e7e043739f6f",
    },
    bscfork: {
      accounts: { mnemonic },
      chainId: 56,
      gasPrice: 20e9,
      gas: 7500000,
      allowUnlimitedContractSize: true,
      url: "http://localhost:8545",
    },
    chapel: {
      accounts: { mnemonic },
      chainId: 97,
      // url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      url: "https://speedy-nodes-nyc.moralis.io/2d2926c3e761369208fba31f/bsc/testnet",
    },
    mainnet: {
      accounts: { mnemonic },
      chainId: 1,
      // url: "https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN",
      url: "https://speedy-nodes-nyc.moralis.io/2d2926c3e761369208fba31f/bsc/mainnet",
    },
    evmostestnet: {
      accounts: { mnemonic },
      chainId: 9000,
      url: "https://eth.bd.evmos.dev:8545",
    },
    moonbase: {
      url: `https://rpc.api.moonbase.moonbeam.network`,
      accounts: { mnemonic },
      chainId: 1287,
      saveDeployments: true,
      gasPrice: 1000000000,
      gas: 8000000,
    },
    moonbeam: {
      url: `https://rpc.api.moonbeam.network`,
      accounts: { mnemonic },
      chainId: 1284,
      saveDeployments: true,
    },
    neondevnet: {
      url: `https://proxy.devnet.neonlabs.org/solana`,
      accounts: { mnemonic },
      chainId: 245022926,
    },
  },
};

export default config;
