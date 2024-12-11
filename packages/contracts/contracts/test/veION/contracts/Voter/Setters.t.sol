// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./utils/VoterUtils.sol";
import { UniswapLpTokenPriceOracle } from "../../../../oracles/default/UniswapLpTokenPriceOracle.sol";
import { BasePriceOracle } from "../../../../oracles/BasePriceOracle.sol";

contract Setters is VoterTest {
  function setUp() public {
    _setUp();
  }

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

  function testSetLpTokensRevertEmptyArray() public {
    // Test revert case: setting empty LP tokens array
    address[] memory emptyLpTokens = new address[](0);
    vm.expectRevert("LpTokens array cannot be empty");
    voter.setLpTokens(emptyLpTokens);
  }

  function testSetMpo() public {
    address newMpo = address(0x789);
    voter.setMpo(newMpo);

    assertEq(address(voter.mpo()), newMpo, "MPO address mismatch");
  }

  function testSetMpoRevertZeroAddress() public {
    // Test revert case: setting MPO to zero address
    vm.expectRevert(abi.encodeWithSignature("ZeroAddress()"));
    voter.setMpo(address(0));
  }

  function testSetGovernor() public {
    address newGovernor = address(0xABC);
    voter.setGovernor(newGovernor);

    assertEq(voter.governor(), newGovernor, "Governor address mismatch");
  }

  function testSetGovernorRevertZeroAddress() public {
    // Test revert case: setting Governor to zero address
    vm.expectRevert(abi.encodeWithSignature("ZeroAddress()"));
    voter.setGovernor(address(0));
  }

  function testSetEpochGovernor() public {
    address newEpochGovernor = address(0xDEF);
    voter.setEpochGovernor(newEpochGovernor);

    assertEq(voter.epochGovernor(), newEpochGovernor, "Epoch Governor address mismatch");
  }

  function testSetEpochGovernorRevertZeroAddress() public {
    // Test revert case: setting Epoch Governor to zero address
    vm.expectRevert(abi.encodeWithSignature("ZeroAddress()"));
    voter.setEpochGovernor(address(0));
  }

  function testSetMaxVotingNum() public {
    uint256 newMaxVotingNum = 25;
    voter.setMaxVotingNum(newMaxVotingNum);

    assertEq(voter.maxVotingNum(), newMaxVotingNum, "Max voting number mismatch");
  }

  function testSetMaxVotingNumRevertTooLow() public {
    // Test revert case: setting MaxVotingNum below minimum
    vm.expectRevert(abi.encodeWithSignature("MaximumVotingNumberTooLow()"));
    voter.setMaxVotingNum(5);
  }

  function testSetMaxVotingNumRevertSameValue() public {
    uint256 newMaxVotingNum = 25;
    voter.setMaxVotingNum(newMaxVotingNum);

    // Test revert case: setting MaxVotingNum to the same value
    vm.expectRevert(abi.encodeWithSignature("SameValue()"));
    voter.setMaxVotingNum(newMaxVotingNum);
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

    assertEq(voter.marketsLength(), 6, "Markets length mismatch");
    (address marketAddress, IVoter.MarketSide marketSide) = voter.markets(4);
    assertEq(marketAddress, address(0x123), "First market address mismatch");
    assertEq(uint256(marketSide), uint256(IVoter.MarketSide.Supply), "First market side mismatch");

    (marketAddress, marketSide) = voter.markets(5);
    assertEq(marketAddress, address(0x456), "Second market address mismatch");
    assertEq(uint256(marketSide), uint256(IVoter.MarketSide.Borrow), "Second market side mismatch");
  }

  function testAddMarketsRevertMarketExists() public {
    IVoter.Market[] memory newMarkets = new IVoter.Market[](2);
    newMarkets[0] = IVoter.Market(address(0x123), IVoter.MarketSide.Supply);
    newMarkets[1] = IVoter.Market(address(0x456), IVoter.MarketSide.Borrow);

    voter.addMarkets(newMarkets);

    // Test revert case: adding an existing market
    vm.expectRevert(abi.encodeWithSignature("MarketAlreadyExists()"));
    voter.addMarkets(newMarkets);
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

  function testSetMarketRewardAccumulatorsRevertMismatchedLengths() public {
    address[] memory marketAddresses = new address[](2);
    marketAddresses[0] = address(0x123);
    marketAddresses[1] = address(0x456);

    IVoter.MarketSide[] memory marketSides = new IVoter.MarketSide[](2);
    marketSides[0] = IVoter.MarketSide.Supply;
    marketSides[1] = IVoter.MarketSide.Borrow;

    address[] memory shortRewardAccumulators = new address[](1);
    shortRewardAccumulators[0] = address(0x789);

    // Test revert case: mismatched array lengths
    vm.expectRevert(abi.encodeWithSignature("MismatchedArrayLengths()"));
    voter.setMarketRewardAccumulators(marketAddresses, marketSides, shortRewardAccumulators);
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

  function testSetBribesRevertMismatchedLengths() public {
    address[] memory rewardAccumulators = new address[](2);
    rewardAccumulators[0] = address(0x789);
    rewardAccumulators[1] = address(0xABC);

    address[] memory shortBribes = new address[](1);
    shortBribes[0] = address(0xDEF);

    // Test revert case: mismatched array lengths
    vm.expectRevert(abi.encodeWithSignature("MismatchedArrayLengths()"));
    voter.setBribes(rewardAccumulators, shortBribes);
  }
}
