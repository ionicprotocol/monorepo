import { BigNumber, constants, Contract, providers } from "ethers";
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from "sinon";

import DAIInterestRateModelV2 from "../../../src/IonicSdk/irm/DAIInterestRateModelV2";
import JumpRateModel from "../../../src/IonicSdk/irm/JumpRateModel";
import * as utilsFns from "../../../src/IonicSdk/utils";
import { expect } from "../../globalTestHook";
import { mkAddress } from "../../helpers";

describe("DAIInterestRateModelV2", () => {
  let dAIInterestRateModelV2: DAIInterestRateModelV2;
  let mockProvider: any;
  let initStub: SinonStub;
  let _initStub: SinonStub;
  let __initStub: SinonStub;

  beforeEach(() => {
    dAIInterestRateModelV2 = new DAIInterestRateModelV2();
    mockProvider = createStubInstance(providers.Web3Provider);

    dAIInterestRateModelV2.initialized = false;
    dAIInterestRateModelV2.dsrPerBlock = constants.Zero;
    dAIInterestRateModelV2.cash = constants.Zero;
    dAIInterestRateModelV2.borrows = constants.Zero;
    dAIInterestRateModelV2.reserves = constants.Zero;
    dAIInterestRateModelV2.reserveFactorMantissa = constants.Zero;
  });

  describe("init", () => {
    let mockJumpRateModelContract: SinonStubbedInstance<Contract>;
    let mockcTokenContract: SinonStubbedInstance<Contract>;

    beforeEach(() => {
      mockJumpRateModelContract = createStubInstance(Contract);
      mockcTokenContract = createStubInstance(Contract);
      initStub = stub(JumpRateModel.prototype, "init");

      Object.defineProperty(mockJumpRateModelContract, "callStatic", {
        value: {
          dsrPerBlock: () => Promise.resolve(constants.One),
        },
      });
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          getCash: () => Promise.resolve(constants.One),
          totalBorrowsCurrent: () => Promise.resolve(constants.Two),
          totalReserves: () => Promise.resolve(constants.One),
        },
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

      await dAIInterestRateModelV2.init(modelAddress, assetAddress, mockProvider);
      expect(initStub).to.be.calledOnce;
      expect(dAIInterestRateModelV2.reserves.toNumber()).to.equal(1);
    });
  });

  describe("_init", () => {
    let getDAIInterestRateModelV2ContractStub: SinonStub;
    let mockDAIInterestRateModelV2Contract: SinonStubbedInstance<Contract>;

    beforeEach(() => {
      _initStub = stub(JumpRateModel.prototype, "_init");
      mockDAIInterestRateModelV2Contract = createStubInstance(Contract);

      Object.defineProperty(mockDAIInterestRateModelV2Contract, "callStatic", {
        value: {
          dsrPerBlock: () => Promise.resolve(constants.One),
        },
      });

      getDAIInterestRateModelV2ContractStub = stub(utilsFns, "getContract").returns(mockDAIInterestRateModelV2Contract);
    });

    it("model should be initiated from given Mantissas", async () => {
      const modelAddress = mkAddress("0xabc");
      const reserveFactorMantissa = constants.Two;
      const adminFeeMantissa = constants.One;
      const ionicFeeMantissa = constants.Two;

      await dAIInterestRateModelV2._init(
        modelAddress,
        reserveFactorMantissa,
        adminFeeMantissa,
        ionicFeeMantissa,
        mockProvider
      );
      expect(getDAIInterestRateModelV2ContractStub).to.be.calledOnce;
      expect(_initStub).to.be.calledOnce;
      expect(dAIInterestRateModelV2.dsrPerBlock.toNumber()).to.equal(1);
    });
  });

  describe("__init", () => {
    beforeEach(() => {
      __initStub = stub(JumpRateModel.prototype, "__init");
    });

    it("model should be initiated from block, mantissa and kink", async () => {
      const baseRatePerBlock = constants.Two;
      const multiplierPerBlock = constants.Two;
      const jumpMultiplierPerBlock = constants.Two;
      const kink = constants.Two;
      const reserveFactorMantissa = constants.One;
      const adminFeeMantissa = constants.One;
      const ionicFeeMantissa = constants.Two;

      await dAIInterestRateModelV2.__init(
        baseRatePerBlock,
        multiplierPerBlock,
        jumpMultiplierPerBlock,
        kink,
        reserveFactorMantissa,
        adminFeeMantissa,
        ionicFeeMantissa
      );
      expect(__initStub).to.be.calledOnce;
      expect(dAIInterestRateModelV2.dsrPerBlock.toNumber()).to.equal(0);
    });
  });

  describe("getSupplyRate", () => {
    let utilizationRate: BigNumber;
    let getSupplyRateSuperStub: SinonStub;

    beforeEach(() => {
      utilizationRate = constants.One;
      dAIInterestRateModelV2.borrows = constants.Zero;
      dAIInterestRateModelV2.reserves = constants.Zero;
      dAIInterestRateModelV2.cash = constants.Zero;
      dAIInterestRateModelV2.dsrPerBlock = constants.Zero;
      getSupplyRateSuperStub = stub(JumpRateModel.prototype, "getSupplyRate");
    });

    it("should throw error when model is not initialized", async () => {
      expect(() => dAIInterestRateModelV2.getSupplyRate(utilizationRate)).to.throw(
        "Interest rate model class not initialized."
      );
    });

    it("should return supper supplyRate when sum of cash, borrows and reserves are zero", async () => {
      getSupplyRateSuperStub.returns(BigNumber.from(1));
      dAIInterestRateModelV2.initialized = true;
      dAIInterestRateModelV2.cash = BigNumber.from(1);
      dAIInterestRateModelV2.borrows = BigNumber.from(1);
      dAIInterestRateModelV2.reserves = BigNumber.from(2);
      dAIInterestRateModelV2.dsrPerBlock = BigNumber.from(1);

      const result = dAIInterestRateModelV2.getSupplyRate(utilizationRate);
      expect(getSupplyRateSuperStub).to.be.calledOnce;
      expect(result.toNumber()).to.equal(1);
    });

    it("should add cashRate to supper supplyRate when  when sum of cash, borrows and reserves are not zero", async () => {
      getSupplyRateSuperStub.returns(BigNumber.from(1));
      dAIInterestRateModelV2.initialized = true;
      dAIInterestRateModelV2.cash = BigNumber.from(2);
      dAIInterestRateModelV2.borrows = BigNumber.from(1);
      dAIInterestRateModelV2.reserves = BigNumber.from(2);
      dAIInterestRateModelV2.dsrPerBlock = BigNumber.from(1);

      const result = dAIInterestRateModelV2.getSupplyRate(utilizationRate);
      expect(getSupplyRateSuperStub).to.be.calledOnce;
      expect(result.toNumber()).to.equal(3);
    });
  });
});
