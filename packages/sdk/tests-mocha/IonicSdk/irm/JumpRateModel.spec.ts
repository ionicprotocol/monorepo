import { describe } from "mocha";
import { stub } from "sinon";
import { PublicClient } from "viem";

import JumpRateModel from "../../../src/IonicSdk/irm/JumpRateModel";
import * as utilsFns from "../../../src/IonicSdk/utils";
import { expect } from "../../globalTestHook";
import { mkAddress, stubbedContract, stubbedPublicClient } from "../../helpers";

describe("JumpRateModel", () => {
  let jumpRateModel: JumpRateModel;
  let mockPublicClient: PublicClient;

  beforeEach(() => {
    jumpRateModel = new JumpRateModel();
    mockPublicClient = stubbedPublicClient;

    jumpRateModel.initialized = false;
    jumpRateModel.baseRatePerBlock = 0n;
    jumpRateModel.multiplierPerBlock = 0n;
    jumpRateModel.jumpMultiplierPerBlock = 0n;
    jumpRateModel.kink = 0n;
    jumpRateModel.reserveFactorMantissa = 0n;
  });

  describe("init", () => {
    let mockJumpRateModelContract;
    let mockcTokenContract;

    beforeEach(() => {
      mockJumpRateModelContract = { ...stubbedContract };
      mockJumpRateModelContract.read = {
        baseRatePerBlock: stub().resolves(1n),
        multiplierPerBlock: stub().resolves(1n),
        jumpMultiplierPerBlock: stub().resolves(2n),
        kink: stub().resolves(2n)
      };

      mockcTokenContract = { ...stubbedContract };
      mockcTokenContract.read = {
        reserveFactorMantissa: stub().resolves(1n),
        adminFeeMantissa: stub().resolves(2n),
        ionicFeeMantissa: stub().resolves(1n)
      };

      stub(utilsFns, "getContract")
        .onFirstCall()
        .returns(mockJumpRateModelContract)
        .onSecondCall()
        .returns(mockcTokenContract);
    });

    it("model should be initiated from assetAddress", async () => {
      const modelAddress = mkAddress("0xabc");
      const assetAddress = mkAddress("0x123");

      await jumpRateModel.init(modelAddress, assetAddress, mockPublicClient);
      expect(jumpRateModel.initialized).to.equal(true);
      expect(jumpRateModel.reserveFactorMantissa).to.equal(4n);
    });
  });

  describe("_init", () => {
    let getJumpRateModelContractStub;
    let mockJumpRateModelContract;

    beforeEach(() => {
      mockJumpRateModelContract = stubbedContract;

      mockJumpRateModelContract.read = {
        baseRatePerBlock: () => Promise.resolve(1n),
        multiplierPerBlock: () => Promise.resolve(1n),
        jumpMultiplierPerBlock: () => Promise.resolve(2n),
        kink: () => Promise.resolve(2n)
      };

      getJumpRateModelContractStub = stub(utilsFns, "getContract").returns(mockJumpRateModelContract);
    });

    it("model should be initiated from given Mantissas", async () => {
      const modelAddress = mkAddress("0xabc");
      const reserveFactorMantissa = 2n;
      const adminFeeMantissa = 1n;
      const ionicFeeMantissa = 2n;

      await jumpRateModel._init(
        modelAddress,
        reserveFactorMantissa,
        adminFeeMantissa,
        ionicFeeMantissa,
        mockPublicClient
      );
      expect(getJumpRateModelContractStub).to.be.calledOnce;
      expect(jumpRateModel.initialized).to.equal(true);
      expect(jumpRateModel.reserveFactorMantissa).to.equal(5n);
    });
  });

  describe("__init", () => {
    it("model should be initiated from block, mantissa and kink", async () => {
      const baseRatePerBlock = 2n;
      const multiplierPerBlock = 2n;
      const jumpMultiplierPerBlock = 2n;
      const kink = 2n;
      const reserveFactorMantissa = 1n;
      const adminFeeMantissa = 1n;
      const ionicFeeMantissa = 2n;

      await jumpRateModel.__init(
        baseRatePerBlock,
        multiplierPerBlock,
        jumpMultiplierPerBlock,
        kink,
        reserveFactorMantissa,
        adminFeeMantissa,
        ionicFeeMantissa
      );
      expect(jumpRateModel.initialized).to.equal(true);
      expect(jumpRateModel.multiplierPerBlock).to.equal(2n);
      expect(jumpRateModel.jumpMultiplierPerBlock).to.equal(2n);
      expect(jumpRateModel.kink).to.equal(2n);
      expect(jumpRateModel.reserveFactorMantissa).to.equal(4n);
    });
  });

  describe("getBorrowRate", () => {
    let utilizationRate: bigint;

    beforeEach(() => {
      utilizationRate = 1n;
      jumpRateModel.baseRatePerBlock = 1n;
      jumpRateModel.multiplierPerBlock = 1n;
      jumpRateModel.jumpMultiplierPerBlock = 1n;
      jumpRateModel.reserveFactorMantissa = 1n;
    });

    it("should throw error when model is not initialized", async () => {
      expect(() => jumpRateModel.getBorrowRate(utilizationRate)).to.throw("Interest rate model class not initialized.");
    });

    it("should utilization is less than kink", async () => {
      jumpRateModel.initialized = true;
      jumpRateModel.kink = 2n;
      const result = jumpRateModel.getBorrowRate(utilizationRate);
      expect(result).to.equal(1n);
    });

    it("should utilization is greater than kink", async () => {
      jumpRateModel.initialized = true;
      jumpRateModel.kink = 1n;
      utilizationRate = 2n;
      const result = jumpRateModel.getBorrowRate(utilizationRate);
      expect(result).to.equal(1n);
    });
  });

  describe("getSupplyRate", () => {
    let utilizationRate: bigint;

    beforeEach(() => {
      utilizationRate = 1n;
      jumpRateModel.baseRatePerBlock = 1n;
      jumpRateModel.multiplierPerBlock = 1n;
      jumpRateModel.jumpMultiplierPerBlock = 1n;
      jumpRateModel.reserveFactorMantissa = 1n;
      jumpRateModel.kink = 1n;
      utilizationRate = 2n;
    });

    it("should throw error when model is not initialized", async () => {
      expect(() => jumpRateModel.getSupplyRate(utilizationRate)).to.throw("Interest rate model class not initialized.");
    });

    it("should get supply when model is initialized", async () => {
      jumpRateModel.initialized = true;
      const result = jumpRateModel.getSupplyRate(utilizationRate);
      expect(result).to.equal(0n);
    });
  });
});
