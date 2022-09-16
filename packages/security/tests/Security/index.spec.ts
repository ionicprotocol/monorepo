import { bsc } from "@midas-capital/chains";
import { SupportedChains } from "@midas-capital/types";
import { restore } from "sinon";

import { SecurityBase } from "../../src/index";
import { expect } from "../globalTestHook";

describe("Fuse Index", () => {
  let securityBase: SecurityBase;
  beforeEach(() => {
    securityBase = new SecurityBase(SupportedChains.bsc, null);
  });
  afterEach(function () {
    restore();
  });
  describe("instantiate", () => {
    it("should instantiate Security Base", async () => {
      expect(securityBase.chainConfig.chainAddresses).to.be.eq(bsc.chainAddresses);
    });
  });
});
