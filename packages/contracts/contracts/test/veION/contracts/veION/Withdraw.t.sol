// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract Withdraw is veIONTest {
  address user;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;

  address alice;
  address bob;
  address cindy;
  address ralph;
  LockInfo lockInfoAlice;
  LockInfo lockInfoBob;
  LockInfo lockInfoCindy;
  LockInfo lockInfoRalph;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);
    lockInputMultiLP = _createLockMultipleInternal(user);
    ve.setVoter(address(this));
  }

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

  function test_withdraw_UserStakedUnderlying() public forkAtBlock(MODE_MAINNET, 16559826) {
    TestVars memory vars;

    address ionMode5050 = 0x690A74d2eC0175a69C0962B309E03021C0b5002E;
    address veloGauge = 0x8EE410cC13948e7e684ebACb36b552e2c2A125fC;

    veloIonModeStakingStrategy = VeloAeroStakingStrategy(
      address(
        new TransparentUpgradeableProxy(
          address(new VeloAeroStakingStrategy()),
          address(new ProxyAdmin()),
          abi.encodeWithSelector(
            VeloAeroStakingStrategy.initialize.selector,
            address(ve),
            ionMode5050LP,
            veloGauge,
            address(veloStakingWalletImplementation)
          )
        )
      )
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

  function test_withdraw_WithdrawCorrectUnderlyingStakingAfterSplitAndTransfer()
    public
    forkAtBlock(MODE_MAINNET, 16559826)
  {
    ve.toggleSplit(address(0), true);
    ve.setMinimumLockAmount(lockInfoAlice.tokenAddress, 1e18);

    uint256 splitAmt = 4e18;
    uint256 originalTokenAmt = REAL_LP_LOCK_AMOUNT - 4e18;

    vm.startPrank(alice);
    (uint256 tokenId1, uint256 tokenId2) = ve.split(lockInfoAlice.tokenAddress, lockInfoAlice.tokenId, splitAmt);

    assertEq(
      ve.s_userCumulativeAssetValues(alice, lockInfoAlice.tokenAddress),
      REAL_LP_LOCK_AMOUNT,
      "Alice cumulative value should be the original locked amount"
    );
    assertEq(
      ve.s_userCumulativeAssetValues(bob, lockInfoAlice.tokenAddress),
      REAL_LP_LOCK_AMOUNT,
      "Bob cumulative value should be the original locked amount"
    );

    assertEq(
      ve.s_underlyingStake(tokenId1, lockInfoAlice.tokenAddress),
      REAL_LP_LOCK_AMOUNT - splitAmt,
      "Underlying stake for tokenId1 should be half of the original lock amount"
    );

    assertEq(
      ve.s_underlyingStake(tokenId2, lockInfoAlice.tokenAddress),
      splitAmt,
      "Underlying stake for tokenId2 should be half of the original lock amount"
    );
    ve.transferFrom(alice, bob, tokenId1);
    vm.stopPrank();

    uint256 cumulativeAssetBalancePostTransferAlice = splitAmt;
    uint256 cumulativeAssetBalancePostTransferBob = REAL_LP_LOCK_AMOUNT + originalTokenAmt;

    assertEq(
      ve.s_userCumulativeAssetValues(alice, lockInfoAlice.tokenAddress),
      cumulativeAssetBalancePostTransferAlice,
      "Cumulative asset value for alice should drop post transfer"
    );
    assertEq(
      ve.s_userCumulativeAssetValues(bob, lockInfoAlice.tokenAddress),
      cumulativeAssetBalancePostTransferBob,
      "Cumulative asset value for bob should increase post transfer"
    );

    address stakingWalletInstanceAlice = veloIonModeStakingStrategy.userStakingWallet(alice);
    address stakingWalletInstanceBob = veloIonModeStakingStrategy.userStakingWallet(bob);

    uint256 stakedBalanceAlice = veloIonModeStakingStrategy.balanceOf(stakingWalletInstanceAlice);
    uint256 stakedBalanceBob = veloIonModeStakingStrategy.balanceOf(stakingWalletInstanceBob);

    console.log("Staked Balance Alice:", stakedBalanceAlice);
    console.log("Staked Balance Bob:", stakedBalanceBob);

    assertEq(
      stakedBalanceAlice,
      splitAmt,
      "Alice's staked balance should be equal to the original lock amount minus the split amount"
    );

    assertEq(stakedBalanceBob, REAL_LP_LOCK_AMOUNT - splitAmt, "Bob's staked balance should be zero before withdrawal");

    vm.warp(block.timestamp + 52 weeks);

    vm.prank(bob);
    ve.withdraw(lockInfoAlice.tokenAddress, tokenId1);

    vm.prank(alice);
    ve.withdraw(lockInfoAlice.tokenAddress, tokenId2);

    assertEq(
      ve.s_userCumulativeAssetValues(alice, lockInfoAlice.tokenAddress),
      cumulativeAssetBalancePostTransferAlice - splitAmt,
      "CumulativeAssetValue should be reduced post withdrawal for alice"
    );
    assertEq(
      ve.s_userCumulativeAssetValues(bob, lockInfoAlice.tokenAddress),
      cumulativeAssetBalancePostTransferBob - originalTokenAmt,
      "CumulativeAssetValue should be reduced post withdrawal for bob"
    );

    assertEq(
      IERC20(lockInfoAlice.tokenAddress).balanceOf(bob),
      REAL_LP_LOCK_AMOUNT - splitAmt,
      "Bob's balance should be equal to the original lock amount minus the split amount"
    );

    assertEq(
      IERC20(lockInfoAlice.tokenAddress).balanceOf(alice),
      splitAmt,
      "Alice's balance should be equal to the split amount"
    );
  }

  function test_withdraw_WithdrawCorrectUnderlyingStakingAfterSplitThenTransferToUserWithUnderlyingStake()
    public
    forkAtBlock(MODE_MAINNET, 16559826)
  {
    ve.toggleSplit(address(0), true);
    ve.setMinimumLockAmount(lockInfoAlice.tokenAddress, 1e18);

    uint256 splitAmt = 4e18;

    vm.startPrank(alice);
    (uint256 tokenId1, uint256 tokenId2) = ve.split(lockInfoAlice.tokenAddress, lockInfoAlice.tokenId, splitAmt);

    assertEq(
      ve.s_underlyingStake(tokenId1, lockInfoAlice.tokenAddress),
      REAL_LP_LOCK_AMOUNT - splitAmt,
      "Underlying stake for tokenId1 should be half of the original lock amount"
    );

    assertEq(
      ve.s_underlyingStake(tokenId2, lockInfoAlice.tokenAddress),
      splitAmt,
      "Underlying stake for tokenId2 should be half of the original lock amount"
    );
    ve.transferFrom(alice, cindy, tokenId1);
    vm.stopPrank();

    address stakingWalletInstanceAlice = veloIonModeStakingStrategy.userStakingWallet(alice);
    address stakingWalletInstanceCindy = veloIonModeStakingStrategy.userStakingWallet(cindy);

    uint256 stakedBalanceAlice = veloIonModeStakingStrategy.balanceOf(stakingWalletInstanceAlice);
    uint256 stakedBalanceCindy = veloIonModeStakingStrategy.balanceOf(stakingWalletInstanceCindy);

    console.log("Staked Balance Alice:", stakedBalanceAlice);
    console.log("Staked Balance Cindy:", stakedBalanceCindy);

    assertEq(stakedBalanceAlice, splitAmt, "Alice's staked balance should be the split amount");

    assertEq(
      stakedBalanceCindy,
      REAL_LP_LOCK_AMOUNT + REAL_LP_LOCK_AMOUNT - splitAmt,
      "Cindy's staked balance should be equal to the original lock amount minus the split amount"
    );

    vm.warp(block.timestamp + 52 weeks);

    vm.prank(cindy);
    ve.withdraw(lockInfoAlice.tokenAddress, tokenId1);

    vm.prank(alice);
    ve.withdraw(lockInfoAlice.tokenAddress, tokenId2);

    assertEq(
      IERC20(lockInfoAlice.tokenAddress).balanceOf(cindy),
      REAL_LP_LOCK_AMOUNT - splitAmt,
      "Bob's balance should be equal to the original lock amount minus the split amount"
    );

    assertEq(
      IERC20(lockInfoAlice.tokenAddress).balanceOf(alice),
      splitAmt,
      "Alice's balance should be equal to the split amount"
    );
  }

  function test_withdraw_MultiLpSplitTransferThenWithdraw() public forkAtBlock(MODE_MAINNET, 16559826) {
    ve.setMinimumLockAmount(address(ionWeth5050lPAero), 1);
    ve.setMinimumLockAmount(address(wethUSDC5050LP), 1);
    ve.toggleSplit(address(0), true);
    uint256 wethUSDCAmt = 2e16;

    address[] memory lpTokens = new address[](2);
    lpTokens[0] = address(ionMode5050LP);
    lpTokens[1] = address(wethUSDC5050LP);

    address[] memory users = new address[](4);
    users[0] = alice;
    users[1] = bob;
    users[2] = cindy;
    users[3] = ralph;

    console.log("Stakes before alice locks multi lp");
    _logUnderlyingStake(users);

    vm.prank(0x8034857f8A467624BaF973de28026CEB9A2fF5F1);
    IERC20(ionMode5050LP).transfer(alice, REAL_LP_LOCK_AMOUNT);
    vm.prank(0x98d34C7b004688F35b67Aa30D4dF5E67113f6B3D);
    IERC20(wethUSDC5050LP).transfer(alice, wethUSDCAmt);

    address[] memory tokenAddresses = new address[](2);
    uint256[] memory tokenAmounts = new uint256[](2);
    uint256[] memory durations = new uint256[](2);
    bool[] memory stakeUnderlying = new bool[](2);
    tokenAddresses[0] = address(ionMode5050LP);
    tokenAmounts[0] = REAL_LP_LOCK_AMOUNT;
    durations[0] = 52 weeks;
    stakeUnderlying[0] = true;
    tokenAddresses[1] = address(wethUSDC5050LP);
    tokenAmounts[1] = wethUSDCAmt;
    durations[1] = 52 weeks;
    stakeUnderlying[1] = true;

    vm.startPrank(alice);
    IERC20(ionMode5050LP).approve(address(ve), REAL_LP_LOCK_AMOUNT);
    IERC20(wethUSDC5050LP).approve(address(ve), wethUSDCAmt);
    uint256 tokenId1 = ve.createLock(tokenAddresses, tokenAmounts, durations, stakeUnderlying);
    vm.stopPrank();

    console.log("Stakes after alice locks multi lp");
    _logUnderlyingStake(users);

    vm.prank(alice);
    (, uint256 tokenId2) = ve.split(ionMode5050LP, tokenId1, 3e18);

    vm.prank(alice);
    (, uint256 tokenId3) = ve.split(wethUSDC5050LP, tokenId1, 1e16);

    console.log("Stakes after alice splits multi lp into one token with 3e18 ion-mode and 1e16 weth-usdc");
    _logUnderlyingStake(users);

    uint256[] memory tokenIds = new uint256[](3);
    tokenIds[0] = tokenId1;
    tokenIds[1] = tokenId2;
    tokenIds[2] = tokenId3;

    vm.startPrank(alice);
    ve.transferFrom(alice, bob, tokenId1);
    ve.transferFrom(alice, cindy, tokenId2);
    ve.transferFrom(alice, ralph, tokenId3);
    vm.stopPrank();

    address stakingWalletInstanceIonMode = veloIonModeStakingStrategy.userStakingWallet(users[1]);
    address stakingWalletInstanceWethUsdc = veloWethUsdcStakingStrategy.userStakingWallet(users[1]);

    uint256 stakedBalanceIonMode = veloIonModeStakingStrategy.balanceOf(stakingWalletInstanceIonMode);
    uint256 stakedBalanceWethUsdc = veloWethUsdcStakingStrategy.balanceOf(stakingWalletInstanceWethUsdc);

    assertEq(stakedBalanceIonMode, 7e18, "Underlying staked balance for bob updated ion-mode");
    assertEq(stakedBalanceWethUsdc, 1e16, "Underlying staked balance for bob updated weth-usdc");

    console.log(
      "Stakes after alice sends 7e18 ion-mode and 1e16 weth-usdc token to bob, 3e18 ion-mode token to cindy, 1e16 weth-usdc token to ralph"
    );
    _logUnderlyingStake(users);

    vm.startPrank(bob);
    ve.withdraw(address(ionMode5050LP), tokenId1);
    ve.withdraw(address(wethUSDC5050LP), tokenId1);
    vm.stopPrank();

    vm.prank(cindy);
    ve.withdraw(address(ionMode5050LP), tokenId2);

    vm.prank(ralph);
    ve.withdraw(address(wethUSDC5050LP), tokenId3);

    console.log(
      "bob withdraws 7e18 ion-mode, 1e16 weth-usdc, cindy withdraws ion-mode 3e18, ralph withdraws 1e16 weth-usdc"
    );
    stakedBalanceIonMode = veloIonModeStakingStrategy.balanceOf(stakingWalletInstanceIonMode);
    stakedBalanceWethUsdc = veloWethUsdcStakingStrategy.balanceOf(stakingWalletInstanceWethUsdc);

    assertEq(stakedBalanceIonMode, 0, "Underlying staked balance for bob updated ion-mode");
    assertEq(stakedBalanceWethUsdc, 0, "Underlying staked balance for bob updated weth-usdc");

    _logUnderlyingStake(users);
    // _logCumulativeAssetValues(users, lpTokens);
    // _logTokens(tokenIds, lpTokens);
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
