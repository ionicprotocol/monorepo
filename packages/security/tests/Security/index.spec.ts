import { mode } from "@ionicprotocol/chains";
import { SupportedChains } from "@ionicprotocol/types";
import { restore } from "sinon";

import { SecurityBase } from "../../src/index";
import { expect } from "../globalTestHook";

describe("Fuse Index", () => {
  let securityBase: SecurityBase;
  beforeEach(() => {
    securityBase = new SecurityBase(SupportedChains.mode, null);
  });
  afterEach(function () {
    restore();
  });
  describe("instantiate", () => {
    it("should instantiate Security Base", async () => {
      expect(securityBase.chainConfig.chainAddresses).to.be.eq(mode.chainAddresses);
    });
  });
});
