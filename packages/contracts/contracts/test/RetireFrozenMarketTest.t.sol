// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { UpgradesBaseTest } from "./UpgradesBaseTest.sol";
import { DiamondExtension } from "../ionic/DiamondExtension.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { EIP20Interface } from "../compound/EIP20Interface.sol";
import { CErc20RetireDelegate } from "../compound/CErc20RetireDelegate.sol";

/**
 * @notice Fork test for retiring the frozen `ionmsUSD` market on Base.
 *
 * The market `0x5BE1Cb6CB3C9bfd16Db43ed4f6c081FA9783dd1C` reverts every accruing call with
 * `"!borrowRate"`: its reserves+fees grew to ~= cash+borrows, collapsing the utilization
 * denominator so the IRM returns a per-block rate far above `borrowRateMaxMantissa`. `totalSupply`
 * is 0 (no suppliers). This test proves the retirement sequence works end-to-end against live state:
 * upgrade to `CErc20RetireDelegate` (sweep + zero accounting, no accrual) → unfreeze → unlist.
 *
 * Run with the Base fork:
 *   TEST_RUN_CHAINID=8453 BASE_MAINNET_RPC_URL=... forge test --mc RetireFrozenMarketTest -vvv
 */
contract RetireFrozenMarketTest is UpgradesBaseTest {
  ICErc20 internal constant ionmsUSD = ICErc20(0x5BE1Cb6CB3C9bfd16Db43ed4f6c081FA9783dd1C);

  function testRetireFrozenIonmsUSD() public fork(BASE_MAINNET) {
    address treasury = makeAddr("retireTreasury");
    EIP20Interface underlyingToken = EIP20Interface(ionmsUSD.underlying());
    IonicComptroller pool = ionmsUSD.comptroller();

    // 1. Pre-conditions: abandoned (no suppliers) and frozen on every accruing call.
    assertEq(ionmsUSD.totalSupply(), 0, "expected no suppliers (abandoned market)");
    uint256 cashBefore = underlyingToken.balanceOf(address(ionmsUSD));
    assertGt(cashBefore, 0, "expected underlying cash to sweep");

    vm.expectRevert(bytes("!borrowRate"));
    ionmsUSD.accrueInterest();

    // 2. Deploy the one-shot retire delegate and register its extensions (FeeDistributor owner).
    CErc20RetireDelegate retireImpl = new CErc20RetireDelegate();
    DiamondExtension[] memory exts = new DiamondExtension[](2);
    exts[0] = marketExt; // shared CTokenFirstExtension (deployed in UpgradesBaseTest.afterForkSetUp)
    exts[1] = retireImpl;
    vm.prank(ffd.owner());
    ffd._setCErc20DelegateExtensions(address(retireImpl), exts);

    // 3. Upgrade the market to the retire delegate (pool/ionic admin). Runs _becomeImplementation
    //    WITHOUT accruing: sweeps the underlying to treasury and zeroes the accounting.
    vm.prank(address(ffd));
    ionmsUSD._setImplementationSafe(address(retireImpl), abi.encode(treasury));

    // 4. Post-conditions: funds swept, accounting zeroed, market no longer frozen.
    assertEq(underlyingToken.balanceOf(treasury), cashBefore, "treasury should receive all swept cash");
    assertEq(underlyingToken.balanceOf(address(ionmsUSD)), 0, "market underlying balance should be 0");
    assertEq(ionmsUSD.totalReserves(), 0, "totalReserves should be zeroed");
    assertEq(ionmsUSD.totalAdminFees(), 0, "totalAdminFees should be zeroed");
    assertEq(ionmsUSD.totalIonicFees(), 0, "totalIonicFees should be zeroed");
    assertEq(ionmsUSD.totalBorrows(), 0, "totalBorrows should be written off");
    // accrueInterest must now succeed (no "!borrowRate" revert).
    assertEq(ionmsUSD.accrueInterest(), 0, "accrueInterest should succeed after retirement");

    // 5. Unlist the market from the pool (requires totalSupply == 0, still true).
    vm.prank(pool.admin());
    uint256 err = pool._unsupportMarket(ionmsUSD);
    assertEq(err, 0, "unsupportMarket should succeed");
    assertFalse(_isListed(pool, ionmsUSD), "market should be unlisted");
  }

  function _isListed(IonicComptroller pool, ICErc20 market) internal view returns (bool) {
    ICErc20[] memory all = pool.getAllMarkets();
    for (uint256 i = 0; i < all.length; i++) {
      if (address(all[i]) == address(market)) return true;
    }
    return false;
  }
}
