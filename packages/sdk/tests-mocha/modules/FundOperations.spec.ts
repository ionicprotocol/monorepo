import axios from "axios";
import { BigNumber, Contract, providers } from "ethers";
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from "sinon";

import { SupportedChains } from "../../src/enums";
import { FuseBase } from "../../src/Fuse/index";
import * as utilsFns from "../../src/Fuse/utils";
import * as FundOperationsModule from "../../src/modules/FundOperations";
import { FuseBaseConstructor } from "../../src/types";
import { expect } from "../globalTestHook";
import { mkAddress } from "../helpers";

describe("FundOperation", () => {
  let FundOperations: FuseBaseConstructor;
  let fundOperations: any;
  let axiosStub: SinonStub;

  beforeEach(() => {
    const mockProvider = createStubInstance(providers.Web3Provider);
    (mockProvider as any)._isProvider = true;
    (mockProvider as any)._isSigner = true;
    (mockProvider as any).getSigner = (address: string) => address;
    (mockProvider as any).estimateGas = stub().returns(BigNumber.from(3));

    FundOperations = FundOperationsModule.withFundOperations(FuseBase);
    fundOperations = new FundOperations(mockProvider, SupportedChains.ganache, {
      FusePoolDirectory: { abi: [], address: mkAddress("0xacc") },
      FusePoolLens: { abi: [], address: mkAddress("0xbcc") },
      FusePoolLensSecondary: { abi: [], address: mkAddress("0xdcc") },
      FuseSafeLiquidator: { abi: [], address: mkAddress("0xecc") },
      FuseFeeDistributor: { abi: [], address: mkAddress("0xfcc") },
      JumpRateModel: { abi: [], address: mkAddress("0xaac") },
      WhitePaperInterestRateModel: { abi: [], address: mkAddress("0xabc") },
    });
  });

  describe("fetchGasForCall", () => {
    it("calculate correct gas fee", async () => {
      const gasPriceAvg = 5;
      axiosStub = stub(axios, "get").resolves({ data: { average: gasPriceAvg } });
      const { gasWEI, gasPrice, estimatedGas } = await fundOperations.fetchGasForCall(
        BigNumber.from(1),
        mkAddress("0x123")
      );

      expect(axiosStub).be.calledOnce;
      expect(estimatedGas.toNumber()).to.be.equal(9);
      expect(gasPrice.toNumber()).to.be.equal(gasPriceAvg * 1000000000);
      expect(gasWEI.toNumber()).to.be.equal(9 * gasPriceAvg * 1000000000);
    });
  });

  describe("supply", async () => {
    let mockTokenContract: SinonStubbedInstance<Contract>;
    let mockComptrollerContract: SinonStubbedInstance<Contract>;
    let mockcTokenContract: SinonStubbedInstance<Contract>;
    const enterMarketStub = stub().resolves();
    const maxApproveStub = stub().resolves();
    let mintResponse = 0;

    beforeEach(() => {
      mockTokenContract = createStubInstance(Contract);
      mockTokenContract.approve = stub().resolves({ wait: maxApproveStub });

      Object.defineProperty(mockTokenContract, "callStatic", {
        value: {
          allowance: stub().resolves(BigNumber.from(4)),
        },
      });

      mockComptrollerContract = createStubInstance(Contract);
      mockComptrollerContract.enterMarkets = enterMarketStub;

      mockcTokenContract = createStubInstance(Contract);
      mockcTokenContract.mint = stub().resolves("txId");
    });

    it("Enabled as collateral and has approved enough", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          mint: stub().resolves(BigNumber.from(mintResponse)),
        },
      });

      stub(utilsFns, "getContract")
        .onFirstCall()
        .returns(mockTokenContract)
        .onSecondCall()
        .returns(mockComptrollerContract)
        .onThirdCall()
        .returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.supply(
        mkAddress("0xabc"),
        mkAddress("0xeee"),
        mkAddress("0xdbc"),
        true,
        BigNumber.from(3),
        {
          from: mkAddress("0xd2c"),
        }
      );

      expect(enterMarketStub).to.be.calledOnce;
      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("Not Enabled as collateral and has approved enough", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          mint: stub().resolves(BigNumber.from(mintResponse)),
        },
      });

      stub(utilsFns, "getContract").onFirstCall().returns(mockTokenContract).onSecondCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.supply(
        mkAddress("0xabc"),
        mkAddress("0xeee"),
        mkAddress("0xdbc"),
        false,
        BigNumber.from(3),
        {
          from: mkAddress("0xd2c"),
        }
      );

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("Not has approved enough", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          mint: stub().resolves(BigNumber.from(mintResponse)),
        },
      });

      stub(utilsFns, "getContract").onFirstCall().returns(mockTokenContract).onSecondCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.supply(
        mkAddress("0xabc"),
        mkAddress("0xeee"),
        mkAddress("0xdbc"),
        false,
        BigNumber.from(5),
        {
          from: mkAddress("0xd2c"),
        }
      );

      expect(maxApproveStub).to.be.calledOnce;
      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("Mint fail", async () => {
      mintResponse = 2;
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          mint: stub().resolves(BigNumber.from(mintResponse)),
        },
      });

      stub(utilsFns, "getContract").onFirstCall().returns(mockTokenContract).onSecondCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.supply(
        mkAddress("0xabc"),
        mkAddress("0xeee"),
        mkAddress("0xdbc"),
        false,
        BigNumber.from(5),
        {
          from: mkAddress("0xd2c"),
        }
      );

      expect(tx).to.be.undefined;
      expect(errorCode).to.be.eq(2);
    });
  });

  describe("repay", async () => {
    let mockTokenContract: SinonStubbedInstance<Contract>;
    let mockcTokenContract: SinonStubbedInstance<Contract>;
    const maxApproveStub = stub().resolves();

    beforeEach(() => {
      mockTokenContract = createStubInstance(Contract);
      mockTokenContract.approve = stub().resolves({ wait: maxApproveStub });

      Object.defineProperty(mockTokenContract, "callStatic", {
        value: {
          allowance: stub().resolves(BigNumber.from(4)),
        },
      });

      mockcTokenContract = createStubInstance(Contract);
      mockcTokenContract.repayBorrow = stub().resolves("txId");
    });

    it("Repaying max and has approved enough", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          repayBorrow: stub().resolves(BigNumber.from(0)),
        },
      });

      stub(utilsFns, "getContract").onFirstCall().returns(mockTokenContract).onSecondCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.repay(
        mkAddress("0xabc"),
        mkAddress("0xeee"),
        true,
        BigNumber.from(3),
        {
          from: mkAddress("0xd2c"),
        }
      );

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("Not repaying max and has approved enough", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          repayBorrow: stub().resolves(BigNumber.from(0)),
        },
      });

      stub(utilsFns, "getContract").onFirstCall().returns(mockTokenContract).onSecondCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.repay(
        mkAddress("0xabc"),
        mkAddress("0xeee"),
        false,
        BigNumber.from(3),
        {
          from: mkAddress("0xd2c"),
        }
      );

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("Not has approved enough", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          repayBorrow: stub().resolves(BigNumber.from(0)),
        },
      });

      stub(utilsFns, "getContract").onFirstCall().returns(mockTokenContract).onSecondCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.repay(
        mkAddress("0xabc"),
        mkAddress("0xdbc"),
        false,
        BigNumber.from(5),
        {
          from: mkAddress("0xd2c"),
        }
      );

      expect(maxApproveStub).to.be.calledOnce;
      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("repay fail", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          repayBorrow: stub().resolves(BigNumber.from(2)),
        },
      });

      stub(utilsFns, "getContract").onFirstCall().returns(mockTokenContract).onSecondCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.repay(
        mkAddress("0xabc"),
        mkAddress("0xeee"),
        false,
        BigNumber.from(5),
        {
          from: mkAddress("0xd2c"),
        }
      );

      expect(tx).to.be.undefined;
      expect(errorCode).to.be.eq(2);
    });
  });

  describe("borrow", async () => {
    let mockcTokenContract: SinonStubbedInstance<Contract>;

    beforeEach(() => {
      mockcTokenContract = createStubInstance(Contract);
      mockcTokenContract.borrow = stub().resolves("txId");
    });

    it("success", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          borrow: stub().resolves(BigNumber.from(0)),
        },
      });

      stub(utilsFns, "getContract").returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.borrow(mkAddress("0xabc"), BigNumber.from(3), {
        from: mkAddress("0xd2c"),
      });

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("fail", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          borrow: stub().resolves(BigNumber.from(2)),
        },
      });

      stub(utilsFns, "getContract").returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.borrow(mkAddress("0xabc"), BigNumber.from(5), {
        from: mkAddress("0xd2c"),
      });

      expect(tx).to.be.undefined;
      expect(errorCode).to.be.eq(2);
    });
  });

  describe("withdraw", async () => {
    let mockcTokenContract: SinonStubbedInstance<Contract>;

    beforeEach(() => {
      mockcTokenContract = createStubInstance(Contract);
      mockcTokenContract.redeemUnderlying = stub().resolves("txId");
    });

    it("success", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          redeemUnderlying: stub().resolves(BigNumber.from(0)),
        },
      });

      stub(utilsFns, "getContract").returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.withdraw(mkAddress("0xabc"), BigNumber.from(3), {
        from: mkAddress("0xd2c"),
      });

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("fail", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          redeemUnderlying: stub().resolves(BigNumber.from(2)),
        },
      });

      stub(utilsFns, "getContract").returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.withdraw(mkAddress("0xabc"), BigNumber.from(5), {
        from: mkAddress("0xd2c"),
      });

      expect(tx).to.be.undefined;
      expect(errorCode).to.be.eq(2);
    });
  });
});
