import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-foundry";
import "@nomicfoundation/hardhat-viem";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { config as dotenv } from "dotenv";

import "./tasks";
import { base, fraxtal, mode, superseed, worldchain } from "viem/chains";

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
      [superseed.id]: "0x1155b614971f16758C92c4890eD338C9e3ede6b7",
      [worldchain.id]: "0x1155b614971f16758C92c4890eD338C9e3ede6b7",
      57073: "0x1155b614971f16758C92c4890eD338C9e3ede6b7",
      7849306: "0x1155b614971f16758C92c4890eD338C9e3ede6b7"
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
      url: process.env.OVERRIDE_RPC_URL_BASE ?? "https://base-rpc.publicnode.com",
      accounts,
      verify: {
        etherscan: {
          apiUrl: "https://api.basescan.org/api?",
          apiKey: process.env.ETHERSCAN_API_KEY_BASE
        }
      }
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
    },
    worldchain: {
      url: process.env.OVERRIDE_RPC_URL_WORLDCHAIN ?? "https://worldchain-mainnet.g.alchemy.com/public",
      accounts,
      verify: {
        etherscan: {
          apiUrl: "https://api.worldscan.org/api?",
          apiKey: process.env.ETHERSCAN_API_KEY_WORLDCHAIN
        }
      }
    },
    ink: {
      url: process.env.OVERRIDE_RPC_URL_INK ?? "https://rpc-qnd.inkonchain.com",
      accounts,
      verify: {
        etherscan: {
          apiUrl: "https://explorer.inkonchain.com/api",
          apiKey: "empty"
        }
      }
    },
    swellchain: {
      url: process.env.OVERRIDE_RPC_URL_SWELLCHAIN ?? "https://rpc.ankr.com/swell",
      accounts,
      verify: {
        etherscan: {
          apiUrl: "https://explorer.swellnetwork.io/api",
          apiKey: "empty"
        }
      }
    },
    ozeantest: {
      url: "https://ozean-testnet.rpc.caldera.xyz/http",
      accounts,
      verify: {
        etherscan: {
          apiUrl: "https://ozean-testnet.explorer.caldera.xyz/api",
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
      superseed: "empty",
      worldchain: process.env.ETHERSCAN_API_KEY_WORLDCHAIN!,
      ink: "empty",
      swellchain: "empty",
      ozeantest: "empty"
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
      },
      {
        network: "worldchain",
        chainId: 480,
        urls: {
          apiURL: "https://api.worldscan.org/api",
          browserURL: "https://api.worldscan.org"
        }
      },
      {
        network: "ink",
        chainId: 57073,
        urls: {
          apiURL: "https://explorer.inkonchain.com/api",
          browserURL: "https://explorer.inkonchain.com"
        }
      },
      {
        network: "swellchain",
        chainId: 1923,
        urls: {
          apiURL: "https://explorer.swellnetwork.io/api",
          browserURL: "https://explorer.swellnetwork.io"
        }
      },
      {
        network: "ozeantest",
        chainId: 7849306,
        urls: {
          apiURL: "https://ozean-l2.explorer.caldera.xyz/api",
          browserURL: "https://ozean-l2.explorer.caldera.xyz"
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
