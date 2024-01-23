import { BigNumber, constants, Contract, providers } from "ethers";
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from "sinon";

import JumpRateModel from "../../../src/IonicSdk/irm/JumpRateModel";
import * as utilsFns from "../../../src/IonicSdk/utils";
import { expect } from "../../globalTestHook";
import { mkAddress } from "../../helpers";

describe("JumpRateModel", () => {
  let jumpRateModel: JumpRateModel;
  let mockProvider: any;

  beforeEach(() => {
    jumpRateModel = new JumpRateModel();
    mockProvider = createStubInstance(providers.Web3Provider);

    jumpRateModel.initialized = false;
    jumpRateModel.baseRatePerBlock = constants.Zero;
    jumpRateModel.multiplierPerBlock = constants.Zero;
    jumpRateModel.jumpMultiplierPerBlock = constants.Zero;
    jumpRateModel.kink = constants.Zero;
    jumpRateModel.reserveFactorMantissa = constants.Zero;
  });

  describe("init", () => {
    let mockJumpRateModelContract: SinonStubbedInstance<Contract>;
    let mockcTokenContract: SinonStubbedInstance<Contract>;

    beforeEach(() => {
      mockJumpRateModelContract = createStubInstance(Contract);
      mockcTokenContract = createStubInstance(Contract);

      Object.defineProperty(mockJumpRateModelContract, "callStatic", {
        value: {
          baseRatePerBlock: () => Promise.resolve(constants.One),
          multiplierPerBlock: () => Promise.resolve(constants.One),
          jumpMultiplierPerBlock: () => Promise.resolve(constants.Two),
          kink: () => Promise.resolve(constants.Two)
        }
      });
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          reserveFactorMantissa: () => Promise.resolve(constants.One),
          adminFeeMantissa: () => Promise.resolve(constants.Two),
          ionicFeeMantissa: () => Promise.resolve(constants.One)
        }
      });

      stub(utilsFns, "getContract")
        .onFirstCall()
        .returns(mockJumpRateModelContract)
        .onSecondCall()
        .returns(mockcTokenContract);
    });

    it("model should be initiated from assetAddress", async () => {
      const modelAddress = mkAddress("0xabc");
      const assetAddress = mkAddress("0x123");

      await jumpRateModel.init(modelAddress, assetAddress, mockProvider);
      expect(jumpRateModel.initialized).to.equal(true);
      expect(jumpRateModel.reserveFactorMantissa.toNumber()).to.equal(4);
    });
  });

  describe("_init", () => {
    let getJumpRateModelContractStub: SinonStub;
    let mockJumpRateModelContract: SinonStubbedInstance<Contract>;

    beforeEach(() => {
      mockJumpRateModelContract = createStubInstance(Contract);

      Object.defineProperty(mockJumpRateModelContract, "callStatic", {
        value: {
          baseRatePerBlock: () => Promise.resolve(constants.One),
          multiplierPerBlock: () => Promise.resolve(constants.One),
          jumpMultiplierPerBlock: () => Promise.resolve(constants.Two),
          kink: () => Promise.resolve(constants.Two)
        }
      });

      getJumpRateModelContractStub = stub(utilsFns, "getContract").returns(mockJumpRateModelContract);
    });

    it("model should be initiated from given Mantissas", async () => {
      const modelAddress = mkAddress("0xabc");
      const reserveFactorMantissa = constants.Two;
      const adminFeeMantissa = constants.One;
      const ionicFeeMantissa = constants.Two;

      await jumpRateModel._init(modelAddress, reserveFactorMantissa, adminFeeMantissa, ionicFeeMantissa, mockProvider);
      expect(getJumpRateModelContractStub).to.be.calledOnce;
      expect(jumpRateModel.initialized).to.equal(true);
      expect(jumpRateModel.reserveFactorMantissa.toNumber()).to.equal(5);
    });
  });

  describe("__init", () => {
    it("model should be initiated from block, mantissa and kink", async () => {
      const baseRatePerBlock = constants.Two;
      const multiplierPerBlock = constants.Two;
      const jumpMultiplierPerBlock = constants.Two;
      const kink = constants.Two;
      const reserveFactorMantissa = constants.One;
      const adminFeeMantissa = constants.One;
      const ionicFeeMantissa = constants.Two;

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
      expect(jumpRateModel.multiplierPerBlock.toNumber()).to.equal(2);
      expect(jumpRateModel.jumpMultiplierPerBlock.toNumber()).to.equal(2);
      expect(jumpRateModel.kink.toNumber()).to.equal(2);
      expect(jumpRateModel.reserveFactorMantissa.toNumber()).to.equal(4);
    });
  });

  describe("getBorrowRate", () => {
    let utilizationRate: BigNumber;

    beforeEach(() => {
      utilizationRate = constants.One;
      jumpRateModel.baseRatePerBlock = constants.One;
      jumpRateModel.multiplierPerBlock = constants.One;
      jumpRateModel.jumpMultiplierPerBlock = constants.One;
      jumpRateModel.reserveFactorMantissa = constants.One;
    });

    it("should throw error when model is not initialized", async () => {
      expect(() => jumpRateModel.getBorrowRate(utilizationRate)).to.throw("Interest rate model class not initialized.");
    });

    it("should utilization is less than kink", async () => {
      jumpRateModel.initialized = true;
      jumpRateModel.kink = constants.Two;
      const result = jumpRateModel.getBorrowRate(utilizationRate);
      expect(result.toNumber()).to.equal(1);
    });

    it("should utilization is greater than kink", async () => {
      jumpRateModel.initialized = true;
      jumpRateModel.kink = constants.One;
      utilizationRate = constants.Two;
      const result = jumpRateModel.getBorrowRate(utilizationRate);
      expect(result.toNumber()).to.equal(1);
    });
  });

  describe("getSupplyRate", () => {
    let utilizationRate: BigNumber;

    beforeEach(() => {
      utilizationRate = constants.One;
      jumpRateModel.baseRatePerBlock = constants.One;
      jumpRateModel.multiplierPerBlock = constants.One;
      jumpRateModel.jumpMultiplierPerBlock = constants.One;
      jumpRateModel.reserveFactorMantissa = constants.One;
      jumpRateModel.kink = constants.One;
      utilizationRate = constants.Two;
    });

    it("should throw error when model is not initialized", async () => {
      expect(() => jumpRateModel.getSupplyRate(utilizationRate)).to.throw("Interest rate model class not initialized.");
    });

    it("should get supply when model is initialized", async () => {
      jumpRateModel.initialized = true;
      const result = jumpRateModel.getSupplyRate(utilizationRate);
      expect(result.toNumber()).to.equal(0);
    });
  });
});
