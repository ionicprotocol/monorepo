// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract TrasferVeION is veIONTest {
  address alice;
  address bob;
  address cindy;
  address ralph;
  LockInfo lockInfoAlice;
  LockInfo lockInfoBob;
  LockInfo lockInfoCindy;
  LockInfo lockInfoRalph;

  function afterForkSetUp() internal override {
    _afterForkSetUpMode();
    alice = address(0x8325);
    bob = address(0x2542);
    cindy = address(0x3423);
    ralph = address(0x2524);
    lockInfoAlice = _createLockInternalRealLP(alice, true);
    lockInfoBob = _createLockInternalRealLP(bob, false);
    lockInfoCindy = _createLockInternalRealLP(cindy, true);
    lockInfoRalph = _createLockInternalRealLP(ralph, false);
  }

  function test_transfer_UnderlyingStakeShouldBeTransferredToReceipientWithNoStake() public fork(MODE_MAINNET) {
    uint256 aliceCumulativeValueBefore = ve.s_userCumulativeAssetValues(alice, lockInfoAlice.tokenAddress);
    uint256 bobCumulativeValueBefore = ve.s_userCumulativeAssetValues(bob, lockInfoAlice.tokenAddress);

    address stakingWalletInstanceBefore = veloIonModeStakingStrategy.userStakingWallet(bob);
    assertTrue(stakingWalletInstanceBefore == address(0), "Bob should start off not having a staking wallet");

    vm.prank(alice);
    ve.transferFrom(alice, bob, lockInfoAlice.tokenId);

    stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(bob);

    assertTrue(
      stakingWalletInstance != address(0),
      "Bob should now have a staking wallet after being transferred a token that has a stake"
    );
    assertEq(
      veloIonModeStakingStrategy.balanceOf(stakingWalletInstance),
      REAL_LP_LOCK_AMOUNT,
      "Bob should have the tokens"
    );

    uint256 aliceCumulativeValueAfter = ve.s_userCumulativeAssetValues(alice, lockInfoAlice.tokenAddress);
    uint256 bobCumulativeValueAfter = ve.s_userCumulativeAssetValues(bob, lockInfoAlice.tokenAddress);

    // Assert that Alice's cumulative value has decreased by the lock amount
    assertEq(
      aliceCumulativeValueAfter,
      aliceCumulativeValueBefore - REAL_LP_LOCK_AMOUNT,
      "Alice's cumulative value should decrease by the lock amount"
    );

    // Assert that Bob's cumulative value has increased by the lock amount
    assertEq(
      bobCumulativeValueAfter,
      bobCumulativeValueBefore + REAL_LP_LOCK_AMOUNT,
      "Bob's cumulative value should increase by the lock amount"
    );

    uint256[] memory aliceOwnedTokenIds = ve.getOwnedTokenIds(alice);
    uint256[] memory bobOwnedTokenIds = ve.getOwnedTokenIds(bob);

    // Assert that Alice no longer owns the token
    assertEq(aliceOwnedTokenIds.length, 0, "Alice should not own any tokens after transfer");

    // Assert that Bob now owns the token
    assertEq(bobOwnedTokenIds.length, 2, "Bob should own one token after transfer");
    assertEq(bobOwnedTokenIds[1], lockInfoAlice.tokenId, "Bob should own the transferred token ID");
  }

  function test_transfer_UnderlyingStakeShouldBeTransferredToRecipientWithStake() public fork(MODE_MAINNET) {
    vm.prank(alice);
    ve.transferFrom(alice, cindy, lockInfoAlice.tokenId);

    stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(cindy);

    assertTrue(stakingWalletInstance != address(0), "Cindy should have a staking wallet");
    assertEq(
      veloIonModeStakingStrategy.balanceOf(stakingWalletInstance),
      REAL_LP_LOCK_AMOUNT * 2,
      "Cindy's stake should include hers and what was transferred to it"
    );
  }

  function test_transfer_NoUnderlyingStakeInFrom() public fork(MODE_MAINNET) {
    vm.prank(bob);
    ve.transferFrom(bob, ralph, lockInfoBob.tokenId);

    stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(ralph);

    assertTrue(stakingWalletInstance == address(0), "Ralph should not have a staking wallet instance");
  }
}
