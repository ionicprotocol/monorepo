import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-foundry";
import "@nomicfoundation/hardhat-viem";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { config as dotenv } from "dotenv";

import "./tasks";
import { base, fraxtal, mode, superseed } from "viem/chains";

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
      [mode.id]: "0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2",
      [base.id]: "0x9eC25b8063De13d478Ba8121b964A339A1BB0ebB",
      [fraxtal.id]: "0xf8Ec79Ac74b16242d17cC7258250fA3317E3C1b2",
      [superseed.id]: "0x1155b614971f16758C92c4890eD338C9e3ede6b7"
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
      accounts,
      verify: {
        etherscan: {
          apiUrl: "https://blockscout.lisk.com/api",
          apiKey: "empty"
        }
      }
    },
    superseed: {
      url: process.env.OVERRIDE_RPC_URL_SUPERSEED ?? "https://rpc-superseed-mainnet-0.t.conduit.xyz",
      accounts,
      verify: {
        etherscan: {
          apiUrl: "https://explorer-superseed-mainnet-0.t.conduit.xyz/api",
          apiKey: "empty"
        }
      }
    }
  },
  etherscan: {
    apiKey: {
      base: process.env.ETHERSCAN_API_KEY_BASE!,
      optimisticEthereum: process.env.ETHERSCAN_API_KEY_OPTIMISM!,
      lisk: "empty",
      superseed: "empty"
    },
    customChains: [
      {
        network: "lisk",
        chainId: 1135,
        urls: {
          apiURL: "https://blockscout.lisk.com/api",
          browserURL: "https://blockscout.lisk.com"
        }
      },
      {
        network: "superseed",
        chainId: 5330,
        urls: {
          apiURL: "https://explorer-superseed-mainnet-0.t.conduit.xyz/api",
          browserURL: "https://explorer-superseed-mainnet-0.t.conduit.xyz"
        }
      }
    ]
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
