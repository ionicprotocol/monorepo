// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../../../Utils.sol";
import "../../../../../veION/Voter.sol";
import "../mocks/MockBribeRewards.sol";
import { IVoter } from "../../../../../veION/interfaces/IVoter.sol";
import { RewardAccumulator } from "../../../../../veION/RewardAccumulator.sol";

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

  MasterPriceOracle mpo;

  function _setUp() internal virtual override {
    super._setUp();
    ethMarket = _generateRandomAddress(1);
    btcMarket = _generateRandomAddress(2);

    address[] memory _tokens = new address[](2);
    _tokens[0] = address(modeVelodrome5050IonMode);
    _tokens[1] = address(modeBalancer8020IonEth);

    MasterPriceOracle _mpo = new MasterPriceOracle();
    MockERC20 mockIon = new MockERC20("Mock ION", "mION", 18);
    address _rewardToken = address(mockIon);
    address _ve = address(ve);

    voter = Voter(
      address(
        new TransparentUpgradeableProxy(
          address(new Voter()),
          address(new ProxyAdmin()),
          abi.encodeWithSelector(Voter.initialize.selector, _tokens, _mpo, _rewardToken, _ve)
        )
      )
    );

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
    marketAddresses[1] = ethMarket;
    marketSides[1] = IVoter.MarketSide.Borrow;
    marketAddresses[2] = btcMarket;
    marketSides[2] = IVoter.MarketSide.Supply;
    marketAddresses[3] = btcMarket;
    marketSides[3] = IVoter.MarketSide.Borrow;

    for (uint i = 0; i < 4; i++) {
      RewardAccumulator newRewardAccumulator = new RewardAccumulator();
      rewardAccumulators[i] = address(newRewardAccumulator);
    }

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

  function afterForkSetUp() internal virtual override {
    _afterForkSetUpBase();

    ethMarket = 0x49420311B518f3d0c94e897592014de53831cfA3;
    btcMarket = 0x1De166df671AE6DB4C4C98903df88E8007593748;

    address[] memory _tokens = new address[](1);
    _tokens[0] = address(0x0FAc819628a7F612AbAc1CaD939768058cc0170c);

    mpo = MasterPriceOracle(0x1D89E5ba287E67AC0046D2218Be5fE1382cE47b4);
    IERC20 ion = IERC20(0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5);

    voter = Voter(
      address(
        new TransparentUpgradeableProxy(
          address(new Voter()),
          address(new ProxyAdmin()),
          abi.encodeWithSelector(Voter.initialize.selector, _tokens, mpo, address(ion), address(ve))
        )
      )
    );

    IVoter.Market[] memory markets = new IVoter.Market[](4);
    markets[0] = IVoter.Market(ethMarket, IVoter.MarketSide.Supply);
    markets[1] = IVoter.Market(ethMarket, IVoter.MarketSide.Borrow);
    markets[2] = IVoter.Market(btcMarket, IVoter.MarketSide.Supply);
    markets[3] = IVoter.Market(btcMarket, IVoter.MarketSide.Borrow);
    voter.addMarkets(markets);

    address[] memory marketAddresses = new address[](4);
    IVoter.MarketSide[] memory marketSides = new IVoter.MarketSide[](4);
    address[] memory rewardAccumulators = new address[](4);
    marketAddresses[0] = ethMarket;
    marketSides[0] = IVoter.MarketSide.Supply;
    marketAddresses[1] = ethMarket;
    marketSides[1] = IVoter.MarketSide.Borrow;
    marketAddresses[2] = btcMarket;
    marketSides[2] = IVoter.MarketSide.Supply;
    marketAddresses[3] = btcMarket;
    marketSides[3] = IVoter.MarketSide.Borrow;

    for (uint i = 0; i < 4; i++) {
      RewardAccumulator newRewardAccumulator = new RewardAccumulator();
      rewardAccumulators[i] = address(newRewardAccumulator);
    }

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
    lpTokens[0] = address(ionWeth5050lPAero);
    lpTokens[1] = address(wethAero5050LPAero);
    voter.setLpTokens(lpTokens);

    ve.setVoter(address(voter));

    baseTokenIdSingleLp = _lockSingleLPFork(baseUser, REAL_LP_LOCK_AMOUNT);
  }

  function _vote(address _user, uint256 _tokenId, uint256[] memory weights) internal {
    address[] memory selectedMarkets = new address[](4);
    IVoter.MarketSide[] memory selectedSides = new IVoter.MarketSide[](4);
    uint256[] memory selectedWeights = new uint256[](4);

    selectedMarkets[0] = ethMarket;
    selectedSides[0] = IVoter.MarketSide.Supply;
    selectedWeights[0] = weights[0];

    selectedMarkets[1] = btcMarket;
    selectedSides[1] = IVoter.MarketSide.Supply;
    selectedWeights[1] = weights[1];

    selectedMarkets[2] = ethMarket;
    selectedSides[2] = IVoter.MarketSide.Borrow;
    selectedWeights[2] = weights[2];

    selectedMarkets[3] = btcMarket;
    selectedSides[3] = IVoter.MarketSide.Borrow;
    selectedWeights[3] = weights[3];

    vm.prank(_user);
    voter.vote(_tokenId, selectedMarkets, selectedSides, selectedWeights);
  }
}
