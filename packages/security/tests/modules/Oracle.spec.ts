import { SecurityBase } from "../../src";
import * as OraclesModule from "../../src/oracle";

describe("Oracle", () => {
  const Oracle = OraclesModule.withOracle(SecurityBase);
  let oracle: InstanceType<typeof Oracle>;
  beforeEach(() => {
    oracle = new Oracle(56);
  });

  describe("getOracleRating", () => {
    it("should fetch oracle rating", async () => {
      const ratings = await oracle.getOracleRating();
      console.log(ratings);
    });
  });

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
