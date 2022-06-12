import { constants, Contract, ContractFactory, ContractReceipt, providers, Signer, utils } from "ethers";
import { createStubInstance, restore, SinonStub, SinonStubbedInstance, stub } from "sinon";

import { Comptroller, FusePoolDirectory, Unitroller } from "../../../lib/contracts/typechain";
import { SupportedChains } from "../../../src/enums";
import { FuseBase } from "../../../src/Fuse/index";
import * as utilsFns from "../../../src/Fuse/utils";
import { expect } from "../globalTestHook";
import { mkAddress } from "../helpers";

const mockReceipt: Partial<ContractReceipt> = { status: 1, events: [{ args: [constants.Two] }] as any, blockNumber: 1 };

describe("Fuse Index", () => {
  let fuseBase: FuseBase;
  let mockContract: SinonStubbedInstance<Contract>;
  beforeEach(() => {
    mockContract = createStubInstance(Contract);
    mockContract.connect.returns(mockContract);
    mockContract.deployPool = stub().resolves({
      wait: () => Promise.resolve(mockReceipt),
    });

    const mockProvider = createStubInstance(providers.Web3Provider);
    (mockProvider as any)._isProvider = true;
    (mockProvider as any)._isSigner = true;
    fuseBase = new FuseBase(mockProvider, SupportedChains.ganache, {
      FusePoolDirectory: { abi: [], address: mkAddress("0xacc") },
      FusePoolLens: { abi: [], address: mkAddress("0xbcc") },
      FusePoolLensSecondary: { abi: [], address: mkAddress("0xdcc") },
      FuseSafeLiquidator: { abi: [], address: mkAddress("0xecc") },
      FuseFeeDistributor: { abi: [], address: mkAddress("0xfcc") },
      JumpRateModel: { abi: [], address: mkAddress("0xaac") },
      WhitePaperInterestRateModel: { abi: [], address: mkAddress("0xabc") },
    });
    fuseBase.contracts.FusePoolDirectory = mockContract as unknown as FusePoolDirectory;
  });
  afterEach(function () {
    restore();
  });
  describe("#deployPool", () => {
    let getComptrollerFactoryStub: SinonStub<[signer?: Signer], ContractFactory>;
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
      const mockFactory = createStubInstance(ContractFactory, { deploy: stub().resolves(mockContract) });
      getComptrollerFactoryStub = stub(utilsFns, "getComptrollerFactory");
      getComptrollerFactoryStub.returns(mockFactory);
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
      const result = await fuseBase.deployPool(
        "Test",
        false,
        constants.One,
        constants.One,
        mkAddress("0xa"),
        {},
        { from: mkAddress("0xabc") },
        [mkAddress("0xbbb")]
      );
      console.log("RESULT", result);

      expect(getComptrollerFactoryStub).callCount(0);
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
        mkAddress("0xabc"),
        "Test",
        1,
        mkAddress("0xfcc"),
        mkAddress("0xacc")
      );

      expect(mockUnitroller._acceptAdmin).to.be.calledOnceWithExactly();

      expect(getPoolComptrollerStub).callCount(0);
    });
  });

  it("should deploy a pool when comptroller is already deployed and enforce whitelist is true", async () => {});

  it("should deploy a pool when comptroller is not deployed", async () => {});
});
