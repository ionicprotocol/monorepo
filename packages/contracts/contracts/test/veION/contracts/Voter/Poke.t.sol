// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./utils/VoterUtils.sol";
import { UniswapLpTokenPriceOracle } from "../../../../oracles/default/UniswapLpTokenPriceOracle.sol";
import { BasePriceOracle } from "../../../../oracles/BasePriceOracle.sol";

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
    // assertEq(finalVoteDetails.votes.length, 0, "Final vote details array length should be zero ");
    console.log("Final Used Weight:", finalVoteDetails.usedWeight);
    // assertEq(finalVoteDetails.usedWeight, 0, "Final used weight should be greater than initial used weight");
  }

  function test_poke_AfterTransfer() external {
    IVoter.VoteDetails memory initialVoteDetails = voter.getVoteDetails(
      voterTokenIdSingleLp,
      address(modeVelodrome5050IonMode)
    );

    vm.warp(block.timestamp + 10 weeks);

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

    for (uint256 i = 0; i < initialVoteDetails.votes.length; i++) {
      assertGt(
        initialVoteDetails.votes[i],
        finalVoteDetails.votes[i],
        "Initial votes should be greater than final votes"
      );
    }
    assertGt(
      initialVoteDetails.usedWeight,
      finalVoteDetails.usedWeight,
      "Initial used weight should be greater than final used weight"
    );
  }
}
