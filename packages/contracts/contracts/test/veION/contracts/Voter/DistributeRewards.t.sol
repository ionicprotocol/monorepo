// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./utils/VoterUtils.sol";
import { UniswapLpTokenPriceOracle } from "../../../../oracles/default/UniswapLpTokenPriceOracle.sol";
import { BasePriceOracle } from "../../../../oracles/BasePriceOracle.sol";

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
    vm.prank(baseUser);
    voter.vote(baseTokenIdSingleLp, markets, sides, weights);
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
