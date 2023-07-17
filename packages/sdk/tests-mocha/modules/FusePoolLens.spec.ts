import { ganache } from "@ionicprotocol/chains";
import { expect } from "chai";
import { BigNumber, Contract, providers } from "ethers";
import { createStubInstance, SinonStubbedInstance, stub } from "sinon";

import { IonicBaseConstructor } from "../../src";
import { IonicBase } from "../../src/IonicSdk/index";
import { withPoolLens } from "../../src/modules/PoolLens";
import { mkAddress } from "../helpers";

describe("PoolLens", () => {
  let PoolLens: IonicBaseConstructor;
  let fusePoolLens: any;
  let mockContract: SinonStubbedInstance<Contract>;
  const totalLockedData = {
    2: [
      { totalSupply: BigNumber.from(1), totalBorrow: BigNumber.from(1) },
      { totalSupply: BigNumber.from(1), totalBorrow: BigNumber.from(1) },
      { totalSupply: BigNumber.from(1), totalBorrow: BigNumber.from(1) },
      { totalSupply: BigNumber.from(1), totalBorrow: BigNumber.from(1) }
    ]
  };

  beforeEach(() => {
    const mockProvider = createStubInstance(providers.Web3Provider);
    (mockProvider as any)._isProvider = true;
    (mockProvider as any)._isSigner = true;
    (mockProvider as any).getSigner = () => mkAddress("0xabcd");
    mockContract = createStubInstance(Contract);

    PoolLens = withPoolLens(IonicBase);
    fusePoolLens = new PoolLens(mockProvider, ganache);

    Object.defineProperty(mockContract, "callStatic", {
      value: {
        getPublicPoolsByVerificationWithData: stub().resolves(totalLockedData)
      }
    });
    fusePoolLens.contracts = { PoolLens: mockContract };
  });

  it("getTotalValueLocked", async () => {
    const total = await fusePoolLens.getTotalValueLocked(true);
    expect(total.totalSupply.toNumber()).to.be.equal(4);
    expect(total.totalBorrow.toNumber()).to.be.equal(4);
  });
});
