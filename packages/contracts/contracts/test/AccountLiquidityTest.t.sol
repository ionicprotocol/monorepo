// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { UpgradesBaseTest } from "./UpgradesBaseTest.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { Unitroller } from "../compound/Unitroller.sol";
import { PoolLensSecondary } from "../PoolLensSecondary.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";

contract AccountLiquidityTest is UpgradesBaseTest {
  IonicComptroller pool = IonicComptroller(0xFB3323E24743Caf4ADD0fDCCFB268565c0685556);
  PoolLensSecondary lens2 = PoolLensSecondary(0x7Ea7BB80F3bBEE9b52e6Ed3775bA06C9C80D4154);

  ICErc20 wethMarket;
  ICErc20 usdcMarket;
  ICErc20 usdtMarket;
  ICErc20 wbtcMarket;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();

    if (block.chainid == MODE_MAINNET) {
      wethMarket = ICErc20(0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2);
      usdcMarket = ICErc20(0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038);
      usdtMarket = ICErc20(0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3);
      wbtcMarket = ICErc20(0xd70254C3baD29504789714A7c69d60Ec1127375C);
    } else {
      ICErc20[] memory markets = pool.getAllMarkets();
      wethMarket = markets[0];
      usdcMarket = markets[1];
    }
  }

  function testModeAccountLiquidity() public debuggingOnly fork(MODE_MAINNET) {
    _testAccountLiquidity(0x0C387030a5D3AcDcde1A8DDaF26df31BbC1CE763);
  }

  function _testAccountLiquidity(address borrower) internal {
    (uint256 error, uint256 collateralValue, uint256 liquidity, uint256 shortfall) = pool.getAccountLiquidity(borrower);

    emit log("");
    emit log_named_address("user", borrower);
    emit log_named_uint("collateralValue", collateralValue);
    if (liquidity > 0) emit log_named_uint("liquidity", liquidity);
    if (shortfall > 0) emit log_named_uint("SHORTFALL", shortfall);
  }

  function testUserMaxWithdraw() public debuggingOnly forkAtBlock(MODE_MAINNET, 5890823) {
    address user = 0xBf891E7eFCC98A8239385D3172bA10AD593c7886;

    Unitroller asUnitroller = Unitroller(payable(address(pool)));
    _upgradePoolWithExtension(asUnitroller);

    {
      _testAccountLiquidity(user);

      uint256 maxRedeem = lens2.getMaxRedeem(user, wethMarket);
      emit log_named_uint("maxRedeem", maxRedeem);

      bool isMember = pool.checkMembership(user, wethMarket);
      emit log(isMember ? "is member" : "NOT A MEMBER");
    }
    //vm.rollFork(5891795);
    // redeemed before liquidation at 5890822

    // before withdraw call at block 5890821
    //  user: 0xBf891E7eFCC98A8239385D3172bA10AD593c7886
    //  collateralValue: 156238264982770748812
    //  liquidity: 16428491404549045373
    //  maxRedeem: 23469273435070064818
    //  is member

    // user calls withdraw with max(uint256) at block 5890822
    //  user: 0xBf891E7eFCC98A8239385D3172bA10AD593c7886
    //  collateralValue: 139809773853485792955
    //  SHORTFALL: 257892668904
    //  maxRedeem: 0
    //  is member

    // liquidated at 5890902
    // https://explorer.mode.network/tx/0x424fd0504e7afb00382c6dcd25a2efdefd96c005c2333112be450fc7bd98cc88
  }
}
