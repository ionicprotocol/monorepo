// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract Withdraw is veIONTest {
  address user;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);
    lockInputMultiLP = _createLockMultipleInternal(user);
    ve.setVoter(address(this));
  }

  function afterForkSetUp() internal override {
    _afterForkSetUpMode();
  }

  function test_withdraw_UserCanWithdrawFinishedLock() public {
    vm.warp(block.timestamp + 52 weeks + 1);

    uint256 supplyBefore = ve.s_supply(ve.s_lpType(lockInput.tokenAddress));
    uint256 cumulativeLPAmountBefore = ve.s_userCumulativeAssetValues(user, address(modeVelodrome5050IonMode));
    vm.prank(user);
    ve.withdraw(address(modeVelodrome5050IonMode), lockInput.tokenId);

    IveION.LockedBalance memory locked = ve.getUserLock(lockInput.tokenId, veloLpType);

    uint256 cumulativeLPAmountAfter = ve.s_userCumulativeAssetValues(user, address(modeVelodrome5050IonMode));
    uint256 userBalanceAfterWithdraw = modeVelodrome5050IonMode.balanceOf(user);
    uint256 userEpoch = ve.s_userPointEpoch(lockInput.tokenId, ve.s_lpType(lockInput.tokenAddress));
    IveION.UserPoint memory userPoint = ve.getUserPoint(
      lockInput.tokenId,
      ve.s_lpType(lockInput.tokenAddress),
      userEpoch
    );
    uint256[] memory ownerTokenIds = ve.getOwnedTokenIds(user);
    address[] memory assetsLocked = ve.getAssetsLocked(lockInput.tokenId);

    assertEq(locked.amount, 0, "Lock amount should be zero after withdrawal");
    assertEq(locked.end, 0, "Lock end time should be zero after withdrawal");
    assertEq(userBalanceAfterWithdraw, lockInput.tokenAmount, "User should receive the locked tokens back");
    assertEq(ve.s_supply(ve.s_lpType(lockInput.tokenAddress)), supplyBefore - lockInput.tokenAmount, "Supply mismatch");
    assertEq(userEpoch, 2, "User epoch mismatch");
    assertEq(userPoint.ts, block.timestamp, "User point timestamp mismatch");
    assertEq(userPoint.blk, block.number, "User point block number mismatch");
    assertEq(userPoint.bias, 0, "User point bias mismatch");
    assertEq(userPoint.slope, 0, "User point slope mismatch");
    assertEq(userPoint.permanent, 0, "User point permanent mismatch");
    assertEq(ve.s_tokenId(), 2, "Token ID mismatch");
    assertEq(ownerTokenIds.length, 1, "Owner should have one token ID");
    assertEq(assetsLocked.length, 0, "Assets locked length mismatch");
    assertEq(
      cumulativeLPAmountBefore - lockInput.tokenAmount,
      cumulativeLPAmountAfter,
      "Cumulative amount should have decreased "
    );
  }

  function test_withdraw_UserCanWithdrawEarly() public {
    address randomWallet = address(0x7890);
    uint256 mintAmount = 100000000000000000 ether; // Mint tokens so that penalty comes into effect
    modeVelodrome5050IonMode.mint(randomWallet, mintAmount);

    vm.warp(block.timestamp + 10 weeks);

    vm.prank(user);
    ve.withdraw(address(modeVelodrome5050IonMode), lockInput.tokenId);

    IveION.LockedBalance memory actualLocked = ve.getUserLock(lockInput.tokenId, veloLpType);

    uint256 userBalanceAfterWithdraw = modeVelodrome5050IonMode.balanceOf(user);
    assertEq(actualLocked.amount, 0, "Lock amount should be zero after withdrawal");
    assertEq(actualLocked.end, 0, "Lock end time should be zero after withdrawal");
    assertEq(
      userBalanceAfterWithdraw,
      (lockInput.tokenAmount * 20) / 100,
      "User should receive 20% of the locked tokens back after withdraw penalty"
    );
  }

  function test_withdraw_UserStakedUnderlying() public fork(MODE_MAINNET) {
    TestVars memory vars;

    address ionMode5050 = 0x690A74d2eC0175a69C0962B309E03021C0b5002E;
    address veloGauge = 0x8EE410cC13948e7e684ebACb36b552e2c2A125fC;

    veloIonModeStakingStrategy = new VeloIonModeStakingStrategy();
    veloIonModeStakingStrategy.initialize(
      address(ve),
      ionMode5050LP,
      veloGauge,
      address(veloStakingWalletImplementation)
    );

    ve.setStakeStrategy(veloLpType, IStakeStrategy(veloIonModeStakingStrategy));

    address[] memory whitelistedTokens = new address[](1);
    bool[] memory isWhitelistedTokens = new bool[](1);
    whitelistedTokens[0] = ionMode5050;
    isWhitelistedTokens[0] = true;

    ve.whitelistTokens(whitelistedTokens, isWhitelistedTokens);
    ve.setLpTokenType(ionMode5050, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
    // Mint ModeVelodrome tokens to the user
    vars.user = address(0x5678);
    vars.amount = 10 ether;

    vm.prank(0x8034857f8A467624BaF973de28026CEB9A2fF5F1);
    IERC20(ionMode5050).transfer(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    IERC20(ionMode5050).approve(address(ve), vars.amount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(ionMode5050);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks;

    vars.stakeUnderlying = new bool[](1);
    vars.stakeUnderlying[0] = true;

    // Create lock
    vm.prank(vars.user);
    uint256 tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, vars.stakeUnderlying);

    // Advance the blockchain by 1 week
    vm.warp(block.timestamp + 1 weeks);

    address stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(vars.user);
    uint256 rewardEarned = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    // Withdraw the tokens
    vm.prank(vars.user);
    ve.withdraw(address(ionMode5050), tokenId);

    uint256 stakingWalletInstanceBalance = IVeloIonModeStaking(veloGauge).balanceOf(stakingWalletInstance);
    uint256 userBalance = IERC20(ionMode5050).balanceOf(vars.user);
    address rewardToken = IVeloIonModeStaking(veloGauge).rewardToken();
    uint256 rewardBalance = IERC20(rewardToken).balanceOf(vars.user);

    assertEq(stakingWalletInstanceBalance, 0, "Staking wallet balance should be zero after withdrawal");
    assertEq(
      userBalance,
      2e18,
      "User's balance should be equal to the initial amount, minus the penalty after withdrawal"
    );
    assertEq(rewardBalance, rewardEarned, "User should have claimed some reward");
  }

  function test_withdraw_RevertIfNotOwner() public {
    vm.prank(address(0x3523));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    ve.withdraw(address(modeVelodrome5050IonMode), lockInput.tokenId);
  }

  function test_withdraw_RevertIfVoting() public {
    ve.voting(lockInput.tokenId, true);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("AlreadyVoted()"));
    ve.withdraw(address(modeVelodrome5050IonMode), lockInput.tokenId);
  }

  function test_withdraw_RevertIfPermanentLock() public {
    vm.startPrank(user);
    ve.lockPermanent(lockInput.tokenAddress, lockInput.tokenId);
    vm.expectRevert(abi.encodeWithSignature("PermanentLock()"));
    ve.withdraw(address(modeVelodrome5050IonMode), lockInput.tokenId);
    vm.stopPrank();
  }

  function test_withdraw_RevertIfTokenNotWhitelisted() public {
    MockERC20 randomMockToken = new MockERC20("Random_Token", "RND", 18);
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("TokenNotWhitelisted()"));
    ve.withdraw(address(randomMockToken), lockInput.tokenId);
  }

  function test_withdraw_TokenShouldStillExistIfRemainingLP() public {
    vm.prank(user);
    ve.withdraw(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId);
    address owner = ve.ownerOf(lockInputMultiLP.tokenId);
    assertEq(owner, user, "User should still own their token");
  }

  function test_withdraw_TokenShouldBeBurntInAllLPRemoved() public {
    vm.startPrank(user);
    ve.withdraw(address(modeVelodrome5050IonMode), lockInputMultiLP.tokenId);
    ve.withdraw(address(modeBalancer8020IonEth), lockInputMultiLP.tokenId);
    vm.stopPrank();

    vm.expectRevert("ERC721: invalid token ID");
    ve.ownerOf(lockInputMultiLP.tokenId);

    uint256[] memory ownerTokenIds = ve.getOwnedTokenIds(user);
    bool tokenIdFound = false;
    for (uint256 i = 0; i < ownerTokenIds.length; i++) {
      if (ownerTokenIds[i] == lockInputMultiLP.tokenId) {
        tokenIdFound = true;
        break;
      }
    }
    assertFalse(tokenIdFound, "Token ID should be removed from user's owned tokens");
  }

  function test_withdraw_WithdrawAssetNotOwnedButWhitelisted() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("NoLockFound()"));
    ve.withdraw(address(modeBalancer8020IonEth), lockInput.tokenId);
  }
}
