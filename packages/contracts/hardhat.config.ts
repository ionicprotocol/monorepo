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
      34443: "0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2",
      8453: "0x9eC25b8063De13d478Ba8121b964A339A1BB0ebB"
    }
  },
  solidity: {
    compilers: [
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
    virtual_base: {
      url: process.env.OVERRIDE_RPC_URL_VIRTUAL_BASE,
      chainId: 8453,
      accounts
    },
    optimism: {
      url: process.env.OVERRIDE_RPC_URL_OPTIMISM ?? "https://mainnet.optimism.io",
      accounts,
      verify: {
        etherscan: {
          apiUrl: "https://api-optimistic.etherscan.io/api?",
          apiKey: process.env.ETHERSCAN_API_KEY_OPTIMISM
        }
      }
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
    },
    lisk: {
      url: process.env.OVERRIDE_RPC_URL_LISK ?? "https://rpc.api.lisk.com",
      accounts
    }
  },
  etherscan: {
    apiKey: {
      base: process.env.ETHERSCAN_API_KEY_BASE!,
      optimisticEthereum: process.env.ETHERSCAN_API_KEY_OPTIMISM!
    }
  },
  sourcify: {
    enabled: true
  }
  // tenderly: {
  //   project: "ionic",
  //   username: "ionicdev"
  // }
};

export default config;
