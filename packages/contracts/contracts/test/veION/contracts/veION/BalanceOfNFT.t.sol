// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract BalanceOfNFT is veIONTest {
  address user;
  LockInfo lockInput;
  LockInfoMultiple lockInputMultiLP;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);
    lockInputMultiLP = _createLockMultipleInternal(user);
    IveION(ve).setVoter(address(this));
  }

  function afterForkSetUp() internal override {
    _afterForkSetUpBase();
    baseTokenIdSingleLp = _lockSingleLPFork(baseUser, REAL_LP_LOCK_AMOUNT);
  }

  function test_balanceOfNFT_GetsBalanceIfLockExists() public {
    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    assertEq(assets.length, 1, "Assets array length should be 1");
    assertEq(balances.length, 1, "Balances array length should be 1");

    IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, veloLpType);

    console.log("Lock start time test:", lock.start);
    console.log("Lock end time test:", lock.end);

    for (uint256 i = 0; i < assets.length; i++) {
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertApproxEqAbs(
        balances[i],
        lockInput.tokenAmount / 2,
        3e18,
        "Balance should approximately match the lock input"
      );
      assertEq(boosts[i], harness.exposed_calculateBoost(lock.end - lock.start), "Boost should match the lock input");
      console.log("Asset:", assets[i]);
      console.log("Balance:", balances[i]);
      console.log("Boost:", boosts[i]);
    }
  }

  function test_balanceOfNFT_GivesMinimalBoostWhenLockMinimum() public {
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = MINTIME;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    uint256 tokenId = IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();

    (, , uint256[] memory boosts) = IveION(ve).balanceOfNFT(tokenId);

    assertEq(boosts[0], 1e18, "Boost should match the lock input");
  }

  function test_balanceOfNFT_GivesMaximumBoostWhenLockMaximum() public {
    uint256 amount = MINT_AMT; // 1000 tokens
    modeVelodrome5050IonMode.mint(user, amount);

    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(modeVelodrome5050IonMode);

    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = amount;

    uint256[] memory durations = new uint256[](1);
    durations[0] = MAXTIME;

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), amount);
    uint256 tokenId = IveION(ve).createLock(tokenAddresses, tokenAmounts, durations, new bool[](1));
    vm.stopPrank();

    (, , uint256[] memory boosts) = IveION(ve).balanceOfNFT(tokenId);

    assertApproxEqRel(boosts[0], 2e18, 0.01e18, "Boost should match the lock input");
  }

  function test_balanceOfNFT_GetsBalanceForMultiLPLock() public {
    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInputMultiLP.tokenId
    );

    assertEq(assets.length, 2, "Assets array length should be 1");
    assertEq(balances.length, 2, "Balances array length should be 1");

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(
        lockInputMultiLP.tokenId,
        IveION(ve).s_lpType(assets[i])
      );
      assertEq(assets[i], lockInputMultiLP.tokenAddresses[i], "Asset address should match the lock input");
      assertApproxEqRel(
        balances[i],
        lockInputMultiLP.tokenAmounts[i] / 2,
        0.01e18,
        "Balance should approximately match the lock input"
      );
      assertEq(boosts[i], harness.exposed_calculateBoost(lock.end - lock.start), "Boost should match the lock input");

      console.log("Lock", i);
      console.log("Asset:", assets[i]);
      console.log("Balance:", balances[i]);
      console.log("Boost:", boosts[i]);
    }
  }

  function test_balanceOfNFT_BalanceDecreasesLinearlyWithTime() public {
    vm.warp(block.timestamp + 26 weeks);
    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(
        balances[i],
        lockInput.tokenAmount / 4,
        0.01e18,
        "Balance should approximately match the lock input"
      );
      assertEq(boosts[i], harness.exposed_calculateBoost(lock.end - lock.start), "Boost should match the lock input");

      console.log("Lock", i);
      console.log("Asset:", assets[i]);
      console.log("Balance:", balances[i]);
      console.log("Boost:", boosts[i]);
    }
  }

  function test_balanceOfNFT_BalanceEventuallyGoesToZero() public {
    vm.warp(block.timestamp + 52 weeks);
    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(balances[i], 0, 0.01e18, "Balance should approximately match the lock input");
      assertEq(boosts[i], harness.exposed_calculateBoost(lock.end - lock.start), "Boost should match the lock input");

      console.log("Lock", i);
      console.log("Asset:", assets[i]);
      console.log("Balance:", balances[i]);
      console.log("Boost:", boosts[i]);
    }
  }

  function test_balanceOFNFT_ShouldGiveEventBasedBoost() public {
    uint256 limitedBoost = 0.5e18;
    IveION(ve).toggleLimitedBoost(true);
    IveION(ve).setLimitedTimeBoost(limitedBoost);

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(balances[i], lock.amount / 2, 0.01e18, "Balance should approximately match the lock input");
      assertEq(
        boosts[i],
        harness.exposed_calculateBoost(lock.end - lock.start) + limitedBoost,
        "Boost should match the lock input"
      );

      console.log("Lock", i);
      console.log("Asset:", assets[i]);
      console.log("Balance:", balances[i]);
      console.log("Boost:", boosts[i]);
    }
  }

  function test_balanceOfNFT_ShouldGiveAeroVotingBasedBoost() public {
    address aeroVotingAddress = address(0x123);
    uint256 aeroVoterBoost = 1e18;
    address ionicPoolAddress = address(0x456);
    address veAEROAddress = address(0x789);

    IveION(ve).setAeroVoting(aeroVotingAddress);
    IveION(ve).setAeroVoterBoost(aeroVoterBoost);
    IveION(ve).setIonicPool(ionicPoolAddress);
    IveION(ve).setVeAERO(veAEROAddress);

    vm.mockCall(
      veAEROAddress,
      abi.encodeWithSelector(IAeroVotingEscrow(veAEROAddress).balanceOf.selector, user),
      abi.encode(1) // Mock that the user has 1 veAERO token
    );

    vm.mockCall(
      veAEROAddress,
      abi.encodeWithSelector(IAeroVotingEscrow(veAEROAddress).ownerToNFTokenIdList.selector, user, 0),
      abi.encode(1) // Mock that the tokenId list returns 1
    );

    vm.mockCall(
      aeroVotingAddress,
      abi.encodeWithSelector(IAeroVoter(aeroVotingAddress).votes.selector, 1, ionicPoolAddress),
      abi.encode(1e18) // Mock that the votes for the ionicPool is 1e18
    );

    vm.mockCall(
      aeroVotingAddress,
      abi.encodeWithSelector(IAeroVoter(aeroVotingAddress).weights.selector, ionicPoolAddress),
      abi.encode(1e18) // Mock that the weight of the ionicPool is 1e18
    );

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(balances[i], lock.amount / 2, 0.01e18, "Balance should approximately match the lock input");
      assertEq(
        boosts[i],
        harness.exposed_calculateBoost(lock.end - lock.start) + aeroVoterBoost,
        "Boost should match the lock input"
      );

      console.log("Lock", i);
      console.log("Asset:", assets[i]);
      console.log("Balance:", balances[i]);
      console.log("Boost:", boosts[i]);
    }
  }

  function test_balanceOfNFT_ShouldGiveAeroVotingBasedBoostFork() public forkAtBlock(BASE_MAINNET, 22722980) {
    AeroBoostVars memory vars;
    vars.aeroVoterBoost = 1e18;
    vars.aeroVotingAddress = 0x16613524e02ad97eDfeF371bC883F2F5d6C480A5;
    vars.ionicPoolAddress = 0x0FAc819628a7F612AbAc1CaD939768058cc0170c;
    vars.veAEROAddress = 0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4;
    vars.AERO = 0x940181a94A35A4569E4529A3CDfB74e38FD98631;
    vars.lockAmount = 20_000_000 ether;

    vars.poolVote = new address[](1);
    vars.weights = new uint256[](1);
    vars.poolVote[0] = vars.ionicPoolAddress;
    vars.weights[0] = 1e18; // 100% of the vote

    IveION(ve).setAeroVoting(vars.aeroVotingAddress);
    IveION(ve).setAeroVoterBoost(vars.aeroVoterBoost);
    IveION(ve).setIonicPool(vars.ionicPoolAddress);
    IveION(ve).setVeAERO(vars.veAEROAddress);

    vars.aeroWhale = 0x6cDcb1C4A4D1C3C6d054b27AC5B77e89eAFb971d;
    vm.prank(vars.aeroWhale);
    IERC20(vars.AERO).transfer(baseUser, vars.lockAmount);

    vm.startPrank(baseUser);
    IERC20(vars.AERO).approve(vars.veAEROAddress, vars.lockAmount);
    vars.veAeroTokenId = IveAERO(vars.veAEROAddress).createLock(vars.lockAmount, 2 * 365 * 86400);
    IAEROVoter(vars.aeroVotingAddress).vote(vars.veAeroTokenId, vars.poolVote, vars.weights);
    vm.stopPrank();

    uint256 weight = IAEROVoter(vars.aeroVotingAddress).votes(vars.veAeroTokenId, vars.ionicPoolAddress);

    console.log("Pool weight", weight);

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      baseTokenIdSingleLp
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(baseTokenIdSingleLp, IveION(ve).s_lpType(assets[i]));
      assertGt(boosts[i], harness.exposed_calculateBoost(lock.end - lock.start), "Boost should match the lock input");
      console.log("Lock", i);
      console.log("Asset:", assets[i]);
      console.log("Balance:", balances[i]);
      console.log("Boost:", boosts[i]);
    }
  }

  function test_balanceOfNFT_IfVeAEROContractSetAndUserHasNoVoteThenBoostUnaffected() public {
    address aeroVotingAddress = address(0x123);
    uint256 aeroVoterBoost = 1e18;
    address ionicPoolAddress = address(0x456);
    address veAEROAddress = address(0x789);

    IveION(ve).setAeroVoting(aeroVotingAddress);
    IveION(ve).setAeroVoterBoost(aeroVoterBoost);
    IveION(ve).setIonicPool(ionicPoolAddress);
    IveION(ve).setVeAERO(veAEROAddress);

    vm.mockCall(
      veAEROAddress,
      abi.encodeWithSelector(IAeroVotingEscrow(veAEROAddress).balanceOf.selector, user),
      abi.encode(0) // Mock that the user has 1 veAERO token
    );

    vm.mockCall(
      aeroVotingAddress,
      abi.encodeWithSelector(IAeroVoter(aeroVotingAddress).weights.selector, ionicPoolAddress),
      abi.encode(1e18) // Mock that the weight of the ionicPool is 1e18
    );

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(balances[i], lock.amount / 2, 0.01e18, "Balance should approximately match the lock input");
      assertEq(boosts[i], harness.exposed_calculateBoost(lock.end - lock.start), "Boost should match the lock input");

      console.log("Lock", i);
      console.log("Asset:", assets[i]);
      console.log("Balance:", balances[i]);
      console.log("Boost:", boosts[i]);
    }
  }

  function test_balanceOfNFT_GetsBalanceForPermanentLock() public {
    vm.prank(user);
    IveION(ve).lockPermanent(lockInput.tokenAddress, lockInput.tokenId);
    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(balances[i], lock.amount, 0.01e18, "Balance should approximately match the lock input");
      assertEq(boosts[i], harness.exposed_calculateBoost(MAXTIME), "Boost should match the lock input");

      console.log("Lock", i);
      console.log("Asset:", assets[i]);
      console.log("Balance:", balances[i]);
      console.log("Boost:", boosts[i]);
    }
  }

  function test_balanceOfNFT_BalanceOfPermanentDoesNotDecay() public {
    vm.prank(user);
    IveION(ve).lockPermanent(lockInput.tokenAddress, lockInput.tokenId);

    vm.warp(block.timestamp + 10 * 365 * 86400);
    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(balances[i], lock.amount, 0.01e18, "Balance should approximately match the lock input");
      assertEq(boosts[i], harness.exposed_calculateBoost(MAXTIME), "Boost should match the lock input");

      console.log("Lock", i);
      console.log("Asset:", assets[i]);
      console.log("Balance:", balances[i]);
      console.log("Boost:", boosts[i]);
    }
  }

  function test_balanceOfNFT_GetsBalanceForPermanentLockWithDelegator() public {
    address delegator = address(0x2352);
    LockInfo memory delegatorInfo = _createLockInternal(delegator);
    vm.prank(user);
    IveION(ve).lockPermanent(lockInput.tokenAddress, lockInput.tokenId);

    vm.startPrank(delegator);
    IveION(ve).lockPermanent(delegatorInfo.tokenAddress, delegatorInfo.tokenId);
    IveION(ve).delegate(
      delegatorInfo.tokenId,
      lockInput.tokenId,
      delegatorInfo.tokenAddress,
      delegatorInfo.tokenAmount
    );
    vm.stopPrank();

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(balances[i], lock.amount * 2, 0.01e18, "Balance should approximately match the lock input");
      assertEq(boosts[i], harness.exposed_calculateBoost(MAXTIME), "Boost should match the lock input");
    }
  }

  function test_balanceOfNFT_GetsBalanceForPermanentWithDelegatee() public {
    address delegatee = address(0x2352);
    LockInfo memory delegateeInfo = _createLockInternal(delegatee);
    vm.prank(delegatee);
    IveION(ve).lockPermanent(delegateeInfo.tokenAddress, delegateeInfo.tokenId);

    vm.startPrank(user);
    IveION(ve).lockPermanent(lockInput.tokenAddress, lockInput.tokenId);
    IveION(ve).delegate(lockInput.tokenId, delegateeInfo.tokenId, lockInput.tokenAddress, lockInput.tokenAmount);
    vm.stopPrank();

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertEq(balances[i], 0, "Balance should approximately match the lock input");
      assertEq(boosts[i], harness.exposed_calculateBoost(MAXTIME), "Boost should match the lock input");
    }
  }

  function test_balanceOfNFT_BalanceChangesAfterIncreaseAmount() public {
    uint256 additionalAmount = 1000 * 1e18;
    modeVelodrome5050IonMode.mint(user, additionalAmount);

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);
    IveION(ve).increaseAmount(lockInput.tokenAddress, lockInput.tokenId, lockInput.tokenAmount, false);
    vm.stopPrank();

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(
        balances[i],
        lockInput.tokenAmount,
        0.01e18,
        "Balance should approximately match the lock input"
      );
      assertEq(boosts[i], harness.exposed_calculateBoost(lock.end - lock.start), "Boost should match the lock input");
    }
  }

  function test_balanceOfNFT_BalanceChangesAfterLockAdditionalAsset() public {
    uint256 additionalAmount = 1000 * 1e18;
    modeBalancer8020IonEth.mint(user, additionalAmount);

    vm.startPrank(user);
    modeBalancer8020IonEth.approve(address(ve), additionalAmount);
    IveION(ve).lockAdditionalAsset(
      address(modeBalancer8020IonEth),
      additionalAmount,
      lockInput.tokenId,
      lockInput.duration,
      false
    );
    vm.stopPrank();

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], lock.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(balances[i], lock.amount / 2, 0.01e18, "Balance should approximately match the lock input");
      assertEq(boosts[i], harness.exposed_calculateBoost(lock.end - lock.start), "Boost should match the lock input");
    }
  }

  function test_balanceOfNFT_BalanceChangesAfterIncreaseUnlockTime() public {
    vm.prank(user);
    IveION(ve).increaseUnlockTime(lockInput.tokenAddress, lockInput.tokenId, 2 * 365 * 86400);

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], lock.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(balances[i], lock.amount, 0.01e18, "Balance should approximately match the lock input");
      assertEq(boosts[i], harness.exposed_calculateBoost(lock.end - lock.start), "Boost should match the lock input");
    }
  }

  function test_balanceOfNFT_BalanceChangesAfterWithdraw() public {
    vm.prank(user);
    IveION(ve).withdraw(lockInput.tokenAddress, lockInput.tokenId);

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], lock.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(balances[i], 0, 0.01e18, "Balance should approximately match the lock input");
      assertEq(boosts[i], harness.exposed_calculateBoost(lock.end - lock.start), "Boost should match the lock input");
    }
  }

  function test_balanceOfNFT_BalanceChangesAfterMerge() public {
    vm.prank(user);
    IveION(ve).merge(lockInput.tokenId, lockInputMultiLP.tokenId);

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets[i]));
      assertEq(assets[i], address(0), "Asset address should be 0");
      assertEq(balances[i], 0, "Balance should be 0");
      assertEq(boosts[i], 0, "Boost should match the lock input");
    }

    (address[] memory assetsMultiLP, uint256[] memory balancesMultiLP, uint256[] memory boostsMultiLP) = IveION(ve)
      .balanceOfNFT(lockInputMultiLP.tokenId);

    IveION.LockedBalance memory lock = IveION(ve).getUserLock(
      lockInputMultiLP.tokenId,
      IveION(ve).s_lpType(assetsMultiLP[0])
    );
    assertEq(assetsMultiLP[0], lockInputMultiLP.tokenAddresses[0], "Asset address should match the lock input");
    assertApproxEqRel(
      balancesMultiLP[0],
      lockInput.tokenAmount,
      0.01e18,
      "Balance should approximately match the lock input"
    );
    assertEq(
      boostsMultiLP[0],
      harness.exposed_calculateBoost(lock.end - lock.start),
      "Boost should match the lock input"
    );
  }

  function test_balanceOfNFT_BalanceChangesAfterSplit() public {
    IveION(ve).toggleSplit(address(0), true);
    vm.prank(user);
    (uint256 tokenId1, uint256 tokenId2) = IveION(ve).split(
      lockInput.tokenAddress,
      lockInput.tokenId,
      lockInput.tokenAmount / 2
    );

    (address[] memory assets1, uint256[] memory balances1, uint256[] memory boosts1) = IveION(ve).balanceOfNFT(
      tokenId1
    );
    (address[] memory assets2, uint256[] memory balances2, uint256[] memory boosts2) = IveION(ve).balanceOfNFT(
      tokenId2
    );

    for (uint256 i = 0; i < assets1.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets1[i]));
      assertEq(assets1[i], lock.tokenAddress, "Asset address should be 0");
      assertApproxEqRel(balances1[i], MINT_AMT / 4, 0.01e18, "Balance should be 0");
      assertEq(boosts1[i], harness.exposed_calculateBoost(lock.end - lock.start), "Boost should match the lock input");
    }

    for (uint256 i = 0; i < assets2.length; i++) {
      IveION.LockedBalance memory lock = IveION(ve).getUserLock(lockInput.tokenId, IveION(ve).s_lpType(assets2[i]));
      assertEq(assets2[i], lock.tokenAddress, "Asset address should be 0");
      assertApproxEqRel(balances2[i], MINT_AMT / 4, 0.01e18, "Balance should be 0");
      assertEq(boosts2[i], harness.exposed_calculateBoost(lock.end - lock.start), "Boost should match the lock input");
    }
  }

  function test_balanceOfNFT_BalanceChangesAfterUnlockPermanent() public {
    address delegatee = address(0x2352);

    vm.startPrank(user);
    IveION(ve).lockPermanent(lockInput.tokenAddress, lockInput.tokenId);
    IveION(ve).unlockPermanent(lockInput.tokenAddress, lockInput.tokenId);
    vm.stopPrank();

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertApproxEqRel(balances[i], MINT_AMT, 0.01e18, "Balance should approximately match the lock input");
      assertEq(boosts[i], harness.exposed_calculateBoost(MAXTIME), "Boost should match the lock input");
    }
  }

  function test_balanceOfNFT_BalanceChangesAfterRemoveDelegation() public {
    address delegatee = address(0x2352);
    LockInfo memory delegateeInfo = _createLockInternal(delegatee);
    vm.prank(delegatee);
    IveION(ve).lockPermanent(delegateeInfo.tokenAddress, delegateeInfo.tokenId);

    vm.startPrank(user);
    IveION(ve).lockPermanent(lockInput.tokenAddress, lockInput.tokenId);
    IveION(ve).delegate(lockInput.tokenId, delegateeInfo.tokenId, lockInput.tokenAddress, lockInput.tokenAmount);
    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = delegateeInfo.tokenId;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = lockInput.tokenAmount;
    IveION(ve).removeDelegatees(lockInput.tokenId, toTokenIds, lockInput.tokenAddress, amounts);
    vm.stopPrank();

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(
      lockInput.tokenId
    );

    for (uint256 i = 0; i < assets.length; i++) {
      assertEq(assets[i], lockInput.tokenAddress, "Asset address should match the lock input");
      assertEq(balances[i], MINT_AMT, "Balance should approximately match the lock input");
      assertEq(boosts[i], harness.exposed_calculateBoost(MAXTIME), "Boost should match the lock input");
    }
  }

  function test_balanceOfNFT_NonExistentTokenId() public {
    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = IveION(ve).balanceOfNFT(23526);
    assertEq(assets.length, 0, "Assets array should be empty");
    assertEq(balances.length, 0, "Balances array should be empty");
    assertEq(boosts.length, 0, "Boosts array should be empty");
  }
}
