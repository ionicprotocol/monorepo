import { ganache } from "@midas-capital/chains";
import axios from "axios";
import { BigNumber, Contract, providers, Signer } from "ethers";
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from "sinon";

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

  describe("approve", async () => {
    it("allow Midas to use tokens", async () => {
      const mockTokenContract: SinonStubbedInstance<Contract> = createStubInstance(Contract);
      const maxApproveStub = stub().resolves("txId");

      mockTokenContract.approve = maxApproveStub;

      stub(utilsFns, "getContract").onFirstCall().returns(mockTokenContract);

      const tx = await fundOperations.approve(mkAddress("0xabc"), mkAddress("0xeee"));

      expect(maxApproveStub).to.be.calledOnce;
      expect(tx).to.be.eq("txId");
    });
  });

  describe("enterMarkets", async () => {
    it("allows supplied assets to be used as collateral", async () => {
      const mockComptrollerContract: SinonStubbedInstance<Contract> = createStubInstance(Contract);
      const enterMarketStub = stub().resolves("txId");

      mockComptrollerContract.enterMarkets = enterMarketStub;

      stub(utilsFns, "getContract").onFirstCall().returns(mockComptrollerContract);

      const tx = await fundOperations.enterMarkets(mkAddress("0xabc"), mkAddress("0xeee"));

      expect(enterMarketStub).to.be.calledOnce;
      expect(tx).to.be.eq("txId");
    });
  });

  describe("mint", async () => {
    let mockcTokenContract: SinonStubbedInstance<Contract>;
    let mintResponse = 0;

    beforeEach(() => {
      mockcTokenContract = createStubInstance(Contract);
      mockcTokenContract.mint = stub().resolves("txId");
    });

    it("Mint success", async () => {
      Object.defineProperty(mockcTokenContract, "estimateGas", {
        value: {
          mint: stub().resolves(BigNumber.from(mintResponse)),
        },
      });

      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          mint: stub().resolves(BigNumber.from(mintResponse)),
        },
      });

      stub(utilsFns, "getContract").onFirstCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.mint(mkAddress("0xabc"), BigNumber.from(3));

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("Mint fail", async () => {
      mintResponse = 2;
      Object.defineProperty(mockcTokenContract, "estimateGas", {
        value: {
          mint: stub().resolves(BigNumber.from(mintResponse)),
        },
      });

      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          mint: stub().resolves(BigNumber.from(mintResponse)),
        },
      });

      stub(utilsFns, "getContract").onFirstCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.mint(mkAddress("0xabc"), BigNumber.from(5));

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

    it("Repaying max", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          repayBorrow: stub().resolves(BigNumber.from(0)),
        },
      });

      stub(utilsFns, "getContract").onFirstCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.repay(mkAddress("0xabc"), true, BigNumber.from(3));

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("Not repaying max", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          repayBorrow: stub().resolves(BigNumber.from(0)),
        },
      });

      stub(utilsFns, "getContract").onFirstCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.repay(mkAddress("0xabc"), false, BigNumber.from(3));

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("repay fail", async () => {
      Object.defineProperty(mockcTokenContract, "callStatic", {
        value: {
          repayBorrow: stub().resolves(BigNumber.from(2)),
        },
      });

      stub(utilsFns, "getContract").onFirstCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.repay(mkAddress("0xabc"), false, BigNumber.from(5));

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
      Object.defineProperty(mockcTokenContract, "estimateGas", {
        value: {
          borrow: stub().resolves(BigNumber.from(0)),
        },
      });
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
      Object.defineProperty(mockcTokenContract, "estimateGas", {
        value: {
          borrow: stub().resolves(BigNumber.from(2)),
        },
      });
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
