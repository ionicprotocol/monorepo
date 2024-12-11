// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract ClaimEmissions is veIONTest {
  address alice;
  address bob;
  LockInfo lockInfoAlice;
  LockInfo lockInfoBob;

  function afterForkSetUp() internal override {
    _afterForkSetUpMode();
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

  function test_claimEmissions_UserCanClaimEmissionsFromUnderlyingStake() public forkAtBlock(MODE_MAINNET, 16559826) {
    vm.warp(block.timestamp + 1 weeks);
    uint256 reward = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    vm.prank(alice);
    ve.claimEmissions(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);

    assertTrue(reward > 0, "Reward should be greater than zero after 1 week");
  }

  function test_claimEmissions_NoEmissionsToClaim() public forkAtBlock(MODE_MAINNET, 16559826) {
    vm.warp(block.timestamp + 1 weeks);

    vm.prank(bob);
    vm.expectRevert(abi.encodeWithSignature("NoUnderlyingStake()"));
    ve.claimEmissions(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
  }

  function test_claimEmissions_WithdrawThenClaim() public forkAtBlock(MODE_MAINNET, 16559826) {
    vm.startPrank(alice);
    ve.withdraw(lockInfoAlice.lpType, lockInfoAlice.tokenId);
    ve.claimEmissions(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
    vm.stopPrank();
  }
}
