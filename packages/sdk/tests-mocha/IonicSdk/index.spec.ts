import { InterestRateModel } from "@ionicprotocol/types";
import { describe } from "mocha";
import { restore, SinonStub, stub } from "sinon";
import {
  Address,
  encodeAbiParameters,
  GetContractReturnType,
  parseAbiParameters,
  PublicClient,
  WalletClient
} from "viem";

import JumpRateModelArtifact from "../../artifacts/JumpRateModel.sol/JumpRateModel.json";
import { ionicComptrollerAbi, poolDirectoryAbi, unitrollerAbi } from "../../src/generated";
import { IonicBase } from "../../src/IonicSdk/index";
import JumpRateModel from "../../src/IonicSdk/irm/JumpRateModel";
import * as utilsFns from "../../src/IonicSdk/utils";
import { expect } from "../globalTestHook";
import {
  mkAddress,
  mkBytes32,
  mockChainConfig,
  mockReceipt,
  stubbedContract,
  stubbedPublicClient,
  stubbedWalletClient
} from "../helpers";

describe("Ionic Index", () => {
  let ionicBase: IonicBase;
  let mockPublicClient: PublicClient;

  beforeEach(() => {
    const mockPoolDirectory = stubbedContract as unknown as GetContractReturnType<
      typeof poolDirectoryAbi,
      PublicClient
    >;
    mockPoolDirectory.read = {
      getActivePools: stub().resolves([
        [0, 1],
        ["0", "1"]
      ])
    } as any;
    mockPoolDirectory.write = {
      deployPool: stub().resolves(mkBytes32("0xabc"))
    } as any;
    mockPoolDirectory.getEvents = {
      PoolRegistered: stub().resolves([{ args: { index: 1n } }])
    } as any;

    const mockWalletClient = stubbedWalletClient as WalletClient;

    mockPublicClient = stubbedPublicClient as PublicClient;
    mockPublicClient.estimateGas = stub().resolves(3n);
    mockPublicClient.waitForTransactionReceipt = stub().resolves(mockReceipt);
    ionicBase = new IonicBase(mockPublicClient as PublicClient, mockWalletClient as WalletClient, mockChainConfig);
    ionicBase.contracts = {
      PoolDirectory: mockPoolDirectory
    };
  });
  afterEach(function () {
    restore();
  });
  describe("#deployPool", () => {
    let getPoolAddressStub: SinonStub<
      [
        from: Address,
        poolName: string,
        blockNumber: bigint,
        feeDistributorAddress: Address,
        poolDirectoryAddress: Address
      ],
      Address
    >;
    let getPoolUnitrollerStub: SinonStub;
    let getPoolComptrollerStub: SinonStub;
    let mockUnitroller: GetContractReturnType<typeof unitrollerAbi, PublicClient>;
    let mockComptroller: GetContractReturnType<typeof ionicComptrollerAbi, PublicClient>;
    beforeEach(() => {
      getPoolAddressStub = stub(utilsFns, "getPoolAddress").returns(mkAddress("0xbeef"));

      mockUnitroller = stubbedContract as any;
      mockUnitroller.write._acceptAdmin = stub().resolves({ wait: () => Promise.resolve(mkBytes32()) });
      getPoolUnitrollerStub = stub(utilsFns, "getPoolUnitroller").returns(
        mockUnitroller as unknown as GetContractReturnType<typeof unitrollerAbi, PublicClient>
      );

      mockComptroller = stubbedContract as any;
      mockComptroller.write._setWhitelistStatuses = stub().resolves({ wait: () => Promise.resolve(mkBytes32()) });
      getPoolComptrollerStub = stub(utilsFns, "getPoolComptroller").returns(
        mockComptroller as unknown as GetContractReturnType<typeof ionicComptrollerAbi, PublicClient>
      );
    });
    afterEach(function () {
      restore();
    });

    it("should deploy a pool when comptroller is already deployed and enforce whitelist is false", async () => {
      ionicBase.chainDeployment.Comptroller = { abi: [], address: mkAddress("0xccc") };
      await ionicBase.deployPool("Test", false, 1n, 1n, mkAddress("0xa"), [mkAddress("0xbbb")]);
      expect(ionicBase.contracts.PoolDirectory.write.deployPool).to.be.calledOnceWith([
        "Test",
        mkAddress("0xccc"),
        encodeAbiParameters(parseAbiParameters("address"), [mkAddress("0xfcc")]),
        false,
        1n,
        1n,
        mkAddress("0xa")
      ]);

      expect(getPoolAddressStub).to.be.calledOnceWith(
        mkAddress("0xabcd"),
        "Test",
        2n,
        mkAddress("0xfcc"),
        mkAddress("0xacc")
      );

      expect(mockUnitroller.write._acceptAdmin).to.be.calledOnceWith();

      expect(getPoolComptrollerStub).callCount(0);
    });

    it("should deploy a pool when comptroller is already deployed and enforce whitelist is true", async () => {
      ionicBase.chainDeployment.Comptroller = { abi: [], address: mkAddress("0xccc") };
      await ionicBase.deployPool("Test", true, 1n, 1n, mkAddress("0xa"), [mkAddress("0xbbb")]);

      expect(ionicBase.contracts.PoolDirectory.write.deployPool).to.be.calledOnceWith([
        "Test",
        mkAddress("0xccc"),
        encodeAbiParameters(parseAbiParameters("address"), [mkAddress("0xfcc")]),
        true,
        1n,
        1n,
        mkAddress("0xa")
      ]);
      expect(getPoolUnitrollerStub).be.calledOnce;
      expect(getPoolComptrollerStub).be.calledOnce;
    });

    it("should deploy a pool when comptroller is not deployed", async () => {
      ionicBase.chainDeployment.Comptroller = { abi: [], address: mkAddress("0xccc") };
      await ionicBase.deployPool("Test", false, 1n, 1n, mkAddress("0xa"), [mkAddress("0xbbb")]);
      expect(ionicBase.contracts.PoolDirectory.write.deployPool).to.be.calledOnceWith([
        "Test",
        mkAddress("0xccc"),
        encodeAbiParameters(parseAbiParameters("address"), [mkAddress("0xfcc")]),
        false,
        1n,
        1n,
        mkAddress("0xa")
      ]);
    });
  });

  describe("#identifyInterestRateModel", () => {
    let model;
    let interestRateModelAddress;

    it("should throw error when model address hash mismatches", async () => {
      interestRateModelAddress = mkAddress("0xabc");
      await expect(ionicBase.identifyInterestRateModel(interestRateModelAddress)).to.be.rejectedWith(Error);
    });

    it("should return new IRM when model address hash matches", async () => {
      interestRateModelAddress = JumpRateModelArtifact.deployedBytecode.object;
      mockPublicClient.getCode = stub().resolves(JumpRateModelArtifact.deployedBytecode.object);
      model = await ionicBase.identifyInterestRateModel(interestRateModelAddress);
      expect(model).not.to.be.null;
    });
  });

  describe("#getInterestRateModel", () => {
    let model: InterestRateModel | Promise<InterestRateModel>;
    let getAssetContractStub: SinonStub;
    let mockAssetContract;

    beforeEach(() => {
      mockAssetContract = stubbedContract;
    });

    it("should be rejected with Error when interestRateModel is null", async () => {
      mockAssetContract.write.interestRateModel = stub().resolves(mkAddress("0xabc"));
      getAssetContractStub = stub(utilsFns, "getContract").returns(mockAssetContract);
      model = ionicBase.getInterestRateModel(mkAddress("0xabc"));
      await expect(model).to.be.rejectedWith(Error);
      expect(getAssetContractStub).to.be.calledOnce;
    });

    it("should init interest Rate Model when model is not null ", async () => {
      const initStub = stub(JumpRateModel.prototype, "init");
      const interestRateModelAddress = JumpRateModelArtifact.deployedBytecode.object;
      mockAssetContract.read.interestRateModel = stub().resolves(interestRateModelAddress);
      getAssetContractStub = stub(utilsFns, "getContract").returns(mockAssetContract);
      model = await ionicBase.getInterestRateModel(mkAddress("0xabc"));
      expect(initStub).to.be.calledOnce;
      expect(getAssetContractStub).to.be.calledOnce;
      expect(model).not.to.be.null;
    });
  });

  describe("#getPriceOracle", () => {
    let name: string;

    it("should return text when oracle is not found", async () => {
      name = ionicBase.getPriceOracle(mkAddress("0xabc"));
      expect(name).to.equal("Unrecognized Oracle");
    });
  });
});
