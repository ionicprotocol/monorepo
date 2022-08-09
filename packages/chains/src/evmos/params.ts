import { ChainParams } from "@midas-capital/types";
import { BigNumber } from "ethers";

const specificParams: ChainParams = {
  blocksPerYear: BigNumber.from((10 * 24 * 365 * 60).toString()),
  cgId: "evmos",
};

export default specificParams;
