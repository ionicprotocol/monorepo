import { bsc } from "@midas-capital/chains";
import { restore } from "sinon";

import { SecurityBase } from "../../src/index";
import { expect } from "../globalTestHook";

describe("Fuse Index", () => {
  let securityBase: SecurityBase;
  beforeEach(() => {
    securityBase = new SecurityBase(56);
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
