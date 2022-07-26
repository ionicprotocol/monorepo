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
  [SupportedChains.polygon]: {},
};

export default chainDeployedPlugins;
