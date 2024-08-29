import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-foundry";
import "@nomicfoundation/hardhat-viem";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { config as dotenv } from "dotenv";

import "./tasks";

dotenv();

const accounts = [
  process.env.DEPLOYER || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" // test account
];


(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: { default: 0 },
    multisig: {
      34443: "0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2"
    }
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
      },
      {
        version: "0.8.22",
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
    contracts: [{ artifacts: "./out" }]
  },
  paths: {
    sources: "./contracts",
    tests: "./contracts/test",
    artifacts: "./artifacts"
  },
  networks: {
    local: {
      accounts,
      url: "http://localhost:8545",
      saveDeployments: false
    },
    mode: {
      url: process.env.OVERRIDE_RPC_URL_MODE ?? "https://mainnet.mode.network",
      accounts
    },
    base: {
      url: process.env.OVERRIDE_RPC_URL_BASE ?? "https://base.meowrpc.com",
      accounts,
      verify: {
        etherscan: {
          apiUrl: "https://api.basescan.org/api?",
          apiKey: process.env.ETHERSCAN_API_KEY_BASE
        }
      }
    },
    optimism: {
      url: process.env.OVERRIDE_RPC_URL ?? "https://mainnet.optimism.io",
      accounts
    },
    bob: {
      url: process.env.OVERRIDE_RPC_URL ?? "https://rpc.gobob.xyz",
      accounts
    },
    fraxtal: {
      url: process.env.OVERRIDE_RPC_URL ?? "https://rpc.frax.com",
      accounts,
      verify: {
        etherscan: {
          apiUrl: "https://api.fraxscan.com/api?",
          apiKey: process.env.ETHERSCAN_API_KEY_FRAXTAL
        }
      }
    }
  },
  etherscan: {
    apiKey: {
      base: process.env.ETHERSCAN_API_KEY_BASE!
    }
  },
  sourcify: {
    enabled: true
  }
};

export default config;
