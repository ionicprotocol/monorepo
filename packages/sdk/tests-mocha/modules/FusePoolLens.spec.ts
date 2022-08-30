import { ganache } from "@midas-capital/chains";
import { expect } from "chai";
import { BigNumber, Contract, providers } from "ethers";
import { createStubInstance, SinonStubbedInstance, stub } from "sinon";

import { MidasBaseConstructor } from "../../src";
import { MidasBase } from "../../src/MidasSdk/index";
import { withFusePoolLens } from "../../src/modules/FusePoolLens";
import { mkAddress } from "../helpers";

describe("FusePoolLens", () => {
  let FusePoolLens: MidasBaseConstructor;
  let fusePoolLens: any;
  let mockContract: SinonStubbedInstance<Contract>;
  const totalLockedData = {
    2: [
      { totalSupply: BigNumber.from(1) },
      { totalSupply: BigNumber.from(1) },
      { totalSupply: BigNumber.from(1) },
      { totalSupply: BigNumber.from(1) },
    ],
  };

  beforeEach(() => {
    const mockProvider = createStubInstance(providers.Web3Provider);
    (mockProvider as any)._isProvider = true;
    (mockProvider as any)._isSigner = true;
    (mockProvider as any).getSigner = () => mkAddress("0xabcd");
    mockContract = createStubInstance(Contract);

    FusePoolLens = withFusePoolLens(MidasBase);
    fusePoolLens = new FusePoolLens(mockProvider, ganache, {
      FusePoolDirectory: { abi: [], address: mkAddress("0xacc") },
      FusePoolLens: { abi: [], address: mkAddress("0xbcc") },
      FusePoolLensSecondary: { abi: [], address: mkAddress("0xdcc") },
      FuseSafeLiquidator: { abi: [], address: mkAddress("0xecc") },
      FuseFeeDistributor: { abi: [], address: mkAddress("0xfcc") },
      JumpRateModel: { abi: [], address: mkAddress("0xaac") },
      WhitePaperInterestRateModel: { abi: [], address: mkAddress("0xabc") },
    });

    Object.defineProperty(mockContract, "callStatic", {
      value: {
        getPublicPoolsByVerificationWithData: stub().resolves(totalLockedData),
      },
    });
    fusePoolLens.contracts.FusePoolLens = mockContract;
  });

  it("getTotalValueLocked", async () => {
    const total = await fusePoolLens.getTotalValueLocked(true);
    expect(total.toNumber()).to.be.equal(4);
  });
});
