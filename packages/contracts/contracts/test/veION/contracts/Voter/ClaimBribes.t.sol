// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "solmate/test/utils/mocks/MockERC20.sol";
import "../../../../veION/Voter.sol";
import "../../../../veION/BribeRewards.sol";
import "./utils/VoterUtils.sol";

contract ClaimBribesTest is VoterTest {
  BribeRewards realBribeEthSupply;
  BribeRewards realBribeEthBorrow;
  MockERC20 bribeTokenA;
  MockERC20 bribeTokenB;
  MockERC20 bribeTokenC;

  function setUp() public {
    _setUp();
    realBribeEthSupply = new BribeRewards();
    realBribeEthBorrow = new BribeRewards();
    bribeTokenA = new MockERC20("Bribe Token A", "BTA", 18);
    bribeTokenB = new MockERC20("Bribe Token B", "BTB", 18);

    realBribeEthSupply.initialize(address(voter), address(ve));
    realBribeEthBorrow.initialize(address(voter), address(ve));

    address[] memory rewardAccumulatorsForBribes = new address[](2);
    address[] memory bribes = new address[](2);

    rewardAccumulatorsForBribes[0] = voter.marketToRewardAccumulators(ethMarket, IVoter.MarketSide.Supply);
    rewardAccumulatorsForBribes[1] = voter.marketToRewardAccumulators(ethMarket, IVoter.MarketSide.Borrow);
    bribes[0] = address(realBribeEthSupply);
    bribes[1] = address(realBribeEthBorrow);

    voter.whitelistToken(address(bribeTokenA), true);
    voter.whitelistToken(address(bribeTokenB), true);
    voter.setBribes(rewardAccumulatorsForBribes, bribes);
  }

  function test_claimBribes() public {
    // Mint and approve bribe tokens
    bribeTokenA.mint(address(this), 1000 ether);
    bribeTokenA.approve(address(realBribeEthSupply), 1000 ether);
    bribeTokenB.mint(address(this), 1000 ether);
    bribeTokenB.approve(address(realBribeEthSupply), 1000 ether);

    // Notify reward amounts
    realBribeEthSupply.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    realBribeEthSupply.notifyRewardAmount(address(bribeTokenB), 1000 ether);

    realBribeEthSupply.setHistoricalPrices(block.timestamp, address(modeVelodrome5050IonMode), 3e18);
    realBribeEthSupply.setHistoricalPrices(block.timestamp, address(modeBalancer8020IonEth), 5e18);

    // Deposit bribes
    address[] memory tokens = new address[](2);
    tokens[0] = address(bribeTokenA);
    tokens[1] = address(bribeTokenB);

    vm.startPrank(address(voter));
    realBribeEthSupply.deposit(address(modeVelodrome5050IonMode), 1000 ether, voterTokenIdSingleLp);
    realBribeEthSupply.deposit(address(modeBalancer8020IonEth), 1000 ether, voterTokenIdSingleLp);
    vm.stopPrank();

    // Claim bribes
    address[] memory bribes = new address[](1);
    bribes[0] = address(realBribeEthSupply);
    address[][] memory rewardTokens = new address[][](1);
    rewardTokens[0] = tokens;

    vm.warp(block.timestamp + 1 weeks);

    vm.prank(user);
    voter.claimBribes(bribes, rewardTokens, voterTokenIdSingleLp);

    // Check balances
    uint256 balanceA = bribeTokenA.balanceOf(user);
    uint256 balanceB = bribeTokenB.balanceOf(user);

    assertEq(balanceA, 1000 ether, "User should have claimed 1000 ether of bribeTokenA");
    assertEq(balanceB, 1000 ether, "User should have claimed 1000 ether of bribeTokenB");
  }

  function test_claimBribesMultipleBribes() public {
    // Mint and approve bribe tokens for both bribe contracts
    bribeTokenA.mint(address(this), 2000 ether);
    bribeTokenA.approve(address(realBribeEthSupply), 1000 ether);
    bribeTokenA.approve(address(realBribeEthBorrow), 1000 ether);

    bribeTokenB.mint(address(this), 2000 ether);
    bribeTokenB.approve(address(realBribeEthSupply), 1000 ether);
    bribeTokenB.approve(address(realBribeEthBorrow), 1000 ether);

    // Notify reward amounts for both bribe contracts
    realBribeEthSupply.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    realBribeEthSupply.notifyRewardAmount(address(bribeTokenB), 1000 ether);

    realBribeEthBorrow.notifyRewardAmount(address(bribeTokenA), 1000 ether);
    realBribeEthBorrow.notifyRewardAmount(address(bribeTokenB), 1000 ether);

    realBribeEthSupply.setHistoricalPrices(block.timestamp, address(modeVelodrome5050IonMode), 3e18);
    realBribeEthSupply.setHistoricalPrices(block.timestamp, address(modeBalancer8020IonEth), 5e18);

    realBribeEthBorrow.setHistoricalPrices(block.timestamp, address(modeVelodrome5050IonMode), 3e18);
    realBribeEthBorrow.setHistoricalPrices(block.timestamp, address(modeBalancer8020IonEth), 5e18);

    // Deposit bribes into both bribe contracts
    address[] memory tokens = new address[](2);
    tokens[0] = address(bribeTokenA);
    tokens[1] = address(bribeTokenB);

    vm.startPrank(address(voter));
    realBribeEthSupply.deposit(address(modeVelodrome5050IonMode), 1000 ether, voterTokenIdSingleLp);
    realBribeEthSupply.deposit(address(modeBalancer8020IonEth), 1000 ether, voterTokenIdSingleLp);
    realBribeEthBorrow.deposit(address(modeVelodrome5050IonMode), 1000 ether, voterTokenIdSingleLp);
    realBribeEthBorrow.deposit(address(modeBalancer8020IonEth), 1000 ether, voterTokenIdSingleLp);
    vm.stopPrank();

    // Claim bribes from both bribe contracts
    address[] memory bribes = new address[](2);
    bribes[0] = address(realBribeEthSupply);
    bribes[1] = address(realBribeEthBorrow);
    address[][] memory rewardTokens = new address[][](2);
    rewardTokens[0] = tokens;
    rewardTokens[1] = tokens;

    vm.warp(block.timestamp + 1 weeks);

    vm.prank(user);
    voter.claimBribes(bribes, rewardTokens, voterTokenIdSingleLp);

    // Check balances
    uint256 balanceA = bribeTokenA.balanceOf(user);
    uint256 balanceB = bribeTokenB.balanceOf(user);

    assertEq(balanceA, 2000 ether, "User should have claimed 2000 ether of bribeTokenA");
    assertEq(balanceB, 2000 ether, "User should have claimed 2000 ether of bribeTokenB");
  }

  function test_claimBribes_RevertIfNotOwner() public {
    address notOwner = address(0xABC);

    address[] memory bribes = new address[](2);
    bribes[0] = address(0x123); // Dummy address for bribe contract
    bribes[1] = address(0x456); // Dummy address for another bribe contract

    address[][] memory rewardTokens = new address[][](2);
    rewardTokens[0] = new address[](2);
    rewardTokens[0][0] = address(0x789); // Dummy address for reward token A
    rewardTokens[0][1] = address(0xABC); // Dummy address for reward token B

    rewardTokens[1] = new address[](2);
    rewardTokens[1][0] = address(0xDEF); // Dummy address for reward token A
    rewardTokens[1][1] = address(0xFED); // Dummy address for reward token B

    vm.startPrank(notOwner);
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    voter.claimBribes(bribes, rewardTokens, voterTokenIdSingleLp);
    vm.stopPrank();
  }

  function test_claimBribes_RevertIfUnequalLengths() public {
    address[] memory bribes = new address[](2);
    bribes[0] = address(0x123); // Dummy address for bribe contract
    bribes[1] = address(0x456); // Dummy address for another bribe contract

    address[][] memory rewardTokens = new address[][](1); // Intentionally unequal length
    rewardTokens[0] = new address[](2);
    rewardTokens[0][0] = address(0x789); // Dummy address for reward token A
    rewardTokens[0][1] = address(0xABC); // Dummy address for reward token B

    vm.startPrank(user);
    vm.expectRevert(abi.encodeWithSignature("UnequalLengths()"));
    voter.claimBribes(bribes, rewardTokens, voterTokenIdSingleLp);
    vm.stopPrank();
  }
}
