// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./utils/VoterUtils.sol";
import { UniswapLpTokenPriceOracle } from "../../../../oracles/default/UniswapLpTokenPriceOracle.sol";
import { BasePriceOracle } from "../../../../oracles/BasePriceOracle.sol";

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

  function test_vote_VoteThenDelegateShouldPokeAccordingly() public {
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

    address user2 = address(0x23512);
    LockInfo memory lockInfo2 = _createLockInternal(user2);

    vm.prank(user);
    ve.lockPermanent(veloLpType, voterTokenIdMultiLp);
    vm.prank(user2);
    ve.lockPermanent(veloLpType, lockInfo2.tokenId);

    vm.prank(user);
    voter.vote(voterTokenIdMultiLp, vars.marketVote, vars.marketVoteSide, vars.weights);

    vm.prank(user2);
    voter.vote(lockInfo2.tokenId, vars.marketVote, vars.marketVoteSide, vars.weights);

    IVoter.VoteDetails memory voteDetails = voter.getVoteDetails(
      voterTokenIdMultiLp,
      address(modeVelodrome5050IonMode)
    );
    IVoter.VoteDetails memory voteDetails2 = voter.getVoteDetails(lockInfo2.tokenId, address(modeVelodrome5050IonMode));

    for (uint256 i; i < voteDetails.marketVotes.length; i++) {
      console.log("Market Votes 1");
      console.log("Market Vote", voteDetails.marketVotes[i]);
      console.log("Market Vote Side", uint256(voteDetails.marketVoteSides[i]));
      console.log("Weight", voteDetails.votes[i]);
      console.log("---------------------------------------");
    }
    console.log("======================================");
    for (uint256 i; i < voteDetails2.marketVotes.length; i++) {
      console.log("Market Votes 2");
      console.log("Market Vote", voteDetails2.marketVotes[i]);
      console.log("Market Vote Side", uint256(voteDetails2.marketVoteSides[i]));
      console.log("Weight", voteDetails2.votes[i]);
      console.log("---------------------------------------");
    }
    console.log("============================================================================");

    vm.prank(user);
    ve.delegate(voterTokenIdMultiLp, lockInfo2.tokenId, veloLpType, MINT_AMT / 2);

    voteDetails = voter.getVoteDetails(voterTokenIdMultiLp, address(modeVelodrome5050IonMode));
    voteDetails2 = voter.getVoteDetails(lockInfo2.tokenId, address(modeVelodrome5050IonMode));

    for (uint256 i; i < voteDetails.marketVotes.length; i++) {
      console.log("Market Votes 3");
      console.log("Market Vote", voteDetails.marketVotes[i]);
      console.log("Market Vote Side", uint256(voteDetails.marketVoteSides[i]));
      console.log("Weight", voteDetails.votes[i]);
      console.log("---------------------------------------");
    }
    console.log("======================================");
    for (uint256 i; i < voteDetails2.marketVotes.length; i++) {
      console.log("Market Votes 4");
      console.log("Market Vote", voteDetails2.marketVotes[i]);
      console.log("Market Vote Side", uint256(voteDetails2.marketVoteSides[i]));
      console.log("Weight", voteDetails2.votes[i]);
      console.log("---------------------------------------");
    }

    assertEq(voteDetails.votes[0], 333333333333333333333, "First market votes should be lower");
    assertEq(voteDetails.votes[1], 666666666666666666666, "Second market votes should be lower");

    assertEq(voteDetails2.votes[0], 1000000000000000000000, "First market votes should be higher");
    assertEq(voteDetails2.votes[1], 2000000000000000000000, "Second market votes should be higher");

    uint256[] memory toTokenIds = new uint256[](1);
    toTokenIds[0] = lockInfo2.tokenId;

    uint256[] memory amounts = new uint256[](1);
    amounts[0] = type(uint256).max;

    vm.prank(user);
    ve.removeDelegatees(voterTokenIdMultiLp, toTokenIds, veloLpType, amounts);
    // voter.poke(lockInfo2.tokenId);

    voteDetails = voter.getVoteDetails(voterTokenIdMultiLp, address(modeVelodrome5050IonMode));
    voteDetails2 = voter.getVoteDetails(lockInfo2.tokenId, address(modeVelodrome5050IonMode));

    (address[] memory assets, uint256[] memory balances, uint256[] memory boosts) = ve.balanceOfNFT(lockInfo2.tokenId);
    for (uint256 i; i < assets.length; i++) {
      console.log("Assets", assets[i]);
      console.log("Balances", balances[i]);
      console.log("Boosts", boosts[i]);
    }

    // (assets, balances, boosts) = ve.balanceOfNFT(voterTokenIdMultiLp);
    // for (uint256 i; i < assets.length; i++) {
    //   console.log("Assets", assets[i]);
    //   console.log("Balances", balances[i]);
    //   console.log("Boosts", boosts[i]);
    // }

    for (uint256 i; i < voteDetails.marketVotes.length; i++) {
      console.log("Market Votes 5");
      console.log("Market Vote", voteDetails.marketVotes[i]);
      console.log("Market Vote Side", uint256(voteDetails.marketVoteSides[i]));
      console.log("Weight", voteDetails.votes[i]);
      console.log("---------------------------------------");
    }
    console.log("======================================");
    for (uint256 i; i < voteDetails2.marketVotes.length; i++) {
      console.log("Market Votes 6");
      console.log("Market Vote", voteDetails2.marketVotes[i]);
      console.log("Market Vote Side", uint256(voteDetails2.marketVoteSides[i]));
      console.log("Weight", voteDetails2.votes[i]);
      console.log("---------------------------------------");
    }

    assertEq(voteDetails.votes[0], 666666666666666666666, "First market votes should be lower");
    assertEq(voteDetails.votes[1], 1333333333333333333333, "Second market votes should be lower");

    assertEq(voteDetails2.votes[0], 666666666666666666666, "First market votes should be higher");
    assertEq(voteDetails2.votes[1], 1333333333333333333333, "Second market votes should be higher");
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
}
