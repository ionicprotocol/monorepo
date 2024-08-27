// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { UniswapTwapPriceOracleV2Factory } from "../../../oracles/default/UniswapTwapPriceOracleV2Factory.sol";
import { UniswapTwapPriceOracleV2Root } from "../../../oracles/default/UniswapTwapPriceOracleV2Root.sol";
import { UniswapTwapPriceOracleV2 } from "../../../oracles/default/UniswapTwapPriceOracleV2.sol";
import { IUniswapV2Factory } from "../../../external/uniswap/IUniswapV2Factory.sol";
import { BaseTest } from "../../config/BaseTest.t.sol";
import { BasePriceOracle } from "../../../oracles/BasePriceOracle.sol";
import { IUniswapV2Pair } from "../../../external/uniswap/IUniswapV2Pair.sol";
import { IUniswapV2Factory } from "../../../external/uniswap/IUniswapV2Factory.sol";

contract TwapOraclesBaseTest is BaseTest {
  IUniswapV2Factory uniswapV2Factory;
  UniswapTwapPriceOracleV2Factory twapPriceOracleFactory;
  MasterPriceOracle mpo;

  function afterForkSetUp() internal override {
    uniswapV2Factory = IUniswapV2Factory(ap.getAddress("IUniswapV2Factory"));
    twapPriceOracleFactory = UniswapTwapPriceOracleV2Factory(ap.getAddress("UniswapTwapPriceOracleV2Factory"));
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
  }

  // BOMB
  function testBombTwapOraclePrice() public fork(BSC_MAINNET) {
    address baseToken = 0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c; // WBTC
    address testedAssetTokenAddress = 0x522348779DCb2911539e76A1042aA922F9C47Ee3; // BOMB

    assertTrue(getTokenTwapPrice(testedAssetTokenAddress, baseToken) > 0);
  }

  function getTokenTwapPrice(address tokenAddress, address baseTokenAddress) internal returns (uint256) {
    address testedPairAddress = uniswapV2Factory.getPair(tokenAddress, baseTokenAddress);

    // trigger a price update
    UniswapTwapPriceOracleV2Root twapOracleRoot = UniswapTwapPriceOracleV2Root(twapPriceOracleFactory.rootOracle());
    address[] memory pairs = new address[](1);
    pairs[0] = testedPairAddress;
    twapOracleRoot.update(pairs);

    // check if the base toke oracle is present in the master price oracle
    if (address(mpo.oracles(tokenAddress)) == address(0)) {
      // deploy or get the base token twap oracle
      address oracleAddress = twapPriceOracleFactory.deploy(address(uniswapV2Factory), baseTokenAddress);
      UniswapTwapPriceOracleV2 oracle = UniswapTwapPriceOracleV2(oracleAddress);
      // add the new twap oracle to the master oracle
      address[] memory underlyings = new address[](1);
      underlyings[0] = tokenAddress;
      BasePriceOracle[] memory oracles = new BasePriceOracle[](1);
      oracles[0] = oracle;
      // impersonate the admin to add the oracle
      vm.prank(mpo.admin());
      mpo.add(underlyings, oracles);
      emit log("added the oracle");
    } else {
      emit log("found the oracle");
    }

    // return the price denominated in W_NATIVE
    return mpo.price(tokenAddress);
  }

  // function testChapelEthBusdOraclePrice() public {
  //   address baseToken = 0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684; // USDT
  //   address testedAssetTokenAddress = 0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7; // BUSD
  //   assertTrue(getTokenTwapPrice(testedAssetTokenAddress, baseToken) > 0);
  // }
}
