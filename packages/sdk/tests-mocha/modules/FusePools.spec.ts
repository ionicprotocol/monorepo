import { describe } from "mocha";
import { stub } from "sinon";

import { IonicBaseConstructor } from "../../src";
import { IonicBase } from "../../src/IonicSdk/index";
import * as utilsFns from "../../src/IonicSdk/utils";
import { withPools } from "../../src/modules/Pools";
import { expect } from "../globalTestHook";
import { mkAddress, mockChainConfig, stubbedContract, stubbedPublicClient, stubbedWalletClient } from "../helpers";

describe("FusePools", () => {
  let FusePools: IonicBaseConstructor;
  let fusePools: any;

  let mockWalletClient;
  let mockPublicClient;
  let mockFusePoolLensContract;
  let mockPoolDirectoryContract;
  let mockGetAssetContract;
  const CErc20PluginDelegateAddress = mkAddress("0xCErc20PluginDelegate");
  const PluginAddress = mkAddress("0xPlugin");

  const poolSummaryRawData = [1n, 1n, [], [], true];
  const poolSummaryStruct = [
    {
      totalSupply: 1n,
      supplyBalance: 1n,
      totalBorrow: 1n,
      underlyingPrice: 1n,
      borrowBalance: 1n,
      liquidity: 1n,
      underlyingTokens: [],
      underlyingSymbols: [],
      whitelistedAdmin: false
    }
  ];

  beforeEach(() => {
    mockWalletClient = stubbedWalletClient;
    mockPublicClient = stubbedPublicClient;
    mockPublicClient.getCode = (address: string) => address;

    FusePools = withPools(IonicBase as any);

    fusePools = new FusePools(mockPublicClient, mockWalletClient, mockChainConfig);

    mockFusePoolLensContract = { ...stubbedContract };
    mockFusePoolLensContract.simulate = {
      getPoolSummary: stub().resolves({ result: poolSummaryRawData }),
      getPoolAssetsWithData: stub().resolves({ result: poolSummaryStruct }),
      getPoolsByAccountWithData: stub().resolves({ result: [[12]] }),
      getWhitelistedPoolsByAccountWithData: stub().resolves({ result: [[]] })
    };

    mockPoolDirectoryContract = { ...stubbedContract };
    mockPoolDirectoryContract.read.pools = stub().resolves(["R1", mkAddress("0xabd"), "_comptroller", 1n, 2n]);
    mockPoolDirectoryContract.read.getPublicPoolsByVerification = stub().resolves([[12]]);
    mockPoolDirectoryContract.read.getActivePools = stub().resolves([[0], ["0"]]);

    fusePools.contracts = { PoolDirectory: mockPoolDirectoryContract, PoolLens: mockFusePoolLensContract };

    mockGetAssetContract = { ...stubbedContract };
    mockGetAssetContract.read.implementation = stub().resolves(CErc20PluginDelegateAddress);
    mockGetAssetContract.read.plugin = stub().resolves(PluginAddress);

    stub(utilsFns, "getContract").onCall(0).returns(mockGetAssetContract);
  });

  it("fetchPoolData", async () => {
    const res = await fusePools.fetchPoolData("123");
    expect(res.id).to.be.eq(123);
    expect(res.name).to.be.eq("  ");
    expect(res.creator).to.be.eq(mkAddress("0xabd"));
    expect(res.blockPosted).to.be.eq(1n);
    expect(res.timestampPosted).to.be.eq(2n);
  });

  it("fetchPoolsManual", async () => {
    const poolData = await fusePools.fetchPoolsManual();
    expect(poolData[0].id).to.be.eq(0);
  });

  it("fetchPools", async () => {
    const result = await fusePools.fetchPools({
      filter: "created-pools",
      options: {
        from: mkAddress("0xadb")
      }
    });
    expect(result[0].id).to.be.eq(12);
    expect(result[0].creator).to.be.eq(mkAddress("0xabd"));
    expect(result[0].blockPosted).to.be.eq(1n);
    expect(result[0].timestampPosted).to.be.eq(2n);
    expect(result[0].creator).to.be.eq(mkAddress("0xabd"));
  });
});
