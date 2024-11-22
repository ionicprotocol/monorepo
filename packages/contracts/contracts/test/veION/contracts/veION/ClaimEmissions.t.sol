// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";
import "../../harness/veIONHarness.sol";

contract ClaimEmissions is veIONTest {
  address alice;
  address bob;
  LockInfo lockInfoAlice;
  LockInfo lockInfoBob;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    alice = address(0x8325);
    bob = address(0x2542);
    lockInfoAlice = _createLockInternalRealLP(alice, true);
    lockInfoBob = _createLockInternalRealLP(bob, false);
    stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(alice);
  }

  function setUp() public {
    _setUp();
    emit log("setUp function override is running");
  }

  function test_claimEmissions_UserCanClaimEmissionsFromUnderlyingStake() public fork(MODE_MAINNET) {
    vm.warp(block.timestamp + 1 weeks);
    uint256 reward = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    vm.prank(alice);
    ve.claimEmissions(address(ionMode5050LP));

    assertTrue(reward > 0, "Reward should be greater than zero after 1 week");
  }

  function test_claimEmissions_NoEmissionsToClaim() public fork(MODE_MAINNET) {
    vm.warp(block.timestamp + 1 weeks);

    vm.prank(bob);
    vm.expectRevert(abi.encodeWithSignature("NoUnderlyingStake()"));
    ve.claimEmissions(address(ionMode5050LP));
  }

  function test_claimEmissions_WithdrawThenClaim() public fork(MODE_MAINNET) {
    vm.startPrank(alice);
    ve.withdraw(lockInfoAlice.tokenAddress, lockInfoAlice.tokenId);
    ve.claimEmissions(address(ionMode5050LP));
    vm.stopPrank();
  }
}
