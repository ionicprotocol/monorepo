// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./utils/VoterUtils.sol";
import { UniswapLpTokenPriceOracle } from "../../../../oracles/default/UniswapLpTokenPriceOracle.sol";
import { BasePriceOracle } from "../../../../oracles/BasePriceOracle.sol";

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
