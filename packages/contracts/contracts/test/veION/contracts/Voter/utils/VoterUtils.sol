// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../../../Utils.sol";
import "../../../../../veION/Voter.sol";
import "../mocks/MockBribeRewards.sol";
import { IVoter } from "../../../../../veION/interfaces/IVoter.sol";

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

  uint256 baseTokenIdSingleLp;

  MasterPriceOracle mpo;

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

  // could leverage afterForkSetupBase from Util
  function afterForkSetUp() internal virtual override {
    ve = new veION();
    ve.initialize(ap);

    ionWeth5050lPAero = 0x0FAc819628a7F612AbAc1CaD939768058cc0170c;
    wethAero5050LPAero = 0x7f670f78B17dEC44d5Ef68a48740b6f8849cc2e6;

    address[] memory whitelistedTokens = new address[](2);
    bool[] memory isWhitelistedTokens = new bool[](2);
    whitelistedTokens[0] = ionWeth5050lPAero;
    isWhitelistedTokens[0] = true;
    whitelistedTokens[1] = wethAero5050LPAero;
    isWhitelistedTokens[1] = true;

    ve.whitelistTokens(whitelistedTokens, isWhitelistedTokens);
    ve.setLpTokenType(ionWeth5050lPAero, IveION.LpTokenType.Base_Aerodrome_5050_ION_wstETH);
    ve.setLpTokenType(wethAero5050LPAero, IveION.LpTokenType.Base_Balancer_8020_ION_ETH);

    ve.setMaxEarlyWithdrawFee(EARLY_WITHDRAW_FEE);
    ve.setMinimumLockDuration(MINTIME);
    ve.setMinimumLockAmount(address(ionWeth5050lPAero), MINIMUM_LOCK_AMOUNT);
    ve.setMinimumLockAmount(address(wethAero5050LPAero), MINIMUM_LOCK_AMOUNT);

    ethMarket = 0x49420311B518f3d0c94e897592014de53831cfA3;
    btcMarket = 0x1De166df671AE6DB4C4C98903df88E8007593748;

    address[] memory _tokens = new address[](1);
    _tokens[0] = address(0x0FAc819628a7F612AbAc1CaD939768058cc0170c);

    mpo = MasterPriceOracle(0x1D89E5ba287E67AC0046D2218Be5fE1382cE47b4);
    IERC20 ion = IERC20(0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5);

    voter = new Voter();
    voter.initialize(_tokens, mpo, address(ion), address(ve));

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
    lpTokens[0] = address(ionWeth5050lPAero);
    lpTokens[1] = address(wethAero5050LPAero);
    voter.setLpTokens(lpTokens);

    user = address(0x9523);
    ve.setVoter(address(voter));

    baseTokenIdSingleLp = _lockSingleLPFork(user, REAL_LP_LOCK_AMOUNT);
  }

  function _lockSingleLPFork(address _user, uint256 _amount) internal returns (uint256) {
    address whale = 0x9b42e5F8c45222b2715F804968251c747c588fd7;
    vm.prank(whale);
    IERC20(ionWeth5050lPAero).transfer(_user, _amount);

    address[] memory tokenAddresses = new address[](1);
    uint256[] memory tokenAmounts = new uint256[](1);
    uint256[] memory durations = new uint256[](1);
    bool[] memory stakeUnderlying = new bool[](1);
    tokenAddresses[0] = address(ionWeth5050lPAero);
    tokenAmounts[0] = _amount;
    durations[0] = 52 weeks;
    stakeUnderlying[0] = false;

    vm.startPrank(_user);
    IERC20(ionWeth5050lPAero).approve(address(ve), _amount);
    uint256 tokenId = ve.createLock(tokenAddresses, tokenAmounts, durations, stakeUnderlying);
    vm.stopPrank();

    return tokenId;
  }

  function _lockMultiLpFork(address _user, uint256 _amountIonWeth, uint256 _amountWethAERO) internal returns (uint256) {
    address ionWethWhale = 0x9b42e5F8c45222b2715F804968251c747c588fd7;
    address wethAEROWhale = 0x96a24aB830D4ec8b1F6f04Ceac104F1A3b211a01;

    vm.prank(ionWethWhale);
    IERC20(ionWeth5050lPAero).transfer(_user, _amountIonWeth);
    vm.prank(wethAEROWhale);
    IERC20(wethAero5050LPAero).transfer(_user, _amountWethAERO);

    address[] memory tokenAddresses = new address[](2);
    uint256[] memory tokenAmounts = new uint256[](2);
    uint256[] memory durations = new uint256[](2);
    bool[] memory stakeUnderlying = new bool[](2);
    tokenAddresses[0] = address(ionWeth5050lPAero);
    tokenAmounts[0] = _amountIonWeth;
    durations[0] = 52 weeks;
    stakeUnderlying[0] = false;
    tokenAddresses[1] = address(wethAero5050LPAero);
    tokenAmounts[1] = _amountWethAERO;
    durations[1] = 52 weeks;
    stakeUnderlying[1] = false;

    vm.startPrank(_user);
    IERC20(ionWeth5050lPAero).approve(address(ve), _amountIonWeth);
    IERC20(wethAero5050LPAero).approve(address(ve), _amountWethAERO);
    uint256 tokenId = ve.createLock(tokenAddresses, tokenAmounts, durations, stakeUnderlying);
    vm.stopPrank();

    return tokenId;
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
