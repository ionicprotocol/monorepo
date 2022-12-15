import { ganache } from "@midas-capital/chains";
import axios from "axios";
import { BigNumber, Contract, providers, Signer } from "ethers";
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from "sinon";

import { MidasBaseConstructor } from "../../src";
import { MidasBase } from "../../src/MidasSdk/index";
import * as utilsFns from "../../src/MidasSdk/utils";
import * as FundOperationsModule from "../../src/modules/FundOperations";
import { expect } from "../globalTestHook";
import { mkAddress } from "../helpers";

describe("FundOperation", () => {
  const FundOperations = FundOperationsModule.withFundOperations(MidasBase);
  let fundOperations: InstanceType<typeof FundOperations>;
  let axiosStub: SinonStub;

  beforeEach(() => {
    const mockSigner = createStubInstance(Signer);
    (mockSigner as any).getAddress = () => Promise.resolve(mkAddress("0xabcd"));

    const mockProvider = createStubInstance(providers.Web3Provider);
    (mockProvider as any)._isProvider = true;
    (mockProvider as any)._isSigner = false;
    (mockProvider as any).getSigner = () => mockSigner;
    (mockProvider as any).getCode = (address: string) => address;
    (mockProvider as any).estimateGas = stub().returns(BigNumber.from(3));
    (mockProvider as any).provider = mockProvider;

    fundOperations = new FundOperations(mockProvider, ganache);
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
      mockTokenContract.approve = maxApproveStub;

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

      Object.defineProperty(mockcTokenContract, "estimateGas", {
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
        BigNumber.from(3)
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

      Object.defineProperty(mockcTokenContract, "estimateGas", {
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
        BigNumber.from(3)
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

      Object.defineProperty(mockcTokenContract, "estimateGas", {
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
        BigNumber.from(5)
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

      Object.defineProperty(mockcTokenContract, "estimateGas", {
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
        BigNumber.from(5)
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
      mockTokenContract.approve = maxApproveStub;

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
        BigNumber.from(3)
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
        BigNumber.from(3)
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
        BigNumber.from(5)
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
        BigNumber.from(5)
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

      const { tx, errorCode } = await fundOperations.borrow(mkAddress("0xabc"), BigNumber.from(3));

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

      const { tx, errorCode } = await fundOperations.borrow(mkAddress("0xabc"), BigNumber.from(5));

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

      const { tx, errorCode } = await fundOperations.withdraw(mkAddress("0xabc"), BigNumber.from(3));

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

      const { tx, errorCode } = await fundOperations.withdraw(mkAddress("0xabc"), BigNumber.from(5));

      expect(tx).to.be.undefined;
      expect(errorCode).to.be.eq(2);
    });
  });
});
