import { ganache } from "@ionicprotocol/chains";
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
      { totalSupply: BigNumber.from(1), totalBorrow: BigNumber.from(1) },
      { totalSupply: BigNumber.from(1), totalBorrow: BigNumber.from(1) },
      { totalSupply: BigNumber.from(1), totalBorrow: BigNumber.from(1) },
      { totalSupply: BigNumber.from(1), totalBorrow: BigNumber.from(1) },
    ],
  };

  beforeEach(() => {
    const mockProvider = createStubInstance(providers.Web3Provider);
    (mockProvider as any)._isProvider = true;
    (mockProvider as any)._isSigner = true;
    (mockProvider as any).getSigner = () => mkAddress("0xabcd");
    mockContract = createStubInstance(Contract);

    FusePoolLens = withFusePoolLens(MidasBase);
    fusePoolLens = new FusePoolLens(mockProvider, ganache);

    Object.defineProperty(mockContract, "callStatic", {
      value: {
        getPublicPoolsByVerificationWithData: stub().resolves(totalLockedData),
      },
    });
    fusePoolLens.contracts = { FusePoolLens: mockContract };
  });

  it("getTotalValueLocked", async () => {
    const total = await fusePoolLens.getTotalValueLocked(true);
    expect(total.totalSupply.toNumber()).to.be.equal(4);
    expect(total.totalBorrow.toNumber()).to.be.equal(4);
  });
});
