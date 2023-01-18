import { ganache } from "@midas-capital/chains";
import { BigNumber, Contract, providers } from "ethers";
import { createStubInstance, SinonStubbedInstance, stub } from "sinon";

import { MidasBaseConstructor } from "../../src";
import { MidasBase } from "../../src/MidasSdk/index";
import * as utilsFns from "../../src/MidasSdk/utils";
import { withFusePools } from "../../src/modules/FusePools";
import { expect } from "../globalTestHook";
import { mkAddress } from "../helpers";

describe("FusePools", () => {
  let FusePools: MidasBaseConstructor;
  let fusePools: any;

  let mockFusePoolLensContract: SinonStubbedInstance<Contract>;
  let mockFusePoolDirectoryContract: SinonStubbedInstance<Contract>
  let mockGetAssetContract: SinonStubbedInstance<Contract>;
  const CErc20PluginDelegateAddress = mkAddress("0xCErc20PluginDelegate");
  const PluginAddress = mkAddress("0xPlugin");

  const poolSummaryRawData = [BigNumber.from(1), BigNumber.from(1), [], [], true];
  const poolSummaryStruct = [
    {
      totalSupply: BigNumber.from(1),
      supplyBalance: BigNumber.from(1),
      totalBorrow: BigNumber.from(1),
      underlyingPrice: BigNumber.from(1),
      borrowBalance: BigNumber.from(1),
      liquidity: BigNumber.from(1),
      underlyingTokens: [],
      underlyingSymbols: [],
      whitelistedAdmin: false,
    },
  ];

  beforeEach(() => {
    const mockProvider = createStubInstance(providers.Web3Provider);
    (mockProvider as any)._isProvider = true;
    (mockProvider as any)._isSigner = true;
    (mockProvider as any).getSigner = () => mkAddress("0xabcd");
    (mockProvider as any).getCode = (address: string) => address;

    FusePools = withFusePools(MidasBase);

    ganache.chainDeployments = {
      CErc20Delegate: { abi: [], address: mkAddress("0xabc") },
      CErc20PluginDelegate: { abi: [], address: CErc20PluginDelegateAddress },
      CErc20PluginRewardsDelegate: { abi: [], address: mkAddress("0xabc") },
      Comptroller: { abi: [], address: mkAddress("0xabc") },
      FuseFeeDistributor: { abi: [], address: mkAddress("0xfcc") },
      MidasFlywheelLensRouter: { abi: [], address: mkAddress("0xabcdef") },
      FusePoolDirectory: { abi: [], address: mkAddress("0xacc") },
      FusePoolLens: { abi: [], address: mkAddress("0xbcc") },
      FusePoolLensSecondary: { abi: [], address: mkAddress("0xdcc") },
      FuseSafeLiquidator: { abi: [], address: mkAddress("0xecc") },
      JumpRateModel: { abi: [], address: mkAddress("0xaac") },
      WhitePaperInterestRateModel: { abi: [], address: mkAddress("0xabc") },
    };

    fusePools = new FusePools(mockProvider, ganache);

    mockFusePoolLensContract = createStubInstance(Contract);
    Object.defineProperty(mockFusePoolLensContract, "callStatic", {
      value: {
        getPoolSummary: stub().resolves(poolSummaryRawData),
        getPoolAssetsWithData: stub().resolves(poolSummaryStruct),
        getPoolsByAccountWithData: stub().resolves([[12]]),
        getWhitelistedPoolsByAccountWithData: stub().resolves([[]]),
      },
    });

    mockFusePoolDirectoryContract = createStubInstance(Contract);
    Object.defineProperty(mockFusePoolDirectoryContract, "callStatic", {
      value: {
        pools: stub().resolves({
          comptroller: "_comptroller",
          name: "R1",
          creator: mkAddress("0xabd"),
          blockPosted: BigNumber.from(1),
          timestampPosted: BigNumber.from(2),
        }),
        getPublicPoolsByVerification: stub().resolves([[12]]),
        getActivePools: stub().resolves([[0], ["0"]]),
      },
    });

    fusePools.contracts = { FusePoolDirectory: mockFusePoolDirectoryContract, FusePoolLens: mockFusePoolLensContract };

    mockGetAssetContract = createStubInstance(Contract);
    Object.defineProperty(mockGetAssetContract, "callStatic", {
      value: {
        implementation: stub().resolves(CErc20PluginDelegateAddress),
        plugin: stub().resolves(PluginAddress),
      },
    });

    stub(utilsFns, "getContract").onCall(0).returns(mockGetAssetContract);
  });

  it("fetchFusePoolData", async () => {
    const res = await fusePools.fetchFusePoolData("123");
    expect(res.id).to.be.eq(123);
    expect(res.name).to.be.eq("  ");
    expect(res.creator).to.be.eq(mkAddress("0xabd"));
    expect(res.blockPosted.toNumber()).to.be.eq(1);
    expect(res.timestampPosted.toNumber()).to.be.eq(2);
  });

  it("fetchPoolsManual", async () => {
    const poolData = await fusePools.fetchPoolsManual();
    expect(poolData[0].id).to.be.eq(0);
  });

  it("fetchPools", async () => {
    const result = await fusePools.fetchPools({
      filter: "created-pools",
      options: {
        from: mkAddress("0xadb"),
      },
    });
    expect(result[0].id).to.be.eq(12);
    expect(result[0].creator).to.be.eq(mkAddress("0xabd"));
    expect(result[0].blockPosted.toNumber()).to.be.eq(1);
    expect(result[0].timestampPosted.toNumber()).to.be.eq(2);
    expect(result[0].creator).to.be.eq(mkAddress("0xabd"));
  });
});
