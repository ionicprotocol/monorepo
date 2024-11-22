// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";
import "../../harness/veIONHarness.sol";

contract ToggleSplit is veIONTest {
  function setUp() public {
    _setUp();
  }

  function test_toggleSplit_CanToggleSpit() public {
    ve.toggleSplit(address(0), true);
    bool canSplit = ve.s_canSplit(address(0));
    assertTrue(canSplit, "Splitting allowed");
  }
}
