import axios from "axios";
import { describe } from "mocha";
import { SinonStub, stub } from "sinon";
import { Address, Hex, PublicClient, WalletClient } from "viem";

import { IonicSdk } from "../../src/IonicSdk/index";
import * as utilsFns from "../../src/IonicSdk/utils";
import * as FundOperationsModule from "../../src/modules/FundOperations";
import { expect } from "../globalTestHook";
import { mkAddress, mockChainConfig, stubbedContract, stubbedPublicClient, stubbedWalletClient } from "../helpers";

describe("FundOperation", () => {
  const FundOperations = FundOperationsModule.withFundOperations(IonicSdk);
  let fundOperations: InstanceType<typeof FundOperations>;
  let axiosStub: SinonStub;
  let mockPublicClient: PublicClient;
  let mockWalletClient: WalletClient;

  beforeEach(() => {
    mockWalletClient = stubbedWalletClient;
    mockPublicClient = stubbedPublicClient;

    mockPublicClient.getCode = ({ address }: { address: Address }) => Promise.resolve(address as Hex);
    mockPublicClient.estimateGas = stub().returns(3n);

    fundOperations = new FundOperations(mockPublicClient, mockWalletClient, mockChainConfig);
  });

  describe("fetchGasForCall", () => {
    it("calculate correct gas fee", async () => {
      const gasPriceAvg = 5n;
      axiosStub = stub(axios, "get").resolves({ data: { average: gasPriceAvg } });

      const { gasWEI, gasPrice, estimatedGas } = await fundOperations.fetchGasForCall(1n, mkAddress("0x123"));

      expect(axiosStub).be.calledOnce;
      expect(estimatedGas).to.be.equal(9n);
      expect(gasPrice).to.be.equal(gasPriceAvg * 1000000000n);
      expect(gasWEI).to.be.equal(9n * gasPriceAvg * 1000000000n);
    });
  });

  describe("approve", async () => {
    it("allow Ionic to use tokens", async () => {
      const mockTokenContract: any = stubbedContract;
      const maxApproveStub = stub().resolves("txId");

      mockTokenContract.write.approve = maxApproveStub;

      stub(utilsFns, "getContract").onFirstCall().returns(mockTokenContract);

      const tx = await fundOperations.approve(mkAddress("0xabc"), mkAddress("0xeee"));

      expect(maxApproveStub).to.be.calledOnce;
      expect(tx).to.be.eq("txId");
    });
  });

  describe("enterMarkets", async () => {
    it("allows supplied assets to be used as collateral", async () => {
      const mockComptrollerContract: any = stubbedContract;
      const enterMarketStub = stub().resolves("txId");

      mockComptrollerContract.write.enterMarkets = enterMarketStub;

      stub(utilsFns, "getContract").onFirstCall().returns(mockComptrollerContract);

      const tx = await fundOperations.enterMarkets(mkAddress("0xabc"), mkAddress("0xeee"));

      expect(enterMarketStub).to.be.calledOnce;
      expect(tx).to.be.eq("txId");
    });
  });

  describe("mint", async () => {
    const mockcTokenContract: any = stubbedContract;

    let mintResponse = 0n;

    beforeEach(() => {
      mockcTokenContract.write.mint = stub().resolves("txId");
    });

    it("Mint success", async () => {
      mockcTokenContract.estimateGas.mint = stub().resolves(mintResponse);

      mockcTokenContract.simulate.mint = stub().resolves({ result: mintResponse });

      stub(utilsFns, "getContract").onFirstCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.mint(mkAddress("0xabc"), 3n);

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("Mint fail", async () => {
      mintResponse = 2n;
      mockcTokenContract.estimateGas.mint = stub().resolves(mintResponse);

      mockcTokenContract.simulate.mint = stub().resolves({ result: mintResponse });

      stub(utilsFns, "getContract").onFirstCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.mint(mkAddress("0xabc"), 5n);

      expect(tx).to.be.undefined;
      expect(errorCode).to.be.eq(2);
    });
  });

  describe("repay", async () => {
    let mockTokenContract;
    let mockcTokenContract;
    const maxApproveStub = stub().resolves();

    beforeEach(() => {
      mockTokenContract = { ...stubbedContract };
      mockTokenContract.write.approve = maxApproveStub;
      mockTokenContract.read.allowance = stub().resolves(4n);

      mockcTokenContract = { ...stubbedContract };
      mockcTokenContract.write.repayBorrow = stub().resolves("txId");
    });

    it("Repaying max", async () => {
      mockcTokenContract.simulate.repayBorrow = stub().resolves({ result: 0n });

      stub(utilsFns, "getContract").onFirstCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.repay(mkAddress("0xabc"), true, 3n);

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("Not repaying max", async () => {
      mockcTokenContract.simulate.repayBorrow = stub().resolves({ result: 0n });

      stub(utilsFns, "getContract").onFirstCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.repay(mkAddress("0xabc"), false, 3n);

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("repay fail", async () => {
      mockcTokenContract.simulate.repayBorrow = stub().resolves({ result: 2n });

      stub(utilsFns, "getContract").onFirstCall().returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.repay(mkAddress("0xabc"), false, 5n);

      expect(tx).to.be.undefined;
      expect(errorCode).to.be.eq(2);
    });
  });

  describe("borrow", async () => {
    let mockcTokenContract;

    beforeEach(() => {
      mockcTokenContract = { ...stubbedContract };
      mockcTokenContract.write.borrow = stub().resolves("txId");
    });

    it("success", async () => {
      mockcTokenContract.estimateGas.borrow = stub().resolves(0n);
      mockcTokenContract.simulate.borrow = stub().resolves({ result: 0n });

      stub(utilsFns, "getContract").returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.borrow(mkAddress("0xabc"), 3n);

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("fail", async () => {
      mockcTokenContract.estimateGas.borrow = stub().resolves(2n);
      mockcTokenContract.simulate.borrow = stub().resolves({ result: 2n });

      stub(utilsFns, "getContract").returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.borrow(mkAddress("0xabc"), 5n);

      expect(tx).to.be.undefined;
      expect(errorCode).to.be.eq(2);
    });
  });

  describe("withdraw", async () => {
    let mockcTokenContract;

    beforeEach(() => {
      mockcTokenContract = stubbedContract;
      mockcTokenContract.write.redeemUnderlying = stub().resolves("txId");
    });

    it("success", async () => {
      mockcTokenContract.simulate.redeemUnderlying = stub().resolves({ result: 0n });

      stub(utilsFns, "getContract").returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.withdraw(mkAddress("0xabc"), 3n);

      expect(tx).to.be.eq("txId");
      expect(errorCode).to.be.null;
    });

    it("fail", async () => {
      mockcTokenContract.simulate.redeemUnderlying = stub().resolves({ result: 2n });

      stub(utilsFns, "getContract").returns(mockcTokenContract);

      const { tx, errorCode } = await fundOperations.withdraw(mkAddress("0xabc"), 5n);

      expect(tx).to.be.undefined;
      expect(errorCode).to.be.eq(2);
    });
  });
});
