import { ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((20 * 24 * 365 * 60).toString()),
  cgId: "binancecoin",
};

export default specificParams;
