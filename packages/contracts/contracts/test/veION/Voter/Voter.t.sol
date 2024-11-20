// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./VoterUtils.sol";
import { UniswapLpTokenPriceOracle } from "../../../oracles/default/UniswapLpTokenPriceOracle.sol";
import { BasePriceOracle } from "../../../oracles/BasePriceOracle.sol";

contract Vote is VoterTest {
  function setUp() public {
    _setUp();
  }

  function test_vote_UserCanVoteSingleLP() public {
    address[] memory _marketVote = new address[](2);
    IVoter.MarketSide[] memory _marketVoteSide = new IVoter.MarketSide[](2);
    uint256[] memory _weights = new uint256[](2);

    _marketVote[0] = ethMarket;
    _marketVoteSide[0] = IVoter.MarketSide.Supply;
    _weights[0] = 100;

    _marketVote[1] = btcMarket;
    _marketVoteSide[1] = IVoter.MarketSide.Borrow;
    _weights[1] = 200;

    vm.prank(user);
    voter.vote(voterTokenIdSingleLp, _marketVote, _marketVoteSide, _weights);

    (, uint256[] memory votingLPBalances, uint256[] memory boosts) = ve.balanceOfNFT(voterTokenIdSingleLp);

    IVoter.VoteDetails memory voteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    uint256 effectiveVotingPower = (votingLPBalances[0] * boosts[0]) / 1e18;
    uint256 totalWeight = _weights[0] + _weights[1];

    for (uint256 i = 0; i < voteDetails.marketVotes.length; i++) {
      assertEq(voteDetails.marketVotes[i], _marketVote[i], "Market Vote should be applied");
      assertEq(
        uint256(voteDetails.marketVoteSides[i]),
        uint256(_marketVoteSide[i]),
        "Market Vote Side should be applied"
      );
      assertEq(
        voteDetails.votes[i],
        (effectiveVotingPower * _weights[i]) / totalWeight,
        "User's vote should be in accordance with weight"
      );
    }

    assertApproxEqRel(voteDetails.usedWeight, effectiveVotingPower, 0.001e18, "Used weight should be all voting power");

    assertEq(
      voter.weights(ethMarket, IVoter.MarketSide.Supply, address(modeVelodrome5050IonMode)),
      (effectiveVotingPower * _weights[0]) / totalWeight,
      "Weight for ETH market should be 100"
    );
    assertEq(
      voter.weights(btcMarket, IVoter.MarketSide.Borrow, address(modeVelodrome5050IonMode)),
      (effectiveVotingPower * _weights[1]) / totalWeight,
      "Weight for BTC market should be 200"
    );
  }

  struct VoteLocalVars {
    address[] marketVote;
    IVoter.MarketSide[] marketVoteSide;
    uint256[] weights;
    uint256[] votingLPBalances;
    uint256[] boosts;
    address[] marketVotesVelo;
    IVoter.MarketSide[] marketVoteSidesVelo;
    uint256[] votesVelo;
    uint256 usedWeightVelo;
    address[] marketVotesBalancer;
    IVoter.MarketSide[] marketVoteSidesBalancer;
    uint256[] votesBalancer;
    uint256 usedWeightBalancer;
    uint256 effectiveVotingPowerVelo;
    uint256 totalWeightVelo;
    uint256 effectiveVotingPowerBalancer;
    uint256 totalWeightBalancer;
  }

  function test_vote_UserCanVoteMultiLP() public {
    VoteLocalVars memory vars;

    vars.marketVote = new address[](2);
    vars.marketVoteSide = new IVoter.MarketSide[](2);
    vars.weights = new uint256[](2);

    vars.marketVote[0] = ethMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 100;

    vars.marketVote[1] = btcMarket;
    vars.marketVoteSide[1] = IVoter.MarketSide.Borrow;
    vars.weights[1] = 200;

    vm.prank(user);
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);

    (, vars.votingLPBalances, vars.boosts) = ve.balanceOfNFT(voterTokenIdMultiLp);

    IVoter.VoteDetails memory voteDetailsVelo = voter.getVoteDetails(
      voterTokenIdMultiLp,
      address(modeVelodrome5050IonMode)
    );

    IVoter.VoteDetails memory voteDetailsBalancer = voter.getVoteDetails(
      voterTokenIdMultiLp,
      address(modeBalancer8020IonEth)
    );

    console.log("==================================Velo LP Vote Details==================================:");
    for (uint256 i = 0; i < voteDetailsVelo.marketVotes.length; i++) {
      console.log("===================VOTE====================");
      console.log("Market:", voteDetailsVelo.marketVotes[i]);
      console.log("Market Side:", uint256(voteDetailsVelo.marketVoteSides[i]));
      console.log("Votes:", voteDetailsVelo.votes[i]);
    }
    console.log("Used Weight Velo:", voteDetailsVelo.usedWeight);
    console.log("-----------------------------------------------------------------------------------------");

    console.log("==================================Balancer LP Vote Details==================================:");
    for (uint256 i = 0; i < voteDetailsBalancer.marketVotes.length; i++) {
      console.log("===================VOTE====================");
      console.log("Market:", voteDetailsBalancer.marketVotes[i]);
      console.log("Market Side:", uint256(voteDetailsBalancer.marketVoteSides[i]));
      console.log("Votes:", voteDetailsBalancer.votes[i]);
    }
    console.log("Used Weight Balancer:", voteDetailsBalancer.usedWeight);

    vars.effectiveVotingPowerVelo = (vars.votingLPBalances[0] * vars.boosts[0]) / 1e18;
    vars.totalWeightVelo = vars.weights[0] + vars.weights[1];

    vars.effectiveVotingPowerBalancer = (vars.votingLPBalances[1] * vars.boosts[1]) / 1e18;
    vars.totalWeightBalancer = vars.weights[0] + vars.weights[1];

    for (uint256 i = 0; i < voteDetailsVelo.marketVotes.length; i++) {
      assertEq(voteDetailsVelo.marketVotes[i], vars.marketVote[i], "Market Vote should be applied");
      assertEq(
        uint256(voteDetailsVelo.marketVoteSides[i]),
        uint256(vars.marketVoteSide[i]),
        "Market Vote Side should be applied"
      );
      assertEq(voteDetailsVelo.votes[i], (vars.effectiveVotingPowerVelo * vars.weights[i]) / vars.totalWeightVelo);
    }

    assertApproxEqRel(
      voteDetailsVelo.usedWeight,
      vars.effectiveVotingPowerVelo,
      0.001e18,
      "Used weight should be all voting power"
    );

    for (uint256 i = 0; i < voteDetailsBalancer.marketVotes.length; i++) {
      assertEq(voteDetailsBalancer.marketVotes[i], vars.marketVote[i], "Market Vote should be applied");
      assertEq(
        uint256(voteDetailsBalancer.marketVoteSides[i]),
        uint256(vars.marketVoteSide[i]),
        "Market Vote Side should be applied"
      );
      assertEq(
        voteDetailsBalancer.votes[i],
        (vars.effectiveVotingPowerBalancer * vars.weights[i]) / vars.totalWeightBalancer
      );
    }

    assertApproxEqRel(
      voteDetailsBalancer.usedWeight,
      vars.effectiveVotingPowerBalancer,
      0.001e18,
      "Used weight should be all voting power"
    );

    assertEq(
      voter.weights(ethMarket, IVoter.MarketSide.Supply, address(modeVelodrome5050IonMode)),
      (vars.effectiveVotingPowerVelo * vars.weights[0]) / vars.totalWeightVelo,
      "Weight for ETH market should be 100"
    );
    assertEq(
      voter.weights(btcMarket, IVoter.MarketSide.Borrow, address(modeVelodrome5050IonMode)),
      (vars.effectiveVotingPowerVelo * vars.weights[1]) / vars.totalWeightVelo,
      "Weight for BTC market should be 200"
    );

    assertEq(
      voter.weights(ethMarket, IVoter.MarketSide.Supply, address(modeBalancer8020IonEth)),
      (vars.effectiveVotingPowerBalancer * vars.weights[0]) / vars.totalWeightBalancer,
      "Weight for ETH market should be 100"
    );
    assertEq(
      voter.weights(btcMarket, IVoter.MarketSide.Borrow, address(modeBalancer8020IonEth)),
      (vars.effectiveVotingPowerBalancer * vars.weights[1]) / vars.totalWeightBalancer,
      "Weight for BTC market should be 200"
    );
  }

  function test_vote_VoteResetsAfterVotingForSameMarketsAgain() public {
    VoteLocalVars memory vars;

    vars.marketVote = new address[](2);
    vars.marketVoteSide = new IVoter.MarketSide[](2);
    vars.weights = new uint256[](2);

    vars.marketVote[0] = ethMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 100;

    vars.marketVote[1] = btcMarket;
    vars.marketVoteSide[1] = IVoter.MarketSide.Borrow;
    vars.weights[1] = 200;

    vm.prank(user);
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);

    vm.warp(block.timestamp + 14 * 86400);

    vars.marketVote[0] = ethMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 400;

    vars.marketVote[1] = btcMarket;
    vars.marketVoteSide[1] = IVoter.MarketSide.Borrow;
    vars.weights[1] = 400;

    vm.startPrank(user);
    voter.reset(voterTokenIdMultiLp);
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);
    vm.stopPrank();

    (, vars.votingLPBalances, vars.boosts) = ve.balanceOfNFT(voterTokenIdMultiLp);

    IVoter.VoteDetails memory voteDetailsVelo = voter.getVoteDetails(
      voterTokenIdMultiLp,
      address(modeVelodrome5050IonMode)
    );

    IVoter.VoteDetails memory voteDetailsBalancer = voter.getVoteDetails(
      voterTokenIdMultiLp,
      address(modeBalancer8020IonEth)
    );

    vars.effectiveVotingPowerVelo = (vars.votingLPBalances[0] * vars.boosts[0]) / 1e18;
    vars.totalWeightVelo = vars.weights[0] + vars.weights[1];

    vars.effectiveVotingPowerBalancer = (vars.votingLPBalances[1] * vars.boosts[1]) / 1e18;
    vars.totalWeightBalancer = vars.weights[0] + vars.weights[1];

    // Display vote details for Velodrome
    console.log("Velodrome Market Votes:");
    for (uint256 i = 0; i < voteDetailsVelo.marketVotes.length; i++) {
      console.log("Market:", voteDetailsVelo.marketVotes[i]);
      console.log("Market Side:", uint256(voteDetailsVelo.marketVoteSides[i]));
      console.log("Votes:", voteDetailsVelo.votes[i]);
      assertEq(voteDetailsVelo.marketVotes[i], vars.marketVote[i], "Market Vote should be applied");
      assertEq(
        uint256(voteDetailsVelo.marketVoteSides[i]),
        uint256(vars.marketVoteSide[i]),
        "Market Vote Side should be applied"
      );
      assertEq(voteDetailsVelo.votes[i], (vars.effectiveVotingPowerVelo * vars.weights[i]) / vars.totalWeightVelo);
    }
    console.log("Used Weight for Velodrome:", voteDetailsVelo.usedWeight);

    console.log("--------------------------------------------------------------");
    // Display vote details for Balancer
    console.log("Balancer Market Votes:");
    for (uint256 i = 0; i < voteDetailsBalancer.marketVotes.length; i++) {
      console.log("Market:", voteDetailsBalancer.marketVotes[i]);
      console.log("Market Side:", uint256(voteDetailsBalancer.marketVoteSides[i]));
      console.log("Votes:", voteDetailsBalancer.votes[i]);

      assertEq(voteDetailsBalancer.marketVotes[i], vars.marketVote[i], "Market Vote should be applied");
      assertEq(
        uint256(voteDetailsBalancer.marketVoteSides[i]),
        uint256(vars.marketVoteSide[i]),
        "Market Vote Side should be applied"
      );
      assertEq(
        voteDetailsBalancer.votes[i],
        (vars.effectiveVotingPowerBalancer * vars.weights[i]) / vars.totalWeightBalancer
      );
    }
    console.log("Used Weight for Balancer:", voteDetailsBalancer.usedWeight);
  }

  function test_vote_RevertIfSameEpoch() public {
    VoteLocalVars memory vars;

    vars.marketVote = new address[](2);
    vars.marketVoteSide = new IVoter.MarketSide[](2);
    vars.weights = new uint256[](2);

    vars.marketVote[0] = ethMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 100;

    vars.marketVote[1] = btcMarket;
    vars.marketVoteSide[1] = IVoter.MarketSide.Borrow;
    vars.weights[1] = 200;

    vm.prank(user);
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);

    vars.marketVote[0] = ethMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 400;

    vars.marketVote[1] = btcMarket;
    vars.marketVoteSide[1] = IVoter.MarketSide.Borrow;
    vars.weights[1] = 400;

    vm.startPrank(user);
    vm.expectRevert(abi.encodeWithSignature("AlreadyVotedOrDeposited()"));
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);
    vm.stopPrank();
  }

  function test_vote_RevertIfDistributionWindow() public {
    VoteLocalVars memory vars;

    vars.marketVote = new address[](2);
    vars.marketVoteSide = new IVoter.MarketSide[](2);
    vars.weights = new uint256[](2);

    vars.marketVote[0] = ethMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 100;

    vars.marketVote[1] = btcMarket;
    vars.marketVoteSide[1] = IVoter.MarketSide.Borrow;
    vars.weights[1] = 200;

    uint256 epochNext = voter.epochNext(block.timestamp);
    vm.warp(epochNext);
    console.log("Current Timestamp:", block.timestamp);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("DistributeWindow()"));
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);

    vm.warp(block.timestamp + 3601);
    vm.prank(user);
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);
  }

  function test_vote_NotOwner() public {
    VoteLocalVars memory vars;

    vars.marketVote = new address[](2);
    vars.marketVoteSide = new IVoter.MarketSide[](2);
    vars.weights = new uint256[](2);

    vars.marketVote[0] = ethMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 100;

    vars.marketVote[1] = btcMarket;
    vars.marketVoteSide[1] = IVoter.MarketSide.Borrow;
    vars.weights[1] = 200;

    vm.prank(address(0x2352));
    vm.expectRevert(abi.encodeWithSignature("NotOwner()"));
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);
  }

  function test_vote_RevertIfUnequalLengths() public {
    VoteLocalVars memory vars;

    vars.marketVote = new address[](2);
    vars.marketVoteSide = new IVoter.MarketSide[](1); // Intentionally unequal length
    vars.weights = new uint256[](2);

    vars.marketVote[0] = ethMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 100;

    vars.marketVote[1] = btcMarket;
    // vars.marketVoteSide[1] is missing to create unequal lengths
    vars.weights[1] = 200;

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("UnequalLengths()"));
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);
  }

  function test_vote_RevertIfTooManyPools() public {
    VoteLocalVars memory vars;

    // Set maxVotingNum to 10 for this test
    voter.setMaxVotingNum(10);

    vars.marketVote = new address[](11);
    vars.marketVoteSide = new IVoter.MarketSide[](11);
    vars.weights = new uint256[](11);

    for (uint256 i = 0; i < 11; i++) {
      vars.marketVote[i] = ethMarket;
      vars.marketVoteSide[i] = IVoter.MarketSide.Supply;
      vars.weights[i] = 100;
    }

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("TooManyPools()"));
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);
  }

  function test_vote_RevertIfNotWhitelistedNFT() public {
    VoteLocalVars memory vars;

    vars.marketVote = new address[](1);
    vars.marketVoteSide = new IVoter.MarketSide[](1);
    vars.weights = new uint256[](1);

    vars.marketVote[0] = ethMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 100;

    vm.warp(IonicTimeLibrary.epochStart(block.timestamp) + 1 weeks - 0.75 hours);

    // Assume voterTokenIdSingleLp is not whitelisted
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("NotWhitelistedNFT()"));
    voter.vote(voterTokenIdSingleLp, vars.marketVote, vars.marketVoteSide, vars.weights);
  }

  function test_vote_RevertIfNoRewardAccumulator() public {
    VoteLocalVars memory vars;

    vars.marketVote = new address[](1);
    vars.marketVoteSide = new IVoter.MarketSide[](1);
    vars.weights = new uint256[](1);

    // Use a market that does not have a reward accumulator set
    address nonExistentMarket = address(0xDEADBEEF);
    vars.marketVote[0] = nonExistentMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 100;

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("RewardAccumulatorDoesNotExist(address)", nonExistentMarket));
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);
  }

  function test_vote_RevertIfRewardAccumulatorNotAlive() public {
    VoteLocalVars memory vars;

    vars.marketVote = new address[](1);
    vars.marketVoteSide = new IVoter.MarketSide[](1);
    vars.weights = new uint256[](1);

    vars.marketVote[0] = ethMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 100;

    voter.toggleRewardAccumulatorAlive(vars.marketVote[0], vars.marketVoteSide[0], false);
    address accumulator = voter.marketToRewardAccumulators(vars.marketVote[0], vars.marketVoteSide[0]);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("RewardAccumulatorNotAlive(address)", accumulator));
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);
  }

  function test_vote_RevertIfZeroWeight() public {
    VoteLocalVars memory vars;

    vars.marketVote = new address[](1);
    vars.marketVoteSide = new IVoter.MarketSide[](1);
    vars.weights = new uint256[](1);

    vars.marketVote[0] = ethMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 0; // Set weight to zero to trigger the revert

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("ZeroWeight()"));
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);
  }

  function test_vote_RevertIfZeroBalance() public {
    VoteLocalVars memory vars;

    vars.marketVote = new address[](1);
    vars.marketVoteSide = new IVoter.MarketSide[](1);
    vars.weights = new uint256[](1);

    vars.marketVote[0] = ethMarket;
    vars.marketVoteSide[0] = IVoter.MarketSide.Supply;
    vars.weights[0] = 100; // Set weight to zero to trigger the revert

    // Warp time 3 years (3 * 365 * 24 * 60 * 60 seconds)
    vm.warp(block.timestamp + 3 * 365 * 86400);

    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("ZeroBalance()"));
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);
  }
}

contract Poke is VoterTest {
  address[] marketVote;
  IVoter.MarketSide[] marketVoteSide;
  uint256[] weights;

  function setUp() public {
    _setUp();

    marketVote = new address[](1);
    marketVoteSide = new IVoter.MarketSide[](1);
    weights = new uint256[](1);
    marketVote[0] = ethMarket;
    marketVoteSide[0] = IVoter.MarketSide.Supply;
    weights[0] = 100;

    vm.startPrank(user);
    voter.vote(voterTokenIdMultiLp, marketVote, marketVoteSide, weights);
    voter.vote(voterTokenIdSingleLp, marketVote, marketVoteSide, weights);
    vm.stopPrank();
  }

  function test_poke_UserCanPoke() public {
    IVoter.VoteDetails memory initialVoteDetails = voter.getVoteDetails(
      voterTokenIdMultiLp,
      address(modeVelodrome5050IonMode)
    );

    vm.warp(block.timestamp + 4 weeks);

    voter.poke(voterTokenIdMultiLp);

    IVoter.VoteDetails memory finalVoteDetails = voter.getVoteDetails(
      voterTokenIdMultiLp,
      address(modeVelodrome5050IonMode)
    );

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      assertGt(initialVoteDetails.votes[i], finalVoteDetails.votes[i], "Votes should decrease with time");
    }

    assertEq(
      initialVoteDetails.marketVotes.length,
      finalVoteDetails.marketVotes.length,
      "Market votes length should remain the same"
    );
    assertEq(
      initialVoteDetails.marketVoteSides.length,
      finalVoteDetails.marketVoteSides.length,
      "Market vote sides length should remain the same"
    );
    assertGt(initialVoteDetails.usedWeight, finalVoteDetails.usedWeight, "Used weight should decrease with time");

    for (uint256 i = 0; i < initialVoteDetails.marketVotes.length; i++) {
      assertEq(
        initialVoteDetails.marketVotes[i],
        finalVoteDetails.marketVotes[i],
        "Market votes should remain the same"
      );
      assertEq(
        uint256(initialVoteDetails.marketVoteSides[i]),
        uint256(finalVoteDetails.marketVoteSides[i]),
        "Market vote sides should remain the same"
      );
    }

    // Log initial votes and used weight
    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      console.log("Initial Votes for market", i, ":", initialVoteDetails.votes[i]);
    }
    console.log("Initial Used Weight:", initialVoteDetails.usedWeight);

    // Log final votes and used weight
    for (uint256 i = 0; i < finalVoteDetails.votes.length; i++) {
      console.log("Final Votes for market", i, ":", finalVoteDetails.votes[i]);
    }
    console.log("Final Used Weight:", finalVoteDetails.usedWeight);

    // Repeat test for balancer vote details
    IVoter.VoteDetails memory initialBalancerVoteDetails = voter.getVoteDetails(
      voterTokenIdMultiLp,
      address(modeBalancer8020IonEth)
    );

    vm.warp(block.timestamp + 4 weeks);

    voter.poke(voterTokenIdMultiLp);

    IVoter.VoteDetails memory finalBalancerVoteDetails = voter.getVoteDetails(
      voterTokenIdMultiLp,
      address(modeBalancer8020IonEth)
    );

    for (uint256 i = 0; i < initialBalancerVoteDetails.votes.length; i++) {
      assertGt(
        initialBalancerVoteDetails.votes[i],
        finalBalancerVoteDetails.votes[i],
        "Balancer votes should decrease with time"
      );
    }

    assertEq(
      initialBalancerVoteDetails.marketVotes.length,
      finalBalancerVoteDetails.marketVotes.length,
      "Balancer votes length should remain the same"
    );
    assertEq(
      initialBalancerVoteDetails.marketVoteSides.length,
      finalBalancerVoteDetails.marketVoteSides.length,
      "Balancer vote sides length should remain the same"
    );
    assertGt(
      initialBalancerVoteDetails.usedWeight,
      finalBalancerVoteDetails.usedWeight,
      "Balancer used weight should decrease with time"
    );

    for (uint256 i = 0; i < initialBalancerVoteDetails.marketVotes.length; i++) {
      assertEq(
        initialBalancerVoteDetails.marketVotes[i],
        finalBalancerVoteDetails.marketVotes[i],
        "Balancer votes should remain the same"
      );
      assertEq(
        uint256(initialBalancerVoteDetails.marketVoteSides[i]),
        uint256(finalBalancerVoteDetails.marketVoteSides[i]),
        "Balancer vote sides should remain the same"
      );
    }

    // Log initial balancer votes and used weight
    for (uint256 i = 0; i < initialBalancerVoteDetails.votes.length; i++) {
      console.log("Initial Balancer Votes for market", i, ":", initialBalancerVoteDetails.votes[i]);
    }
    console.log("Initial Balancer Used Weight:", initialBalancerVoteDetails.usedWeight);

    // Log final balancer votes and used weight
    for (uint256 i = 0; i < finalBalancerVoteDetails.votes.length; i++) {
      console.log("Final Balancer Votes for market", i, ":", finalBalancerVoteDetails.votes[i]);
    }
    console.log("Final Balancer Used Weight:", finalBalancerVoteDetails.usedWeight);
  }

  function test_poke_UserCanPokeSingleAsset() public {
    IVoter.VoteDetails memory initialVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    vm.warp(block.timestamp + 4 weeks);
    voter.poke(voterTokenIdSingleLp);

    IVoter.VoteDetails memory finalVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      console.log("Initial Market Votes for market", i, ":", initialVoteDetails.votes[i]);
    }
    console.log("Initial Used Weight:", initialVoteDetails.usedWeight);

    for (uint256 i = 0; i < finalVoteDetails.votes.length; i++) {
      console.log("Final Market Votes for market", i, ":", finalVoteDetails.votes[i]);
    }
    console.log("Final Used Weight:", finalVoteDetails.usedWeight);

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      assertGt(initialVoteDetails.votes[i], finalVoteDetails.votes[i]);
    }
  }

  function test_poke_RevertIfDistributeWindow() public {
    vm.warp(voter.epochVoteStart(block.timestamp));
    vm.expectRevert(abi.encodeWithSignature("DistributeWindow()"));
    voter.poke(voterTokenIdSingleLp);
  }

  function test_poke_UntilExpiry() public {
    vm.warp(block.timestamp + 365 * 86400);
    voter.poke(voterTokenIdSingleLp);

    IVoter.VoteDetails memory finalVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    for (uint256 i = 0; i < finalVoteDetails.votes.length; i++) {
      assertEq(finalVoteDetails.votes[i], 0, "Final votes should be zero for each market");
    }
    assertEq(finalVoteDetails.usedWeight, 0, "Final used weight should be zero");
  }

  function test_poke_AfterIncreaseAmount() public {
    IVoter.VoteDetails memory initialVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    uint256 additionalAmount = 1000 * 1e18; // Example amount to mint
    modeVelodrome5050IonMode.mint(user, additionalAmount);

    vm.startPrank(user);
    modeVelodrome5050IonMode.approve(address(ve), additionalAmount);
    ve.increaseAmount(address(modeVelodrome5050IonMode), voterTokenIdSingleLp, additionalAmount, false);
    vm.stopPrank();

    voter.poke(voterTokenIdSingleLp);

    IVoter.VoteDetails memory finalVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      console.log("Initial Market Votes for market", i, ":", initialVoteDetails.votes[i]);
    }
    console.log("Initial Used Weight:", initialVoteDetails.usedWeight);

    for (uint256 i = 0; i < finalVoteDetails.votes.length; i++) {
      console.log("Final Market Votes for market", i, ":", finalVoteDetails.votes[i]);
      assertGt(
        finalVoteDetails.votes[i],
        initialVoteDetails.votes[i],
        "Final votes should be greater than initial votes"
      );
    }
    console.log("Final Used Weight:", finalVoteDetails.usedWeight);
    assertGt(
      finalVoteDetails.usedWeight,
      initialVoteDetails.usedWeight,
      "Final used weight should be greater than initial used weight"
    );
  }

  function test_poke_AfterIncreaseUnlock() public {
    IVoter.VoteDetails memory initialVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    uint256 additionalDuration = 70 weeks;
    vm.startPrank(user);
    ve.increaseUnlockTime(address(modeVelodrome5050IonMode), voterTokenIdSingleLp, additionalDuration);
    vm.stopPrank();

    voter.poke(voterTokenIdSingleLp);

    IVoter.VoteDetails memory finalVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      console.log("Initial Market Votes for market", i, ":", initialVoteDetails.votes[i]);
    }
    console.log("Initial Used Weight:", initialVoteDetails.usedWeight);

    for (uint256 i = 0; i < finalVoteDetails.votes.length; i++) {
      console.log("Final Market Votes for market", i, ":", finalVoteDetails.votes[i]);
      assertGt(
        finalVoteDetails.votes[i],
        initialVoteDetails.votes[i],
        "Final votes should be greater than initial votes"
      );
    }
    console.log("Final Used Weight:", finalVoteDetails.usedWeight);
    assertGt(
      finalVoteDetails.usedWeight,
      initialVoteDetails.usedWeight,
      "Final used weight should be greater than initial used weight"
    );
  }

  function test_poke_AfterLockPermanent() public {
    IVoter.VoteDetails memory initialVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    vm.startPrank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), voterTokenIdSingleLp);
    vm.stopPrank();

    vm.warp(block.timestamp + 4 weeks);

    voter.poke(voterTokenIdSingleLp);

    IVoter.VoteDetails memory finalVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      console.log("Initial Market Votes for market", i, ":", initialVoteDetails.votes[i]);
    }
    console.log("Initial Used Weight:", initialVoteDetails.usedWeight);

    for (uint256 i = 0; i < finalVoteDetails.votes.length; i++) {
      console.log("Final Market Votes for market", i, ":", finalVoteDetails.votes[i]);
      assertGt(
        finalVoteDetails.votes[i],
        initialVoteDetails.votes[i],
        "Final votes should be greater than initial votes"
      );
    }
    console.log("Final Used Weight:", finalVoteDetails.usedWeight);
    assertGt(
      finalVoteDetails.usedWeight,
      initialVoteDetails.usedWeight,
      "Final used weight should be greater than initial used weight"
    );
  }

  function test_poke_AfterUnlockPermanent() public {
    IVoter.VoteDetails memory initialVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    vm.startPrank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), voterTokenIdSingleLp);
    ve.unlockPermanent(address(modeVelodrome5050IonMode), voterTokenIdSingleLp);
    vm.stopPrank();

    vm.warp(block.timestamp + 4 weeks);

    voter.poke(voterTokenIdSingleLp);

    IVoter.VoteDetails memory finalVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      console.log("Initial Market Votes for market", i, ":", initialVoteDetails.votes[i]);
    }
    console.log("Initial Used Weight:", initialVoteDetails.usedWeight);

    for (uint256 i = 0; i < finalVoteDetails.votes.length; i++) {
      console.log("Final Market Votes for market", i, ":", finalVoteDetails.votes[i]);
      assertGt(
        finalVoteDetails.votes[i],
        initialVoteDetails.votes[i],
        "Final votes should be greater than initial votes"
      );
    }
    console.log("Final Used Weight:", finalVoteDetails.usedWeight);
    assertGt(
      finalVoteDetails.usedWeight,
      initialVoteDetails.usedWeight,
      "Final used weight should be greater than initial used weight"
    );
  }

  function test_poke_AfterDelegation() public {
    IVoter.VoteDetails memory initialVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    vm.startPrank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), voterTokenIdSingleLp);
    ve.lockPermanent(address(modeVelodrome5050IonMode), voterTokenIdMultiLp);
    ve.delegate(voterTokenIdSingleLp, voterTokenIdMultiLp, address(modeVelodrome5050IonMode), 500 ether);
    vm.stopPrank();

    voter.poke(voterTokenIdSingleLp);

    IVoter.VoteDetails memory finalVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      console.log("Initial Market Votes for market", i, ":", initialVoteDetails.votes[i]);
    }
    console.log("Initial Used Weight:", initialVoteDetails.usedWeight);

    for (uint256 i = 0; i < finalVoteDetails.votes.length; i++) {
      console.log("Final Market Votes for market", i, ":", finalVoteDetails.votes[i]);
      assertGt(
        finalVoteDetails.votes[i],
        initialVoteDetails.votes[i],
        "Final votes should be greater than initial votes"
      );
    }
    console.log("Final Used Weight:", finalVoteDetails.usedWeight);
    assertGt(
      finalVoteDetails.usedWeight,
      initialVoteDetails.usedWeight,
      "Final used weight should be greater than initial used weight"
    );
  }

  function test_poke_AfterBeingDelegatedTo() public {
    IVoter.VoteDetails memory initialVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    uint256 delegatedAmount = 500 ether;

    vm.startPrank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), voterTokenIdSingleLp);
    ve.lockPermanent(address(modeVelodrome5050IonMode), voterTokenIdMultiLp);
    ve.delegate(voterTokenIdMultiLp, voterTokenIdSingleLp, address(modeVelodrome5050IonMode), delegatedAmount);
    vm.stopPrank();

    voter.poke(voterTokenIdSingleLp);

    IVoter.VoteDetails memory finalVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      console.log("Initial Market Votes for market", i, ":", initialVoteDetails.votes[i]);
    }
    console.log("Initial Used Weight:", initialVoteDetails.usedWeight);

    for (uint256 i = 0; i < finalVoteDetails.votes.length; i++) {
      console.log("Final Market Votes for market", i, ":", finalVoteDetails.votes[i]);
      assertEq(
        finalVoteDetails.votes[i],
        (voterLockInfoSingleLp.tokenAmount + delegatedAmount) * 2,
        "Final votes should be greater than initial votes"
      );
    }
    console.log("Final Used Weight:", finalVoteDetails.usedWeight);
    assertEq(
      finalVoteDetails.usedWeight,
      (voterLockInfoSingleLp.tokenAmount + delegatedAmount) * 2,
      "Final used weight should be greater than initial used weight"
    );
  }

  function test_poke_AfterRemoveDelegator() public {
    IVoter.VoteDetails memory initialVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    uint256 delegatedAmount = 500 ether;

    vm.startPrank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), voterTokenIdSingleLp);
    ve.lockPermanent(address(modeVelodrome5050IonMode), voterTokenIdMultiLp);
    ve.delegate(voterTokenIdMultiLp, voterTokenIdSingleLp, address(modeVelodrome5050IonMode), delegatedAmount);
    uint256[] memory multiLpArray = new uint256[](1);
    multiLpArray[0] = voterTokenIdMultiLp;
    uint256[] memory delegatedAmountArray = new uint256[](1);
    delegatedAmountArray[0] = delegatedAmount;
    ve.removeDelegators(multiLpArray, voterTokenIdSingleLp, address(modeVelodrome5050IonMode), delegatedAmountArray);
    vm.stopPrank();

    voter.poke(voterTokenIdSingleLp);

    IVoter.VoteDetails memory finalVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      console.log("Initial Market Votes for market", i, ":", initialVoteDetails.votes[i]);
    }
    console.log("Initial Used Weight:", initialVoteDetails.usedWeight);

    for (uint256 i = 0; i < finalVoteDetails.votes.length; i++) {
      console.log("Final Market Votes for market", i, ":", finalVoteDetails.votes[i]);
      assertEq(
        finalVoteDetails.votes[i],
        (voterLockInfoSingleLp.tokenAmount) * 2,
        "Final votes should be greater than initial votes"
      );
    }
    console.log("Final Used Weight:", finalVoteDetails.usedWeight);
    assertEq(
      finalVoteDetails.usedWeight,
      (voterLockInfoSingleLp.tokenAmount) * 2,
      "Final used weight should be greater than initial used weight"
    );
  }

  function test_poke_AfterRemoveDelegatee() external {
    IVoter.VoteDetails memory initialVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    uint256 delegateAmount = 1000 ether;
    vm.startPrank(user);
    ve.lockPermanent(address(modeVelodrome5050IonMode), voterTokenIdSingleLp);
    ve.lockPermanent(address(modeVelodrome5050IonMode), voterTokenIdMultiLp);
    ve.delegate(voterTokenIdSingleLp, voterTokenIdMultiLp, address(modeVelodrome5050IonMode), delegateAmount);
    voter.poke(voterTokenIdSingleLp);
    uint256[] memory singleLpArray = new uint256[](1);
    singleLpArray[0] = voterTokenIdMultiLp;
    uint256[] memory amountArray = new uint256[](1);
    amountArray[0] = delegateAmount;
    ve.removeDelegatees(voterTokenIdSingleLp, singleLpArray, address(modeVelodrome5050IonMode), amountArray);
    vm.stopPrank();

    IVoter.VoteDetails memory finalVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      console.log("Initial Market Votes for market", i, ":", initialVoteDetails.votes[i]);
    }
    console.log("Initial Used Weight:", initialVoteDetails.usedWeight);
    assertEq(finalVoteDetails.votes.length, 0, "Final vote details array length should be zero ");
    console.log("Final Used Weight:", finalVoteDetails.usedWeight);
    assertEq(finalVoteDetails.usedWeight, 0, "Final used weight should be greater than initial used weight");
  }

  function test_poke_AfterTransfer() external {
    IVoter.VoteDetails memory initialVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    vm.startPrank(user);
    ve.transferFrom(user, address(0x2352), voterTokenIdSingleLp);
    voter.poke(voterTokenIdSingleLp);
    vm.stopPrank();

    IVoter.VoteDetails memory finalVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      console.log("Initial Market Votes for market", i, ":", initialVoteDetails.votes[i]);
    }
    console.log("Initial Used Weight:", initialVoteDetails.usedWeight);

    for (uint256 i = 0; i < finalVoteDetails.votes.length; i++) {
      console.log("Final Market Votes for market", i, ":", finalVoteDetails.votes[i]);
    }
    console.log("Final Used Weight:", finalVoteDetails.usedWeight);
  }
}

contract Reset is VoterTest {
  address[] marketVote;
  IVoter.MarketSide[] marketVoteSide;
  uint256[] weights;

  function setUp() public {
    _setUp();

    marketVote = new address[](1);
    marketVoteSide = new IVoter.MarketSide[](1);
    weights = new uint256[](1);
    marketVote[0] = ethMarket;
    marketVoteSide[0] = IVoter.MarketSide.Supply;
    weights[0] = 100;

    vm.startPrank(user);
    voter.vote(voterTokenIdMultiLp, marketVote, marketVoteSide, weights);
    voter.vote(voterTokenIdSingleLp, marketVote, marketVoteSide, weights);
    vm.stopPrank();
  }

  function test_reset_UserCanResetSingleLpToken() public {
    vm.warp(block.timestamp + 1 weeks);
    vm.prank(user);
    voter.reset(voterTokenIdSingleLp);

    IVoter.VoteDetails memory resetVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    assertEq(resetVoteDetails.votes.length, 0, "Vote length should be reset to 0");
    console.log("Reset Used Weight:", resetVoteDetails.usedWeight);
    assertEq(resetVoteDetails.usedWeight, 0, "Used weight should be reset to 0");
  }

  function test_reset_UserCanResetMultiLpToken() public {
    vm.warp(block.timestamp + 1 weeks);
    vm.prank(user);
    voter.reset(voterTokenIdSingleLp);

    IVoter.VoteDetails memory veloVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );
    IVoter.VoteDetails memory balancerVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeBalancer8020IonEth)
    );

    assertEq(veloVoteDetails.votes.length, 0, "Vote length should be reset to 0");
    console.log("Reset Used Weight:", veloVoteDetails.usedWeight);
    assertEq(veloVoteDetails.usedWeight, 0, "Used weight should be reset to 0");

    assertEq(balancerVoteDetails.votes.length, 0, "Vote length should be reset to 0");
    console.log("Reset Used Weight:", balancerVoteDetails.usedWeight);
    assertEq(balancerVoteDetails.usedWeight, 0, "Used weight should be reset to 0");
  }

  function test_reset_RevertIfSameEpoch() public {
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("AlreadyVotedOrDeposited()"));
    voter.reset(voterTokenIdSingleLp);
  }

  function test_reset_RevertIfDistributeWindow() public {
    vm.warp(voter.epochNext(block.timestamp));
    vm.prank(user);
    vm.expectRevert(abi.encodeWithSignature("DistributeWindow()"));
    voter.reset(voterTokenIdSingleLp);
  }
}

contract DistributeRewards is VoterTest {
  address ion = 0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5;
  address weth = 0x4200000000000000000000000000000000000006;
  address ionWhale = 0x7862Ba142511eEf11a5a8b179DB4F53AC115AB59;
  address[] markets;
  IVoter.MarketSide[] sides;
  uint256[] weights;
  uint256 rewardAmount = 1_000_000 * 1e18;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();

    markets = new address[](4);
    sides = new IVoter.MarketSide[](4);
    weights = new uint256[](4);

    markets[0] = ethMarket;
    sides[0] = IVoter.MarketSide.Supply;
    weights[0] = 100;

    markets[1] = ethMarket;
    sides[1] = IVoter.MarketSide.Borrow;
    weights[1] = 100;

    markets[2] = btcMarket;
    sides[2] = IVoter.MarketSide.Supply;
    weights[2] = 100;

    markets[3] = btcMarket;
    sides[3] = IVoter.MarketSide.Borrow;
    weights[3] = 100;

    // vm.prank(user);
    // voter.vote(baseTokenIdSingleLp, markets, sides, weights);

    ion = 0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5;
    weth = 0x4200000000000000000000000000000000000006;
    UniswapLpTokenPriceOracle uniswapLpTokenPriceOracleIonWeth = new UniswapLpTokenPriceOracle(address(weth));
    UniswapLpTokenPriceOracle uniswapLpTokenPriceOracleWethAero = new UniswapLpTokenPriceOracle(address(weth));
    address[] memory underlyings = new address[](2);
    BasePriceOracle[] memory oracles = new BasePriceOracle[](2);

    underlyings[0] = address(ionWeth5050lPAero);
    oracles[0] = BasePriceOracle(address(uniswapLpTokenPriceOracleIonWeth));
    underlyings[1] = address(wethAero5050LPAero);
    oracles[1] = BasePriceOracle(address(uniswapLpTokenPriceOracleWethAero));

    vm.prank(mpo.admin());
    mpo.add(underlyings, oracles);
  }

  function test_distributeRewards_RewardsCanBeDistributed() public fork(BASE_MAINNET) {
    uint256 ionPrice = mpo.price(ion);
    uint256 wethPrice = mpo.price(weth);

    uint256 ionWethLpPrice = mpo.price(ionWeth5050lPAero);

    console.log("ION Price:", ionPrice);
    console.log("WETH Price:", wethPrice);
    console.log("ION-WETH LP Price:", ionWethLpPrice);

    vm.warp(voter.epochVoteEnd(block.timestamp) + 1);

    vm.prank(ionWhale);
    IERC20(ion).transfer(address(voter), rewardAmount);
    voter.distributeRewards();

    for (uint256 i = 0; i < markets.length; i++) {
      address rewardAccumulator = voter.marketToRewardAccumulators(markets[i], sides[i]);
      uint256 ionBalance = IERC20(ion).balanceOf(rewardAccumulator);
      console.log("ION Balance for Reward Accumulator", rewardAccumulator, ":", ionBalance);

      uint256 expectedBalance = rewardAmount / 4;
      assertEq(ionBalance, expectedBalance, "Each reward accumulator should have a quarter of the tokens");
    }
  }

  function test_distributeRewards_MultiLPAndVoters() public fork(BASE_MAINNET) {
    address[] memory voters = new address[](20);
    uint256[] memory tokenIds = new uint256[](20);
    for (uint256 i = 0; i < voters.length; i++) {
      voters[i] = address(uint160(uint256(keccak256(abi.encodePacked(i, block.timestamp)))));

      uint256 ionWethAmount = 10 + (uint256(keccak256(abi.encodePacked(i, block.timestamp))) % 11);
      uint256 wethAeroAmount = 10 + (uint256(keccak256(abi.encodePacked(i, block.timestamp, uint256(1)))) % 11);

      tokenIds[i] = _lockMultiLpFork(voters[i], ionWethAmount * 1e18, wethAeroAmount * 1e18);

      uint256[] memory weights = new uint256[](4);
      for (uint256 j = 0; j < weights.length; j++) {
        weights[j] = 1 + (uint256(keccak256(abi.encodePacked(j, block.timestamp, i))) % 100);
      }
      _vote(voters[i], tokenIds[i], weights);
    }

    for (uint256 i = 0; i < markets.length; i++) {
      uint256 marketWeightIonWeth = voter.weights(markets[i], sides[i], address(ionWeth5050lPAero));
      uint256 marketWeightWethAero = voter.weights(markets[i], sides[i], address(wethAero5050LPAero));
      console.log("-----------------------------------------------------");
      console.log("Market:", markets[i]);
      console.log("Side:", uint256(sides[i]));
      console.log("Market Weight ION-WETH:", marketWeightIonWeth);
      console.log("Market Weight WETH-AERO:", marketWeightWethAero);
    }
    console.log("-----------------------------------------------------");

    vm.warp(voter.epochVoteEnd(block.timestamp) + 1);
    vm.prank(ionWhale);
    IERC20(ion).transfer(address(voter), rewardAmount);
    voter.distributeRewards();

    for (uint256 i = 0; i < markets.length; i++) {
      address rewardAccumulator = voter.marketToRewardAccumulators(markets[i], sides[i]);
      uint256 ionBalance = IERC20(ion).balanceOf(rewardAccumulator);
      console.log("ION Balance for Reward Accumulator", rewardAccumulator, ":", ionBalance);

      uint256 expectedBalance = rewardAmount / 4;
      // assertEq(ionBalance, expectedBalance, "Each reward accumulator should have a quarter of the tokens");
    }

    // Log the price of ION-WETH LP using mpo.price
    uint256 ionWethPrice = mpo.price(address(ionWeth5050lPAero));
    console.log("Price of ION-WETH LP:", ionWethPrice);

    // Log the price of WETH-AERO LP using mpo.price
    uint256 wethAeroPrice = mpo.price(address(wethAero5050LPAero));
    console.log("Price of WETH-AERO LP:", wethAeroPrice);
  }
}

contract ClaimBribes is VoterTest {}

contract Setters is VoterTest {
  function testSetLpTokens() public {
    address[] memory newLpTokens = new address[](2);
    newLpTokens[0] = address(0x123);
    newLpTokens[1] = address(0x456);

    voter.setLpTokens(newLpTokens);

    address[] memory lpTokens = voter.getAllLpRewardTokens();
    assertEq(lpTokens.length, newLpTokens.length, "LP tokens length mismatch");
    for (uint256 i = 0; i < lpTokens.length; i++) {
      assertEq(lpTokens[i], newLpTokens[i], "LP token mismatch");
    }
  }

  function testSetMpo() public {
    address newMpo = address(0x789);
    voter.setMpo(newMpo);

    assertEq(address(voter.mpo()), newMpo, "MPO address mismatch");
  }

  function testSetGovernor() public {
    address newGovernor = address(0xABC);
    voter.setGovernor(newGovernor);

    assertEq(voter.governor(), newGovernor, "Governor address mismatch");
  }

  function testSetEpochGovernor() public {
    address newEpochGovernor = address(0xDEF);
    voter.setEpochGovernor(newEpochGovernor);

    assertEq(voter.epochGovernor(), newEpochGovernor, "Epoch Governor address mismatch");
  }

  function testSetMaxVotingNum() public {
    uint256 newMaxVotingNum = 25;
    voter.setMaxVotingNum(newMaxVotingNum);

    assertEq(voter.maxVotingNum(), newMaxVotingNum, "Max voting number mismatch");
  }

  function testWhitelistToken() public {
    address token = address(0xFED);
    voter.whitelistToken(token, true);

    assertTrue(voter.isWhitelistedToken(token), "Token should be whitelisted");
  }

  function testWhitelistNFT() public {
    uint256 tokenId = 1;
    voter.whitelistNFT(tokenId, true);

    assertTrue(voter.isWhitelistedNFT(tokenId), "NFT should be whitelisted");
  }

  function testAddMarkets() public {
    IVoter.Market[] memory newMarkets = new IVoter.Market[](2);
    newMarkets[0] = IVoter.Market(address(0x123), IVoter.MarketSide.Supply);
    newMarkets[1] = IVoter.Market(address(0x456), IVoter.MarketSide.Borrow);

    voter.addMarkets(newMarkets);

    assertEq(voter.marketsLength(), 2, "Markets length mismatch");
    (address marketAddress, IVoter.MarketSide marketSide) = voter.markets(0);
    assertEq(marketAddress, address(0x123), "First market address mismatch");
    assertEq(uint256(marketSide), uint256(IVoter.MarketSide.Supply), "First market side mismatch");

    (marketAddress, marketSide) = voter.markets(1);
    assertEq(marketAddress, address(0x456), "Second market address mismatch");
    assertEq(uint256(marketSide), uint256(IVoter.MarketSide.Borrow), "Second market side mismatch");
  }

  function testSetMarketRewardAccumulators() public {
    address[] memory marketAddresses = new address[](2);
    marketAddresses[0] = address(0x123);
    marketAddresses[1] = address(0x456);

    IVoter.MarketSide[] memory marketSides = new IVoter.MarketSide[](2);
    marketSides[0] = IVoter.MarketSide.Supply;
    marketSides[1] = IVoter.MarketSide.Borrow;

    address[] memory rewardAccumulators = new address[](2);
    rewardAccumulators[0] = address(0x789);
    rewardAccumulators[1] = address(0xABC);

    voter.setMarketRewardAccumulators(marketAddresses, marketSides, rewardAccumulators);

    assertEq(
      voter.marketToRewardAccumulators(address(0x123), IVoter.MarketSide.Supply),
      address(0x789),
      "First reward accumulator mismatch"
    );
    assertEq(
      voter.marketToRewardAccumulators(address(0x456), IVoter.MarketSide.Borrow),
      address(0xABC),
      "Second reward accumulator mismatch"
    );
  }

  function testSetBribes() public {
    address[] memory rewardAccumulators = new address[](2);
    rewardAccumulators[0] = address(0x789);
    rewardAccumulators[1] = address(0xABC);

    address[] memory bribes = new address[](2);
    bribes[0] = address(0xDEF);
    bribes[1] = address(0xFED);

    voter.setBribes(rewardAccumulators, bribes);

    assertEq(voter.rewardAccumulatorToBribe(address(0x789)), address(0xDEF), "First bribe mismatch");
    assertEq(voter.rewardAccumulatorToBribe(address(0xABC)), address(0xFED), "Second bribe mismatch");
  }
}
