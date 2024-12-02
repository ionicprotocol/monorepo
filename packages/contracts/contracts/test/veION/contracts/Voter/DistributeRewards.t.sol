// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./utils/VoterUtils.sol";
import { UniswapLpTokenPriceOracle } from "../../../../oracles/default/UniswapLpTokenPriceOracle.sol";
import { BasePriceOracle } from "../../../../oracles/BasePriceOracle.sol";
import { PoolDirectory } from "../../../../PoolDirectory.sol";
import { EmissionsManager } from "../../../../EmissionsManager.sol";
import { IonicFlywheelCore } from "../../../../ionic/strategies/flywheel/IonicFlywheelCore.sol";
import { IonicFlywheel } from "../../../../ionic/strategies/flywheel/IonicFlywheel.sol";
import { IonicFlywheelBorrow } from "../../../../ionic/strategies/flywheel/IonicFlywheelBorrow.sol";
import { ERC20 } from "solmate/tokens/ERC20.sol";
import { IFlywheelBooster } from "../../../../ionic/strategies/flywheel/IFlywheelBooster.sol";
import { IFlywheelRewards } from "../../../../ionic/strategies/flywheel/rewards/IFlywheelRewards.sol";
import { IIonicFlywheelBorrowBooster } from "../../../../ionic/strategies/flywheel/IIonicFlywheelBorrowBooster.sol";
import { IonicFlywheelBorrowBooster } from "../../../../ionic/strategies/flywheel/IonicFlywheelBorrowBooster.sol";
import { VeIonicFlywheelDynamicRewards } from "../../../../ionic/strategies/flywheel/rewards/VeIonicFlywheelDynamicRewards.sol";
import { Comptroller } from "../../../../compound/Comptroller.sol";
import { RewardAccumulator } from "../../../../veION/RewardAccumulator.sol";
import { CErc20RewardsDelegate } from "../../../../compound/CErc20RewardsDelegate.sol";

contract DistributeRewards is VoterTest {
  address owner = 0x1155b614971f16758C92c4890eD338C9e3ede6b7;
  address ion = 0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5;
  address weth = 0x4200000000000000000000000000000000000006;
  address ionWhale = 0x7862Ba142511eEf11a5a8b179DB4F53AC115AB59;
  address baseWETHWhale = 0x0250f06fc76297Fe28D0981F0566F1c0445B3cFE;
  address[] markets;
  address[] supplyMarkets;
  address[] borrowMarkets;
  IVoter.MarketSide[] sides;
  IVoter.MarketSide[] borrowSides;
  IVoter.MarketSide[] supplySides;
  uint256[] weights;
  uint256 rewardAmount = 1_000_000 * 1e18;
  uint256 ONE = 1e18;
  address[] rewardAccumulators;
  address[] supplyRewardAccumulators;
  address[] borrowRewardAccumulators;

  CErc20RewardsDelegate ionWethMarket = CErc20RewardsDelegate(0x49420311B518f3d0c94e897592014de53831cfA3);
  PoolDirectory poolDirectory = PoolDirectory(0xE1A3006be645a80F206311d9f18C866c204bA02f);
  IonicFlywheel flywheelSupply;
  IonicFlywheelBorrow flywheelBorrow;
  VeIonicFlywheelDynamicRewards flywheelRewardsBorrow;
  VeIonicFlywheelDynamicRewards flywheelRewardsSupply;
  address protocalAddress = address(0x123);
  bytes bytecode = hex"deadbeef";
  IIonicFlywheelBorrowBooster flywheelBooster;
  uint32 constant ONE_WEEK = 1 weeks;
  Comptroller comptroller = Comptroller(0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13);

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

    vm.startPrank(owner);
    EmissionsManager emissionsManager = new EmissionsManager();
    emissionsManager.initialize(poolDirectory, protocalAddress, ERC20(ion), 2500, bytecode);

  
    // Setting up borrow flywheels
    flywheelBooster = new IonicFlywheelBorrowBooster();
    flywheelBorrow = new IonicFlywheelBorrow();
    flywheelBorrow.initialize(
      ERC20(ion),
      IFlywheelRewards(address(0)),
      IFlywheelBooster(address(flywheelBooster)),
      owner
    );

    flywheelRewardsBorrow = new VeIonicFlywheelDynamicRewards(IonicFlywheelCore(address(flywheelBorrow)), ONE_WEEK);
    flywheelBorrow.setFlywheelRewards(IFlywheelRewards(address(flywheelRewardsBorrow)));

    flywheelBorrow.setEmissionsManager(emissionsManager);
    flywheelBorrow.updateFeeSettings(0, protocalAddress);

    // Setting up supply flywheels
    flywheelSupply = new IonicFlywheel();
    flywheelSupply.initialize(
      ERC20(ion),
      IFlywheelRewards(address(0)),
      IFlywheelBooster(address(0)),
      owner
    );

    flywheelRewardsSupply = new VeIonicFlywheelDynamicRewards(IonicFlywheelCore(address(flywheelSupply)), ONE_WEEK);
    flywheelSupply.setFlywheelRewards(IFlywheelRewards(address(flywheelRewardsBorrow)));

    flywheelSupply.setEmissionsManager(emissionsManager);
    flywheelSupply.updateFeeSettings(0, protocalAddress);

    supplyMarkets = new address[](2);
    borrowMarkets = new address[](2);
    supplyMarkets[0] = markets[0];
    supplyMarkets[1] = markets[2];
    borrowMarkets[0] = markets[1];
    borrowMarkets[1] = markets[3];

    supplySides = new IVoter.MarketSide[](2);
    borrowSides = new IVoter.MarketSide[](2);
    supplySides[0] = sides[0];
    supplySides[1] = sides[2];
    borrowSides[0] = sides[1];
    borrowSides[1] = sides[3];
  
    supplyRewardAccumulators = new address[](2);
    borrowRewardAccumulators = new address[](2);

    for (uint256 i = 0; i < supplyMarkets.length; i++) {
      supplyRewardAccumulators[i] = voter.marketToRewardAccumulators(supplyMarkets[i], supplySides[i]);
      borrowRewardAccumulators[i] = voter.marketToRewardAccumulators(borrowMarkets[i], borrowSides[i]);
    }

    flywheelRewardsBorrow.setRewardAccumulators(supplyMarkets, supplyRewardAccumulators);
    flywheelRewardsSupply.setRewardAccumulators(borrowMarkets, borrowRewardAccumulators);
    vm.stopPrank();
        
    vm.startPrank(mpo.admin());
    comptroller._addRewardsDistributor(address(flywheelBorrow));
    comptroller._addRewardsDistributor(address(flywheelSupply));   
    vm.stopPrank();
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
    uint256 totalWeight = 0;
    for (uint256 i = 0; i < voters.length; i++) {
      voters[i] = address(uint160(uint256(keccak256(abi.encodePacked(i, block.timestamp)))));

      uint256 ionWethAmount = 10 + (uint256(keccak256(abi.encodePacked(i, block.timestamp))) % 11);
      uint256 wethAeroAmount = 10 + (uint256(keccak256(abi.encodePacked(i, block.timestamp, uint256(1)))) % 11);

      tokenIds[i] = _lockMultiLpFork(voters[i], ionWethAmount * 1e18, wethAeroAmount * 1e18);

      uint256[] memory weights = new uint256[](4);
      for (uint256 j = 0; j < weights.length; j++) {
        weights[j] = 1 + (uint256(keccak256(abi.encodePacked(j, block.timestamp, i))) % 100);
        totalWeight += weights[j];
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

      uint256 expectedBalance = rewardAmount * weights[i] / totalWeight;
      //assertEq(ionBalance, expectedBalance, "Each reward accumulator should have a quarter of the tokens");
    }

    // Log the price of ION-WETH LP using mpo.price
    uint256 ionWethPrice = mpo.price(address(ionWeth5050lPAero));
    console.log("Price of ION-WETH LP:", ionWethPrice);

    // Log the price of WETH-AERO LP using mpo.price
    uint256 wethAeroPrice = mpo.price(address(wethAero5050LPAero));
    console.log("Price of WETH-AERO LP:", wethAeroPrice);
  }
}
