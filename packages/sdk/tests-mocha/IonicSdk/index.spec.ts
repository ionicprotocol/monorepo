import { ganache } from "@ionicprotocol/chains";
import { BigNumber, constants, Contract, ContractReceipt, providers, Signer, utils } from "ethers";
import { createStubInstance, restore, SinonStub, SinonStubbedInstance, stub } from "sinon";

import JumpRateModelArtifact from "../../artifacts/JumpRateModel.json";
import { IonicBase } from "../../src/IonicSdk/index";
import JumpRateModel from "../../src/IonicSdk/irm/JumpRateModel";
import * as utilsFns from "../../src/IonicSdk/utils";
import { Comptroller, PoolDirectory, Unitroller } from "../../typechain";
import { expect } from "../globalTestHook";
import { mkAddress } from "../helpers";

const mockReceipt: Partial<ContractReceipt> = { status: 1, events: [{ args: [constants.Two] }] as any, blockNumber: 1 };

describe("Fuse Index", () => {
  let fuseBase: IonicBase;
  let mockContract: SinonStubbedInstance<Contract>;

  beforeEach(() => {
    mockContract = createStubInstance(Contract);
    mockContract.connect.returns(mockContract);
    Object.defineProperty(mockContract, "callStatic", {
      value: {
        getActivePools: stub().resolves([
          [0, 1],
          ["0", "1"],
        ]),
      },
    });
    mockContract.deployPool = stub().resolves({
      wait: () => Promise.resolve(mockReceipt),
    });

    const mockSigner = createStubInstance(Signer);
    (mockSigner as any).getAddress = () => Promise.resolve(mkAddress("0xabcd"));

    const mockProvider = createStubInstance(providers.Web3Provider);
    (mockProvider as any)._isProvider = true;
    (mockProvider as any)._isSigner = false;
    (mockProvider as any).getSigner = () => mockSigner;
    (mockProvider as any).getCode = (address: string) => address;
    (mockProvider as any).estimateGas = stub().returns(BigNumber.from(3));
    ganache.chainDeployments = {
      FeeDistributor: { abi: [], address: mkAddress("0xfcc") },
      IonicFlywheelLensRouter: { abi: [], address: mkAddress("0xabcdef") },
      PoolDirectory: { abi: [], address: mkAddress("0xacc") },
      PoolLens: { abi: [], address: mkAddress("0xbcc") },
      PoolLensSecondary: { abi: [], address: mkAddress("0xdcc") },
      IonicLiquidator: { abi: [], address: mkAddress("0xecc") },
      JumpRateModel: { abi: [], address: mkAddress("0xaac") },
    };
    fuseBase = new IonicBase(mockProvider, ganache);
    fuseBase.contracts = { PoolDirectory: mockContract as unknown as PoolDirectory };
  });
  afterEach(function () {
    restore();
  });
  describe("#deployPool", () => {
    let getPoolAddressStub: SinonStub<
      [
        from: string,
        poolName: string,
        blockNumber: number,
        fuseFeeDistributorAddress: string,
        fusePoolDirectoryAddress: string
      ],
      string
    >;
    let getPoolUnitrollerStub: SinonStub<[poolAddress: string, signer?: Signer], Unitroller>;
    let getPoolComptrollerStub: SinonStub<[poolAddress: string, signer?: Signer], Comptroller>;
    let mockUnitroller: SinonStubbedInstance<Contract>;
    let mockComptroller: SinonStubbedInstance<Contract>;
    beforeEach(() => {
      getPoolAddressStub = stub(utilsFns, "getPoolAddress").returns(mkAddress("0xbeef"));

      mockUnitroller = createStubInstance(Contract);
      mockUnitroller._acceptAdmin = stub().resolves({ wait: () => Promise.resolve(mockReceipt) });
      getPoolUnitrollerStub = stub(utilsFns, "getPoolUnitroller").returns(mockUnitroller as unknown as Unitroller);

      mockComptroller = createStubInstance(Contract);
      mockComptroller._setWhitelistStatuses = stub().resolves({ wait: () => Promise.resolve(mockReceipt) });
      getPoolComptrollerStub = stub(utilsFns, "getPoolComptroller").returns(mockComptroller as unknown as Comptroller);
    });
    afterEach(function () {
      restore();
    });
    it("should deploy a pool when comptroller is already deployed and enforce whitelist is false", async () => {
      fuseBase.chainDeployment.Comptroller = { abi: [], address: mkAddress("0xccc") };
      await fuseBase.deployPool("Test", false, constants.One, constants.One, mkAddress("0xa"), [mkAddress("0xbbb")]);
      expect(mockContract.deployPool).to.be.calledOnceWithExactly(
        "Test",
        mkAddress("0xccc"),
        new utils.AbiCoder().encode(["address"], [mkAddress("0xfcc")]),
        false,
        constants.One,
        constants.One,
        mkAddress("0xa")
      );

      expect(getPoolAddressStub).to.be.calledOnceWithExactly(
        mkAddress("0xabcd"),
        "Test",
        2,
        mkAddress("0xfcc"),
        mkAddress("0xacc")
      );

      expect(mockUnitroller._acceptAdmin).to.be.calledOnceWithExactly();

      expect(getPoolComptrollerStub).callCount(0);
    });

    it("should deploy a pool when comptroller is already deployed and enforce whitelist is true", async () => {
      fuseBase.chainDeployment.Comptroller = { abi: [], address: mkAddress("0xccc") };
      await fuseBase.deployPool("Test", true, constants.One, constants.One, mkAddress("0xa"), [mkAddress("0xbbb")]);

      expect(mockContract.deployPool).to.be.calledOnceWithExactly(
        "Test",
        mkAddress("0xccc"),
        new utils.AbiCoder().encode(["address"], [mkAddress("0xfcc")]),
        true,
        constants.One,
        constants.One,
        mkAddress("0xa")
      );
      expect(getPoolUnitrollerStub).be.calledOnce;
      expect(getPoolComptrollerStub).be.calledOnce;
    });

    it("should deploy a pool when comptroller is not deployed", async () => {
      fuseBase.chainDeployment.Comptroller = { abi: [], address: mkAddress("0xccc") };
      await fuseBase.deployPool("Test", false, constants.One, constants.One, mkAddress("0xa"), [mkAddress("0xbbb")]);
      expect(mockContract.deployPool).to.be.calledOnceWithExactly(
        "Test",
        mkAddress("0xccc"),
        new utils.AbiCoder().encode(["address"], [mkAddress("0xfcc")]),
        false,
        constants.One,
        constants.One,
        mkAddress("0xa")
      );
    });
  });

  describe("#identifyInterestRateModel", () => {
    let model;
    let interestRateModelAddress;

    it("should throw error when model address hash mismatches", async () => {
      interestRateModelAddress = mkAddress("0xabc");
      await expect(fuseBase.identifyInterestRateModel(interestRateModelAddress)).to.be.rejectedWith(Error);
    });

    it("should return new IRM when model address hash matches", async () => {
      interestRateModelAddress = JumpRateModelArtifact.deployedBytecode.object;
      model = await fuseBase.identifyInterestRateModel(interestRateModelAddress);
      expect(model).not.to.be.null;
    });
  });

  describe("#getInterestRateModel", () => {
    let model;
    let getAssetContractStub: SinonStub;
    let mockAssetContract: SinonStubbedInstance<Contract>;

    beforeEach(() => {
      mockAssetContract = createStubInstance(Contract);
    });

    it("should be rejected with Error when interestRateModel is null", async () => {
      Object.defineProperty(mockAssetContract, "callStatic", {
        value: {
          interestRateModel: () => Promise.resolve(mkAddress("0xabc")),
        },
      });
      getAssetContractStub = stub(utilsFns, "getContract").returns(mockAssetContract);
      model = fuseBase.getInterestRateModel(mkAddress("0xabc"));
      await expect(model).to.be.rejectedWith(Error);
      expect(getAssetContractStub).to.be.calledOnce;
    });

    it("should init interest Rate Model when model is not null ", async () => {
      const initStub = stub(JumpRateModel.prototype, "init");
      const interestRateModelAddress = JumpRateModelArtifact.deployedBytecode.object;
      Object.defineProperty(mockAssetContract, "callStatic", {
        value: {
          interestRateModel: () => Promise.resolve(interestRateModelAddress),
        },
      });
      getAssetContractStub = stub(utilsFns, "getContract").returns(mockAssetContract);
      model = await fuseBase.getInterestRateModel(mkAddress("0xabc"));
      expect(initStub).to.be.calledOnce;
      expect(getAssetContractStub).to.be.calledOnce;
      expect(model).not.to.be.null;
    });
  });

  describe("#getPriceOracle", () => {
    let name: string;

    it("should return text when oracle is not found", async () => {
      name = await fuseBase.getPriceOracle(mkAddress("0xabc"));
      expect(name).to.equal("Unrecognized Oracle");
    });
  });
});
