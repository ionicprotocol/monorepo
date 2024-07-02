import { expect } from "chai";
import { describe } from "mocha";
import { stub } from "sinon";

import { IonicBaseConstructor } from "../../src";
import { IonicBase } from "../../src/IonicSdk/index";
import { withPoolLens } from "../../src/modules/PoolLens";
import { mockChainConfig, stubbedContract, stubbedPublicClient, stubbedWalletClient } from "../helpers";

describe("PoolLens", () => {
  let PoolLens: IonicBaseConstructor;
  let fusePoolLens: any;
  let mockContract;
  const totalLockedData = {
    2: [
      { totalSupply: 1n, totalBorrow: 1n },
      { totalSupply: 1n, totalBorrow: 1n },
      { totalSupply: 1n, totalBorrow: 1n },
      { totalSupply: 1n, totalBorrow: 1n }
    ]
  };

  beforeEach(() => {
    const mockPublicClient = stubbedPublicClient;
    const mockWalletClient = stubbedWalletClient;
    mockContract = stubbedContract;

    PoolLens = withPoolLens(IonicBase);
    fusePoolLens = new PoolLens(mockPublicClient, mockWalletClient, mockChainConfig);

    mockContract.simulate.getPublicPoolsByVerificationWithData = stub().resolves({ result: totalLockedData });
    fusePoolLens.contracts = { PoolLens: mockContract };
  });

  it("getTotalValueLocked", async () => {
    const total = await fusePoolLens.getTotalValueLocked(true);
    expect(total.totalSupply).to.be.equal(4n);
    expect(total.totalBorrow).to.be.equal(4n);
  });
});
