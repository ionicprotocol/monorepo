import { SupportedChains } from "@ionicprotocol/types";

import { SecurityBase } from "../../../src/index";
import * as OraclesModule from "../../../src/oracle";
import { getProvider } from "../../helpers";

describe("Oracle", () => {
  const UniswapV3OracleScorer = OraclesModule.withUniswapV3OracleScorer(SecurityBase);
  let oracleArbitrum: InstanceType<typeof UniswapV3OracleScorer>;
  let securityBase: SecurityBase;

  beforeEach(() => {});

  describe("getOracleRating", () => {
    // it("should fetch oracle rating for bsc", async () => {
    //   const ratings = await oracleArbitrum.getUniswapV3OracleRating();
    //   console.log(ratings);
    // });
  });
});
