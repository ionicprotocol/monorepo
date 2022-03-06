import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@tenderly/hardhat-tenderly";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-abi-exporter";
import "hardhat-tracer";
import { config as dotEnvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/types";

import "./tasks/editDeployers";
import "./tasks/addChainlinkFeeds";
import "./tasks/createPoolsWithAssets";
import "./tasks/sendTestTokens";
import "./tasks/oraclePrice";
import "./tasks/getPoolData";
import "./tasks/e2e";

dotEnvConfig();

const urlOverride = process.env.ETH_PROVIDER_URL;

const mnemonic =
  process.env.SUGAR_DADDY ||
  process.env.MNEMONIC ||
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const config: HardhatUserConfig = {
  mocha: {
    timeout: 120_000,
  },
  tenderly: {
    username: "carlomazzaferro",
    project: "midas-contracts",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.7.6",
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
    contracts: [
      {
        artifacts: "./artifacts/contracts/compound",
      },
    ],
  },
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    tests: "./test",
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
      saveDeployments: true,
      chainId: 1337,
      gasPrice: 20e9,
      gas: 25e6,
      allowUnlimitedContractSize: true,
      accounts: { mnemonic },
    },
    localhost: {
      url: urlOverride || "http://localhost:8545",
      saveDeployments: true,
      chainId: 1337,
      gasPrice: 20e9,
      gas: 25e6,
      allowUnlimitedContractSize: true,
      accounts: { mnemonic },
    },
    rinkeby: {
      accounts: { mnemonic },
      chainId: 4,
      url: urlOverride || process.env.RINKEBY_ETH_PROVIDER_URL || "http://localhost:8545",
    },
    bsc: {
      accounts: { mnemonic },
      chainId: 56,
      url: urlOverride || process.env.BSC_PROVIDER_URL || "https://bsc-dataseed.binance.org/",
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
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    },
    mainnet: {
      accounts: { mnemonic },
      chainId: 1,
      url: "https://eth-mainnet.alchemyapi.io/v2/2Mt-6brbJvTA4w9cpiDtnbTo6qOoySnN",
    },
    evmostestnet: {
      accounts: { mnemonic },
      chainId: 9000,
      url: "https://evmos-archive-testnet.api.bdnodes.net:8545",
    },
  },
  typechain: {
    outDir: "./typechain",
  },
};

export default config;
