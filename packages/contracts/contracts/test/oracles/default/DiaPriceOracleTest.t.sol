// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../../config/BaseTest.t.sol";
import { DiaPriceOracle, DIAOracleV2 } from "../../../oracles/default/DiaPriceOracle.sol";
import { SimplePriceOracle } from "../../../oracles/default/SimplePriceOracle.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { BasePriceOracle } from "../../../oracles/BasePriceOracle.sol";

contract MockDiaPriceFeed is DIAOracleV2 {
  struct DiaOracle {
    DIAOracleV2 feed;
    string key;
  }

  uint128 public staticPrice;

  constructor(uint128 _staticPrice) {
    staticPrice = _staticPrice;
  }

  function getValue(string memory key) external view returns (uint128, uint128) {
    return (staticPrice, uint128(block.timestamp));
  }
}

contract DiaPriceOracleTest is BaseTest {
  DiaPriceOracle private oracle;
  MasterPriceOracle masterPriceOracle;

  function testDiaPriceOracleWithMasterPriceOracleBsc() public forkAtBlock(BSC_MAINNET, 20238373) {
    oracle = DiaPriceOracle(0x944e833dC2Af9fc58D5cfA99B9D8666c843Ad58C);

    // miMATIC (MAI)
    uint256 price = oracle.price(0x3F56e0c36d275367b8C502090EDF38289b3dEa0d);
    assertApproxEqAbs(price, 3086017057904017, 1e14);
    masterPriceOracle = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));

    // compare to BUSD, ensure price does not deviate too much
    uint256 priceBusd = masterPriceOracle.price(ap.getAddress("bUSD"));
    assertApproxEqAbs(price, priceBusd, 1e14);
  }

  function setUpWithMasterPriceOracle() internal {
    SimplePriceOracle spo = new SimplePriceOracle();
    spo.initialize();
    spo.setDirectPrice(address(2), 200000000000000000); // 1e36 / 200000000000000000 = 5e18
    MasterPriceOracle mpo = new MasterPriceOracle();
    address[] memory underlyings = new address[](1);
    underlyings[0] = address(2);
    BasePriceOracle[] memory oracles = new BasePriceOracle[](1);
    oracles[0] = spo;
    mpo.initialize(underlyings, oracles, spo, address(this), true, address(0));
    oracle = new DiaPriceOracle(address(this), true, address(0), MockDiaPriceFeed(address(0)), "", mpo, address(2));
  }
}
