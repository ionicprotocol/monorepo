import { BigNumber } from "ethers";

import { SupportedChains } from "../enums";
import { ChainSpecificParams } from "../types";

const chainSpecificParams: ChainSpecificParams = {
  [SupportedChains.ganache]: {
    blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
    cgId: "ethereum",
  },
  [SupportedChains.chapel]: {
    blocksPerYear: BigNumber.from((20 * 24 * 365 * 60).toString()),
    cgId: "binancecoin",
  },
  [SupportedChains.bsc]: {
    blocksPerYear: BigNumber.from((20 * 24 * 365 * 60).toString()),
    cgId: "binancecoin",
  },
  // TODO: not sure if this is correct
  [SupportedChains.evmos_testnet]: {
    blocksPerYear: BigNumber.from((10 * 24 * 365 * 60).toString()),
    cgId: "evmos",
  },
  [SupportedChains.evmos]: {
    blocksPerYear: BigNumber.from((10 * 24 * 365 * 60).toString()),
    cgId: "evmos",
  },
  [SupportedChains.moonbeam]: {
    blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
    cgId: "moonbeam",
  },
  [SupportedChains.moonbase_alpha]: {
    blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
    cgId: "moonbeam",
  },
  [SupportedChains.aurora]: {
    blocksPerYear: BigNumber.from((50 * 24 * 365 * 60).toString()),
    cgId: "near",
  },
  // TODO: fix
  [SupportedChains.neon_devnet]: {
    blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
    cgId: "solana",
  },
  [SupportedChains.polygon]: {
    blocksPerYear: BigNumber.from((26 * 24 * 365 * 60).toString()),
    cgId: "matic-network",
  },
};

export default chainSpecificParams;
