// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../Utils.sol";
import "../../../veION/Voter.sol";
import "./MockBribeRewards.sol";
import { IVoter } from "../../../veION/interfaces/IVoter.sol";

contract VoterTest is veIONTest {
  Voter voter;
  LockInfo voterLockInfoSingleLp;
  LockInfoMultiple voterLockInfoMultiLp;
  uint256 voterTokenIdSingleLp;
  uint256 voterTokenIdMultiLp;
  address user;

  address ethMarket;
  address btcMarket;

  MockBribeRewards bribeEthSupply;
  MockBribeRewards bribeEthBorrow;
  MockBribeRewards bribeBtcSupply;
  MockBribeRewards bribeBtcBorrow;

  function _setUp() internal virtual override {
    super._setUp();
    voter = new Voter();
    ethMarket = _generateRandomAddress(1);
    btcMarket = _generateRandomAddress(2);

    address[] memory _tokens = new address[](2);
    _tokens[0] = address(modeVelodrome5050IonMode);
    _tokens[1] = address(modeBalancer8020IonEth);

    MasterPriceOracle _mpo = new MasterPriceOracle();
    MockERC20 mockIon = new MockERC20("Mock ION", "mION", 18);
    address _rewardToken = address(mockIon);
    address _ve = address(ve);

    voter.initialize(_tokens, _mpo, _rewardToken, _ve);

    IVoter.Market[] memory dummyMarkets = new IVoter.Market[](4);
    dummyMarkets[0] = IVoter.Market(ethMarket, IVoter.MarketSide.Supply);
    dummyMarkets[1] = IVoter.Market(ethMarket, IVoter.MarketSide.Borrow);
    dummyMarkets[2] = IVoter.Market(btcMarket, IVoter.MarketSide.Supply);
    dummyMarkets[3] = IVoter.Market(btcMarket, IVoter.MarketSide.Borrow);
    voter.addMarkets(dummyMarkets);

    address[] memory marketAddresses = new address[](4);
    IVoter.MarketSide[] memory marketSides = new IVoter.MarketSide[](4);
    address[] memory rewardAccumulators = new address[](4);
    marketAddresses[0] = ethMarket;
    marketSides[0] = IVoter.MarketSide.Supply;
    rewardAccumulators[0] = address(0x1111111111111111111111111111111111111111);
    marketAddresses[1] = ethMarket;
    marketSides[1] = IVoter.MarketSide.Borrow;
    rewardAccumulators[1] = address(0x2222222222222222222222222222222222222222);
    marketAddresses[2] = btcMarket;
    marketSides[2] = IVoter.MarketSide.Supply;
    rewardAccumulators[2] = address(0x3333333333333333333333333333333333333333);
    marketAddresses[3] = btcMarket;
    marketSides[3] = IVoter.MarketSide.Borrow;
    rewardAccumulators[3] = address(0x4444444444444444444444444444444444444444);
    voter.setMarketRewardAccumulators(marketAddresses, marketSides, rewardAccumulators);

    bribeEthSupply = new MockBribeRewards();
    bribeEthBorrow = new MockBribeRewards();
    bribeBtcSupply = new MockBribeRewards();
    bribeBtcBorrow = new MockBribeRewards();

    address[] memory rewardAccumulatorsForBribes = new address[](4);
    address[] memory bribes = new address[](4);

    rewardAccumulatorsForBribes[0] = rewardAccumulators[0];
    bribes[0] = address(bribeEthSupply);
    rewardAccumulatorsForBribes[1] = rewardAccumulators[1];
    bribes[1] = address(bribeEthBorrow);
    rewardAccumulatorsForBribes[2] = rewardAccumulators[2];
    bribes[2] = address(bribeBtcSupply);
    rewardAccumulatorsForBribes[3] = rewardAccumulators[3];
    bribes[3] = address(bribeBtcBorrow);
    voter.setBribes(rewardAccumulatorsForBribes, bribes);

    voter.setMaxVotingNum(20);
    address[] memory lpTokens = new address[](2);
    lpTokens[0] = address(modeVelodrome5050IonMode);
    lpTokens[1] = address(modeBalancer8020IonEth);

    voter.setLpTokens(lpTokens);
    user = address(0x9523);
    vm.warp(block.timestamp + 10 * 365 days);

    voterLockInfoSingleLp = _createLockInternal(user);
    voterLockInfoMultiLp = _createLockMultipleInternal(user);

    voterTokenIdSingleLp = voterLockInfoSingleLp.tokenId;
    voterTokenIdMultiLp = voterLockInfoMultiLp.tokenId;

    ve.setVoter(address(voter));
  }
}
