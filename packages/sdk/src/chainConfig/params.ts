import { ChainSpecificParams, SupportedChains } from "@midas-capital/types";
import { BigNumber } from "ethers";

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
  [SupportedChains.evmos]: {
    blocksPerYear: BigNumber.from((10 * 24 * 365 * 60).toString()),
    cgId: "evmos",
  },
  [SupportedChains.moonbeam]: {
    blocksPerYear: BigNumber.from((5 * 24 * 365 * 60).toString()),
    cgId: "moonbeam",
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
