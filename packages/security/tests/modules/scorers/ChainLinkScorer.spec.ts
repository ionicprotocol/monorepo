import { SupportedChains } from "@ionicprotocol/types";

import { SecurityBase } from "../../../src/index";
import * as OraclesModule from "../../../src/oracle";

describe("Oracle", () => {
  // const Oracle = OraclesModule.withChainLinkOracleScorer(SecurityBase);
  // let oracleBsc: InstanceType<typeof Oracle>;
  // let oraclePolygon: InstanceType<typeof Oracle>;
  // beforeEach(() => {
  //   oracleBsc = new Oracle(SupportedChains.bsc, null);
  //   oraclePolygon = new Oracle(SupportedChains.polygon, null);
  // });
  // describe("getOracleRating", () => {
  //   it("should fetch oracle rating for bsc", async () => {
  //     const ratings = await oracleBsc.getChainLinkOracleRating();
  //     console.log(ratings);
  //   });
  //   it("should fetch oracle rating for polygon", async () => {
  //     const ratings = await oraclePolygon.getChainLinkOracleRating();
  //     console.log(ratings);
  //   });
  // });
  // describe("supply", async () => {
  //   let mockTokenContract: SinonStubbedInstance<Contract>;
  //   let mockComptrollerContract: SinonStubbedInstance<Contract>;
  //   let mockcTokenContract: SinonStubbedInstance<Contract>;
  //   const enterMarketStub = stub().resolves();
  //   const maxApproveStub = stub().resolves();
  //   beforeEach(() => {
  //     mockTokenContract = createStubInstance(Contract);
  //     mockTokenContract.approve = stub().resolves({ wait: maxApproveStub });
  //     Object.defineProperty(mockTokenContract, "callStatic", {
  //       value: {
  //         allowance: stub().resolves(BigNumber.from(4)),
  //       },
  //     });
  //     mockComptrollerContract = createStubInstance(Contract);
  //     mockComptrollerContract.enterMarkets = enterMarketStub;
  //     mockcTokenContract = createStubInstance(Contract);
  //     mockcTokenContract.mint = stub().resolves("txId");
  //   });
  // });
});
