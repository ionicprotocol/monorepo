// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./VoterUtils.sol";

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

    (
      address[] memory marketVotes,
      IVoter.MarketSide[] memory marketVoteSides,
      uint256[] memory votes,
      uint256 usedWeight
    ) = voter.getVoteDetails(voterTokenIdSingleLp, address(modeVelodrome5050IonMode));

    uint256 effectiveVotingPower = (votingLPBalances[0] * boosts[0]) / 1e18;
    uint256 totalWeight = _weights[0] + _weights[1];

    for (uint256 i = 0; i < marketVotes.length; i++) {
      assertEq(marketVotes[i], _marketVote[i], "Market Vote should be applied");
      assertEq(uint256(marketVoteSides[i]), uint256(_marketVoteSide[i]), "Market Vote Side should be applied");
      assertEq(
        votes[i],
        (effectiveVotingPower * _weights[i]) / totalWeight,
        "User's vote should be in accordance with weight"
      );
    }

    assertApproxEqRel(usedWeight, effectiveVotingPower, 0.001e18, "Used weight should be all voting power");

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

    (vars.marketVotesVelo, vars.marketVoteSidesVelo, vars.votesVelo, vars.usedWeightVelo) = voter.getVoteDetails(
      voterTokenIdMultiLp,
      address(modeVelodrome5050IonMode)
    );

    (vars.marketVotesBalancer, vars.marketVoteSidesBalancer, vars.votesBalancer, vars.usedWeightBalancer) = voter
      .getVoteDetails(voterTokenIdMultiLp, address(modeBalancer8020IonEth));

    console.log("==================================Velo LP Vote Details==================================:");
    for (uint256 i = 0; i < vars.marketVotesVelo.length; i++) {
      console.log("===================VOTE====================");
      console.log("Market:", vars.marketVotesVelo[i]);
      console.log("Market Side:", uint256(vars.marketVoteSidesVelo[i]));
      console.log("Votes:", vars.votesVelo[i]);
    }
    console.log("Used Weight Velo:", vars.usedWeightVelo);
    console.log("-----------------------------------------------------------------------------------------");

    console.log("==================================Balancer LP Vote Details==================================:");
    for (uint256 i = 0; i < vars.marketVotesBalancer.length; i++) {
      console.log("===================VOTE====================");
      console.log("Market:", vars.marketVotesBalancer[i]);
      console.log("Market Side:", uint256(vars.marketVoteSidesBalancer[i]));
      console.log("Votes:", vars.votesBalancer[i]);
    }
    console.log("Used Weight Balancer:", vars.usedWeightBalancer);

    vars.effectiveVotingPowerVelo = (vars.votingLPBalances[0] * vars.boosts[0]) / 1e18;
    vars.totalWeightVelo = vars.weights[0] + vars.weights[1];

    vars.effectiveVotingPowerBalancer = (vars.votingLPBalances[1] * vars.boosts[1]) / 1e18;
    vars.totalWeightBalancer = vars.weights[0] + vars.weights[1];

    for (uint256 i = 0; i < vars.marketVotesVelo.length; i++) {
      assertEq(vars.marketVotesVelo[i], vars.marketVote[i], "Market Vote should be applied");
      assertEq(
        uint256(vars.marketVoteSidesVelo[i]),
        uint256(vars.marketVoteSide[i]),
        "Market Vote Side should be applied"
      );
      assertEq(vars.votesVelo[i], (vars.effectiveVotingPowerVelo * vars.weights[i]) / vars.totalWeightVelo);
    }

    assertApproxEqRel(
      vars.usedWeightVelo,
      vars.effectiveVotingPowerVelo,
      0.001e18,
      "Used weight should be all voting power"
    );

    for (uint256 i = 0; i < vars.marketVotesBalancer.length; i++) {
      assertEq(vars.marketVotesBalancer[i], vars.marketVote[i], "Market Vote should be applied");
      assertEq(
        uint256(vars.marketVoteSidesBalancer[i]),
        uint256(vars.marketVoteSide[i]),
        "Market Vote Side should be applied"
      );
      assertEq(vars.votesBalancer[i], (vars.effectiveVotingPowerBalancer * vars.weights[i]) / vars.totalWeightBalancer);
    }

    assertApproxEqRel(
      vars.usedWeightBalancer,
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

    (vars.marketVotesVelo, vars.marketVoteSidesVelo, vars.votesVelo, vars.usedWeightVelo) = voter.getVoteDetails(
      voterTokenIdMultiLp,
      address(modeVelodrome5050IonMode)
    );

    (vars.marketVotesBalancer, vars.marketVoteSidesBalancer, vars.votesBalancer, vars.usedWeightBalancer) = voter
      .getVoteDetails(voterTokenIdMultiLp, address(modeBalancer8020IonEth));

    vars.effectiveVotingPowerVelo = (vars.votingLPBalances[0] * vars.boosts[0]) / 1e18;
    vars.totalWeightVelo = vars.weights[0] + vars.weights[1];

    vars.effectiveVotingPowerBalancer = (vars.votingLPBalances[1] * vars.boosts[1]) / 1e18;
    vars.totalWeightBalancer = vars.weights[0] + vars.weights[1];

    // Display vote details for Velodrome
    console.log("Velodrome Market Votes:");
    for (uint256 i = 0; i < vars.marketVotesVelo.length; i++) {
      console.log("Market:", vars.marketVotesVelo[i]);
      console.log("Market Side:", uint256(vars.marketVoteSidesVelo[i]));
      console.log("Votes:", vars.votesVelo[i]);
      assertEq(vars.marketVotesVelo[i], vars.marketVote[i], "Market Vote should be applied");
      assertEq(
        uint256(vars.marketVoteSidesVelo[i]),
        uint256(vars.marketVoteSide[i]),
        "Market Vote Side should be applied"
      );
      assertEq(vars.votesVelo[i], (vars.effectiveVotingPowerVelo * vars.weights[i]) / vars.totalWeightVelo);
    }
    console.log("Used Weight for Velodrome:", vars.usedWeightVelo);

    console.log("--------------------------------------------------------------");
    // Display vote details for Balancer
    console.log("Balancer Market Votes:");
    for (uint256 i = 0; i < vars.marketVotesBalancer.length; i++) {
      console.log("Market:", vars.marketVotesBalancer[i]);
      console.log("Market Side:", uint256(vars.marketVoteSidesBalancer[i]));
      console.log("Votes:", vars.votesBalancer[i]);

      assertEq(vars.marketVotesBalancer[i], vars.marketVote[i], "Market Vote should be applied");
      assertEq(
        uint256(vars.marketVoteSidesBalancer[i]),
        uint256(vars.marketVoteSide[i]),
        "Market Vote Side should be applied"
      );
      assertEq(vars.votesBalancer[i], (vars.effectiveVotingPowerBalancer * vars.weights[i]) / vars.totalWeightBalancer);
    }
    console.log("Used Weight for Balancer:", vars.usedWeightBalancer);
  }

  function test_vote_RevertIfSameEpoch() public {}
}

contract Poke is VoterTest {}

contract Reset is VoterTest {}

contract ClaimBribes is VoterTest {}

contract DistributeRewards is VoterTest {}

contract SetGovernorTest is VoterTest {}

contract SetEpochGovernorTest is VoterTest {}

contract SetMarketRewardAccumulatorsTest is VoterTest {}

contract SetBribesTest is VoterTest {}

contract SetMaxVotingNumTest is VoterTest {}

contract AddMarketsTest is VoterTest {}
