import { BigNumber, constants, Contract, providers } from "ethers";
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from "sinon";

import WhitePaperInterestRateModel from "../../../src/IonicSdk/irm/WhitePaperInterestRateModel";
import * as utilsFns from "../../../src/IonicSdk/utils";
import { expect } from "../../globalTestHook";
import { mkAddress } from "../../helpers";

describe("whitePaperInterestRateModel", () => {
  let whitePaperInterestRateModel: WhitePaperInterestRateModel;
  let mockProvider: any;

  beforeEach(() => {
    whitePaperInterestRateModel = new WhitePaperInterestRateModel();
    mockProvider = createStubInstance(providers.Web3Provider);
    whitePaperInterestRateModel.initialized = false;
    whitePaperInterestRateModel.reserveFactorMantissa = constants.Zero;
  });

  describe("init", () => {
    let mockWhitePaperModelContract: SinonStubbedInstance<Contract>;
    let mockcTokenContract: SinonStubbedInstance<Contract>;

    beforeEach(() => {
      mockWhitePaperModelContract = createStubInstance(Contract);
      mockcTokenContract = createStubInstance(Contract);

      Object.defineProperty(mockWhitePaperModelContract, "callStatic", {
        value: {
          baseRatePerBlock: () => Promise.resolve(constants.One),
          multiplierPerBlock: () => Promise.resolve(constants.One),
        },
      });
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          reserveFactorMantissa: () => Promise.resolve(constants.One),
          adminFeeMantissa: () => Promise.resolve(constants.Two),
          fuseFeeMantissa: () => Promise.resolve(constants.One),
        },
      });

      stub(utilsFns, "getContract")
        .onFirstCall()
        .returns(mockWhitePaperModelContract)
        .onSecondCall()
        .returns(mockcTokenContract);
    });

    it("model should be initiated from assetAddress", async () => {
      const modelAddress = mkAddress("0xabc");
      const assetAddress = mkAddress("0x123");

      await whitePaperInterestRateModel.init(modelAddress, assetAddress, mockProvider);
      expect(whitePaperInterestRateModel.initialized).to.be.true;
      expect(whitePaperInterestRateModel.reserveFactorMantissa.toNumber()).to.equal(4);
    });
  });

  describe("_init", () => {
    let getwhitePaperInterestRateModelContractStub: SinonStub;
    let mockwhitePaperInterestRateModelContract: SinonStubbedInstance<Contract>;

    beforeEach(() => {
      mockwhitePaperInterestRateModelContract = createStubInstance(Contract);

      Object.defineProperty(mockwhitePaperInterestRateModelContract, "callStatic", {
        value: {
          baseRatePerBlock: () => Promise.resolve(constants.One),
          multiplierPerBlock: () => Promise.resolve(constants.One),
        },
      });

      getwhitePaperInterestRateModelContractStub = stub(utilsFns, "getContract").returns(
        mockwhitePaperInterestRateModelContract
      );
    });

    it("model should be initiated from given Mantissas", async () => {
      const modelAddress = mkAddress("0xabc");
      const reserveFactorMantissa = constants.Two;
      const adminFeeMantissa = constants.One;
      const fuseFeeMantissa = constants.Two;

      await whitePaperInterestRateModel._init(
        modelAddress,
        reserveFactorMantissa,
        adminFeeMantissa,
        fuseFeeMantissa,
        mockProvider
      );
      expect(getwhitePaperInterestRateModelContractStub).to.be.calledOnce;
      expect(whitePaperInterestRateModel.initialized).to.be.true;
      expect(whitePaperInterestRateModel.reserveFactorMantissa.toNumber()).to.equal(5);
    });
  });

  describe("__init", () => {
    it("model should be initiated from block and mantissa", async () => {
      const baseRatePerBlock = constants.Two;
      const multiplierPerBlock = constants.Two;
      const reserveFactorMantissa = constants.One;
      const adminFeeMantissa = constants.One;
      const fuseFeeMantissa = constants.Two;

      await whitePaperInterestRateModel.__init(
        baseRatePerBlock,
        multiplierPerBlock,
        reserveFactorMantissa,
        adminFeeMantissa,
        fuseFeeMantissa
      );
      expect(whitePaperInterestRateModel.initialized).to.be.true;
      expect(whitePaperInterestRateModel.reserveFactorMantissa.toNumber()).to.equal(4);
    });
  });

  describe("getBorrowRate", () => {
    let utilizationRate: BigNumber;

    beforeEach(() => {
      utilizationRate = constants.Two;
      whitePaperInterestRateModel.baseRatePerBlock = constants.One;
      whitePaperInterestRateModel.multiplierPerBlock = constants.One;
    });

    it("should throw error when model is not initialized", async () => {
      expect(() => whitePaperInterestRateModel.getBorrowRate(utilizationRate)).to.throw(
        "Interest rate model class not initialized."
      );
    });

    it("should process utilization when model is initialized", async () => {
      whitePaperInterestRateModel.initialized = true;
      const result = whitePaperInterestRateModel.getBorrowRate(utilizationRate);
      expect(result.toNumber()).to.equal(1);
    });
  });

  describe("getSupplyRate", () => {
    let utilizationRate: BigNumber;

    beforeEach(() => {
      utilizationRate = constants.One;
      whitePaperInterestRateModel.baseRatePerBlock = constants.One;
      whitePaperInterestRateModel.multiplierPerBlock = constants.One;
      whitePaperInterestRateModel.reserveFactorMantissa = constants.One;
    });

    it("should throw error when model is not initialized", async () => {
      expect(() => whitePaperInterestRateModel.getSupplyRate(utilizationRate)).to.throw(
        "Interest rate model class not initialized."
      );
    });

    it("should return supplyRate when model is initialized", async () => {
      whitePaperInterestRateModel.initialized = true;
      const result = whitePaperInterestRateModel.getSupplyRate(utilizationRate);
      expect(result.toNumber()).to.equal(0);
    });
  });
});
