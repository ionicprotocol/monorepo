// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../Utils.sol";
import "../../../veION/Voter.sol";

contract VoterTest is veIONTest {
  Voter voter;
  function _setUp() internal {
    voter = new Voter();

    address[] memory _tokens = new address[](2);
    _tokens[0] = address(modeVelodrome5050IonMode);
    _tokens[1] = address(modeBalancer8020IonEth);

    MasterPriceOracle _mpo = new MasterPriceOracle();
    MockERC20 mockIon = new MockERC20("Mock ION", "mION", 18);
    address _rewardToken = address(mockIon);
    address _ve = address(ve);

    voter.initialize(_tokens, _mpo, _rewardToken, _ve);

    Market[] memory dummyMarkets = new Market[](4);
    dummyMarkets[0] = Market(address(0x123), MarketSide.Supply);
    dummyMarkets[1] = Market(address(0x123), MarketSide.Borrow);
    dummyMarkets[2] = Market(address(0x789), MarketSide.Supply);
    dummyMarkets[3] = Market(address(0x789), MarketSide.Borrow);
    voter.addMarkets(dummyMarkets);

    address[] memory marketAddresses = new address[](4);
    MarketSide[] memory marketSides = new MarketSide[](4);
    address[] memory rewardAccumulators = new address[](4);
    marketAddresses[0] = dummyMarkets[0].marketAddress;
    marketSides[0] = dummyMarkets[0].side;
    rewardAccumulators[0] = address(0x1111111111111111111111111111111111111111);
    marketAddresses[1] = dummyMarkets[1].marketAddress;
    marketSides[1] = dummyMarkets[1].side;
    rewardAccumulators[1] = address(0x2222222222222222222222222222222222222222);
    marketAddresses[2] = dummyMarkets[2].marketAddress;
    marketSides[2] = dummyMarkets[2].side;
    rewardAccumulators[2] = address(0x3333333333333333333333333333333333333333);
    marketAddresses[3] = dummyMarkets[3].marketAddress;
    marketSides[3] = dummyMarkets[3].side;
    rewardAccumulators[3] = address(0x4444444444444444444444444444444444444444);
    voter.setMarketRewardAccumulators(marketAddresses, marketSides, rewardAccumulators);

    address[] memory rewardAccumulatorsForBribes = new address[](4);
    address[] memory bribes = new address[](4);
    rewardAccumulatorsForBribes[0] = rewardAccumulators[0];
    bribes[0] = address(0x5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A5A);
    rewardAccumulatorsForBribes[1] = rewardAccumulators[1];
    bribes[1] = address(0x6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B);
    rewardAccumulatorsForBribes[2] = rewardAccumulators[2];
    bribes[2] = address(0x7C7C7C7C7C7C7C7C7C7C7C7C7C7C7C7C7C7C7C7C);
    rewardAccumulatorsForBribes[3] = rewardAccumulators[3];
    bribes[3] = address(0x8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D);
    voter.setBribes(rewardAccumulatorsForBribes, bribes);

    voter.setMaxVotingNum(20);
  }
}
