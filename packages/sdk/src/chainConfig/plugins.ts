import { SupportedChains } from "../enums";
import { ChainDeployedPlugins } from "../types";

const chainDeployedPlugins: ChainDeployedPlugins = {
  [SupportedChains.ganache]: {},
  [SupportedChains.chapel]: {},
  [SupportedChains.bsc]: {
    "0x10C90bfCFb3D2A7ae814dA1548ae3a7fC31C35A0": {
      market: "0x34ea4cbb464E6D120B081661464d4635Ca237FA7",
      name: "Bomb",
    },
    "0x6B8B935dfC9Dcd0754eced708b1b633BF73FE854": {
      market: "0x4cF3D3ca995beEeEd83f67A5C0456A13e038f7b8",
      name: "BTCB-BOMB",
    },
    "0x3c29e9b0CfE6FfF97f373eAbEADE9475FaC3bd4e": {
      market: "0xf0a2852958aD041a9Fb35c312605482Ca3Ec17ba",
      name: "2brl DotDotLpERC4626",
    },
  },
  [SupportedChains.evmos_testnet]: {},
  [SupportedChains.evmos]: {},
  [SupportedChains.moonbeam]: {},
  [SupportedChains.moonbase_alpha]: {},
  [SupportedChains.aurora]: {},
  [SupportedChains.neon_devnet]: {},
  [SupportedChains.polygon]: {
    "0x6578e774120F6010315784C69C634bF3946AFb0c": {
      market: "",
      name: "Beefy agEUR-jEUR Vault",
    },
    "0x74bA0D32B7430a2aad36e48B7aAD57bf233bDDa6": {
      market: "",
      name: "Beefy jEUR-PAR Vault",
    },
    "0xCC9083ad35bd9d55eF9D4cB4C2A6e879fB70fdc1": {
      market: "",
      name: "Beefy jJPY-JPYC Vault",
    },
    "0x742EF90E1828FCEec848c8FB548d45Eaaf17B56d": {
      market: "",
      name: "Beefy jCAD-CADC Vault",
    },
    "0x05fCE131DA43e7Be1cdDda3137f402034a5232fc": {
      market: "",
      name: "Beefy jSGD-XSGD Vault",
    },
  },
};

export default chainDeployedPlugins;
