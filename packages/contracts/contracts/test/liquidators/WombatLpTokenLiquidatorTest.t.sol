// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { BaseTest } from "../config/BaseTest.t.sol";

import { WombatLpTokenLiquidator } from "../../liquidators/WombatLpTokenLiquidator.sol";
import { IWombatLpAsset } from "../../oracles/default/WombatLpTokenPriceOracle.sol";
import { WombatLpTokenPriceOracle } from "../../oracles/default/WombatLpTokenPriceOracle.sol";
import { MasterPriceOracle } from "../../oracles/MasterPriceOracle.sol";

contract WombatLpTokenLiquidatorTest is BaseTest {
  WombatLpTokenLiquidator private wtl;
  WombatLpTokenPriceOracle private oracle;
  MasterPriceOracle private mp;

  function afterForkSetUp() internal override {
    wtl = new WombatLpTokenLiquidator();
    oracle = new WombatLpTokenPriceOracle();
    mp = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
  }

  function testRedeemWBNB() public fork(BSC_MAINNET) {
    address wombatBUSD = 0xF319947eCe3823b790dd87b0A509396fE325745a;
    uint256 assetAmount = 100e18;

    deal(wombatBUSD, address(wtl), assetAmount);

    vm.prank(address(mp));
    uint256 assetPrice = oracle.price(wombatBUSD); // wombatBUSD price
    uint256 underlyingPrice = mp.price(IWombatLpAsset(wombatBUSD).underlyingToken()); // wbnb price

    // amount convertion = assetAmount * underlyingPrice / assetPrice
    uint256 expectedAmount = (assetAmount * underlyingPrice) / assetPrice;

    bytes memory strategyData = abi.encode(
      IWombatLpAsset(wombatBUSD).pool(),
      IWombatLpAsset(wombatBUSD).underlyingToken()
    );
    (, uint256 redeemAmount) = wtl.redeem(IERC20Upgradeable(wombatBUSD), assetAmount, strategyData);

    assertApproxEqAbs(
      expectedAmount,
      redeemAmount,
      uint256(5e17),
      string(abi.encodePacked("!redeemAmount == expectedAmount "))
    );
  }
}
