// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract LockAdditionalAsset is veIONTest {
  address user;
  uint256 tokenId;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);
    lockInputMultiLP = _createLockMultipleInternal(user);
    IveION(ve).setVoter(address(this));
  }

  function test_lockAdditionalAsset_UserCanLockAdditionalLp() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);

    vm.prank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);

    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    vm.prank(user);
    IveION(ve).lockAdditionalAsset(
      address(modeBalancer8020IonEth),
      additionalAmount,
      lockInput.tokenId,
      26 weeks,
      false
    );

    IveION.LockedBalance memory lockedBalancer = IveION(ve).getUserLock(lockInput.tokenId, balancerLpType);
    uint256 expectedEndTimeBalancer = ((block.timestamp + 26 weeks) / WEEK) * WEEK;

    IveION.LockedBalance memory lockedVelo = IveION(ve).getUserLock(
      lockInput.tokenId,
      IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE
    );
    uint256 expectedEndTimeVelo = ((block.timestamp + 52 weeks) / WEEK) * WEEK;

    assertEq(lockedBalancer.amount, additionalAmount, "Total locked amount mismatch");
    assertEq(lockedBalancer.end, expectedEndTimeBalancer, "Lock end time should be increased balancer");
    assertEq(lockedVelo.amount, lockInput.tokenAmount, "Total locked amount mismatch");
    assertEq(lockedVelo.end, expectedEndTimeVelo, "Lock end time should be increased velo");
  }

  function test_lockAdditionalAsset_RevertIfNotOwner() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18; // 500 tokens
    address randomUser = address(0x1345);

    vm.prank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.prank(randomUser);
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    IveION(ve).lockAdditionalAsset(
      address(modeBalancer8020IonEth),
      additionalAmount,
      lockInput.tokenId,
      26 weeks,
      false
    );
  }

  function test_lockAdditionalAsset_RevertIfZeroAmount() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 0;

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
    IveION(ve).lockAdditionalAsset(
      address(modeBalancer8020IonEth),
      additionalAmount,
      lockInput.tokenId,
      26 weeks,
      false
    );
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfAlreadyVoted() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    IveION(ve).voting(lockInput.tokenId, true);

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("AlreadyVoted()"));
    IveION(ve).lockAdditionalAsset(
      address(modeBalancer8020IonEth),
      additionalAmount,
      lockInput.tokenId,
      26 weeks,
      false
    );
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfDuplicateAsset() public {
    modeVelodrome5050IonMode.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("DuplicateAsset()"));
    IveION(ve).lockAdditionalAsset(
      address(modeVelodrome5050IonMode),
      additionalAmount,
      lockInput.tokenId,
      26 weeks,
      false
    );
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfMinimumNotMet() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 9 * 10 ** 18;

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("MinimumNotMet()"));
    IveION(ve).lockAdditionalAsset(
      address(modeBalancer8020IonEth),
      additionalAmount,
      lockInput.tokenId,
      26 weeks,
      false
    );
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfLockTooLong() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("LockDurationTooLong()"));
    IveION(ve).lockAdditionalAsset(
      address(modeBalancer8020IonEth),
      additionalAmount,
      lockInput.tokenId,
      150 weeks,
      false
    );
    vm.stopPrank();
  }

  function test_lockAdditionalAsset_RevertIfLockTooShort() public {
    modeBalancer8020IonEth.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("LockDurationTooShort()"));
    IveION(ve).lockAdditionalAsset(
      address(modeBalancer8020IonEth),
      additionalAmount,
      lockInput.tokenId,
      25 weeks,
      false
    );
    vm.stopPrank();
  }

  function test_lockAdditionAsset_RevertIfTokenNotWhitelisted() public {
    MockERC20 randomToken = new MockERC20("Random Token", "RND", 18);
    randomToken.mint(user, lockInput.tokenAmount);
    uint256 additionalAmount = 500 * 10 ** 18;

    vm.startPrank(user);
    randomToken.approve(address(ve), lockInput.tokenAmount);
    vm.expectRevert(abi.encodeWithSignature("TokenNotWhitelisted()"));
    IveION(ve).lockAdditionalAsset(address(randomToken), additionalAmount, lockInput.tokenId, 26 weeks, false);
    vm.stopPrank();
  }
}
