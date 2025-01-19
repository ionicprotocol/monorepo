// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract CreateLock is veIONTest {
  function setUp() public {
    _setUp();
  }

  function afterForkSetUp() internal override {
    _afterForkSetUpMode();
  }

  function test_createLock_UserCanCreateLock() public {
    TestVars memory vars;
    vars.user = address(0x1234);

    LockInfo memory lockInput = _createLockInternal(vars.user);
    IveION.LockedBalance memory actualLock = IveION(ve).getUserLock(
      lockInput.tokenId,
      IveION(ve).s_lpType(lockInput.tokenAddress)
    );

    vars.lockedBalance_end_test = ((block.timestamp + lockInput.duration) / WEEK) * WEEK;
    vars.expectedSupply = lockInput.tokenAmount;
    vars.userEpoch = IveION(ve).s_userPointEpoch(lockInput.tokenId, IveION(ve).s_lpType(lockInput.tokenAddress));
    IveION.UserPoint memory userPoint = IveION(ve).getUserPoint(
      lockInput.tokenId,
      IveION(ve).s_lpType(lockInput.tokenAddress),
      vars.userEpoch
    );
    vars.ownerTokenIds = IveION(ve).getOwnedTokenIds(vars.user);
    vars.assetsLocked = IveION(ve).getAssetsLocked(lockInput.tokenId);

    assertEq(lockInput.tokenAddress, actualLock.tokenAddress, "Token address mismatch");
    assertEq(lockInput.tokenAmount, actualLock.amount, "Token amount mismatch");
    assertEq(vars.lockedBalance_end_test, actualLock.end, "Unlock time mismatch");
    assertEq(false, actualLock.isPermanent, "Lock should not be permanent");
    assertEq(IveION(ve).s_supply(IveION(ve).s_lpType(lockInput.tokenAddress)), actualLock.amount, "Supply mismatch");
    assertEq(vars.userEpoch, 1, "User epoch mismatch");
    assertEq(userPoint.ts, block.timestamp, "User point timestamp mismatch");
    assertEq(userPoint.blk, block.number, "User point block number mismatch");
    assertGt(userPoint.bias, 0, "User point bias mismatch");
    assertGt(userPoint.slope, 0, "User point slope mismatch");
    assertEq(userPoint.permanent, 0, "User point permanent mismatch");
    assertEq(IveION(ve).s_tokenId(), lockInput.tokenId, "Token ID mismatch");
    assertEq(vars.ownerTokenIds.length, 1, "Owner should have one token ID");
    assertEq(vars.ownerTokenIds[0], lockInput.tokenId, "Owner token ID mismatch");
    assertEq(vars.assetsLocked.length, 1, "Assets locked length mismatch");
    assertEq(vars.assetsLocked[0], lockInput.tokenAddress, "Assets locked address mismatch");
  }

  function test_createLock_MinBoostIsApplied() public {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 180 * 86400;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    uint256 tokenId = IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();

    IveION.LockedBalance memory actualLock = IveION(ve).getUserLock(tokenId, IveION(ve).s_lpType(tokenAddresses[0]));

    uint256 boost = actualLock.boost;
    assertEq(boost, 1e18, "Boost mismatch");
  }

  function test_createLock_MaxBoostIsApplied() public {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 2 * 365 * 86400;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    uint256 tokenId = IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();

    IveION.LockedBalance memory actualLock = IveION(ve).getUserLock(tokenId, IveION(ve).s_lpType(tokenAddresses[0]));

    uint256 boost = actualLock.boost;
    assertApproxEqAbs(boost, 2e18, 1e16, "Boost mismatch");
  }

  function test_createLock_UserCanLockMultipleLP() public {
    TestVars memory vars;

    vars.user = address(0x1234);
    LockInfoMultiple memory lockInput = _createLockMultipleInternal(vars.user);

    for (uint256 i = 0; i < lockInput.tokenAddresses.length; i++) {
      IveION.LockedBalance memory lb = IveION(ve).s_locked(
        lockInput.tokenId,
        IveION(ve).s_lpType(lockInput.tokenAddresses[i])
      );
      uint256 unlockTime = ((block.timestamp + lockInput.durations[i]) / WEEK) * WEEK;

      assertEq(lb.tokenAddress, lockInput.tokenAddresses[i], "Token address mismatch");
      assertEq(lb.amount, lockInput.tokenAmounts[i], "Token amount mismatch");
      assertEq(lb.end, unlockTime, "Unlock time mismatch");
    }

    vars.expectedSupply = MINT_AMT;
    vars.userEpoch = IveION(ve).s_userPointEpoch(lockInput.tokenId, IveION(ve).s_lpType(lockInput.tokenAddresses[0]));
    vars.ownerTokenIds = IveION(ve).getOwnedTokenIds(vars.user);
    vars.assetsLocked = IveION(ve).getAssetsLocked(lockInput.tokenId);

    assertEq(
      IveION(ve).s_supply(IveION(ve).s_lpType(lockInput.tokenAddresses[1])),
      vars.expectedSupply,
      "Supply mismatch"
    );
    assertEq(
      IveION(ve).s_supply(IveION(ve).s_lpType(lockInput.tokenAddresses[0])),
      vars.expectedSupply,
      "Supply mismatch"
    );
    assertEq(vars.userEpoch, 1, "User epoch mismatch");
    assertEq(IveION(ve).s_tokenId(), lockInput.tokenId, "Token ID mismatch");
    assertEq(vars.ownerTokenIds.length, 1, "Owner should have one token ID");
    assertEq(vars.ownerTokenIds[0], lockInput.tokenId, "Owner token ID mismatch");
    assertEq(vars.assetsLocked.length, lockInput.tokenAddresses.length, "Assets locked length mismatch");
    for (uint256 i = 0; i < vars.assetsLocked.length; i++) {
      assertEq(vars.assetsLocked[i], lockInput.tokenAddresses[i], "Assets locked address mismatch");
    }
  }

  function test_createLock_StakeUnderlyingLP() public forkAtBlock(MODE_MAINNET, 16559826) {
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

    IveION(ve).setStakeStrategy(veloLpType, IStakeStrategy(veloIonModeStakingStrategy));

    address[] memory whitelistedTokens = new address[](1);
    bool[] memory isWhitelistedTokens = new bool[](1);
    whitelistedTokens[0] = ionMode5050;
    isWhitelistedTokens[0] = true;

    IveION(ve).whitelistTokens(whitelistedTokens, isWhitelistedTokens);
    IveION(ve).setLpTokenType(ionMode5050, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
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
    IveION(ve).createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, vars.stakeUnderlying);

    address stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(vars.user);
    uint256 stakingWalletInstanceBalance = IVeloIonModeStaking(veloGauge).balanceOf(stakingWalletInstance);

    // Advance the blockchain by 1 week
    vm.warp(block.timestamp + 1 weeks);
    uint256 reward = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    assertTrue(stakingWalletInstance != address(0), "Staking Wallet Instance should not be zero address");
    assertEq(stakingWalletInstanceBalance, vars.amount, "Staking Wallet Instance Balance should match locked amount");
    assertTrue(reward > 0, "Reward should be greater than zero after 1 week");
  }

  function test_createLock_StakeUnderlyingLPAndClaimRewards() public forkAtBlock(MODE_MAINNET, 16559826) {
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

    IveION(ve).setStakeStrategy(veloLpType, IStakeStrategy(veloIonModeStakingStrategy));

    address[] memory whitelistedTokens = new address[](1);
    bool[] memory isWhitelistedTokens = new bool[](1);
    whitelistedTokens[0] = ionMode5050;
    isWhitelistedTokens[0] = true;

    IveION(ve).whitelistTokens(whitelistedTokens, isWhitelistedTokens);
    IveION(ve).setLpTokenType(ionMode5050, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
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
    IveION(ve).createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations, vars.stakeUnderlying);

    vm.warp(block.timestamp + 1 weeks);

    address stakingWalletInstance = veloIonModeStakingStrategy.userStakingWallet(vars.user);
    uint256 stakingWalletInstanceBalance = IVeloIonModeStaking(veloGauge).balanceOf(stakingWalletInstance);
    uint256 reward = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    vm.prank(vars.user);
    IveION(ve).claimEmissions(vars.tokenAddresses[0]);

    stakingWalletInstanceBalance = IVeloIonModeStaking(veloGauge).balanceOf(stakingWalletInstance);
    reward = IVeloIonModeStaking(veloGauge).earned(stakingWalletInstance);

    uint256 userRewardBalance = IERC20(IVeloIonModeStaking(veloGauge).rewardToken()).balanceOf(vars.user);

    assertEq(
      stakingWalletInstanceBalance,
      vars.amount,
      "Staking Wallet Instance Balance After Claim should be the same"
    );
    assertEq(reward, 0, "Earned After Claim should be 0");
    assertGt(userRewardBalance, reward, "User Reward Balance should be the earned amount");
  }

  function test_createLock_RevertsIfUnequalArrayLenghts() public {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](2);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);
    tokenAddresses[1] = address(modeBalancer8020IonEth);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 52 weeks;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("ArrayMismatch()"));
    IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();
  }

  function test_createLock_RevertsIfZeroAmount() public {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = 0;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 52 weeks;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
    IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();
  }

  function test_createLock_RevertsIfDurationTooShort() public {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 10 weeks;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("LockDurationTooShort()"));
    IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();
  }

  function test_createLock_RevertIfDurationTooLong() public {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 3 * 365 * 86400;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("LockDurationTooLong()"));
    IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();
  }

  function test_createLock_RevertIfAmountTooSmall() public {
    address user = address(0x1234);
    uint256 amount = 5e18; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 52 weeks;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("MinimumNotMet()"));
    IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();
  }

  function test_createLock_RevertIfTokenNotWhitelisted() public {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 1000 tokens

    // Deploy a new random MockERC20 token
    MockERC20 randomMockToken = new MockERC20("Random_Token", "RND", 18);
    randomMockToken.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(randomMockToken);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = 52 weeks;

    vm.startPrank(user);
    randomMockToken.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("TokenNotWhitelisted()"));
    IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();
  }

  function test_createLock_RevertIfDuplicateTokens() public {
    address user = address(0x1234);
    uint256 amount = MINT_AMT; // 2000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](2);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);
    tokenAddresses[1] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](2);
    tokenAmounts[0] = amount / 2;
    tokenAmounts[1] = amount / 2;

    uint256[] memory durations = new uint256[](2);
    durations[0] = 52 weeks;
    durations[1] = 52 weeks;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    vm.expectRevert(abi.encodeWithSignature("DuplicateAsset()"));
    IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](2));
    vm.stopPrank();
  }
}
