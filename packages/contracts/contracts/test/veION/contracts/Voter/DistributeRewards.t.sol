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
import { IonicFlywheelDynamicRewards } from "../../../../ionic/strategies/flywheel/rewards/IonicFlywheelDynamicRewards.sol";
import { Comptroller } from "../../../../compound/Comptroller.sol";
import { RewardAccumulator } from "../../../../veION/RewardAccumulator.sol";
import { CErc20RewardsDelegate } from "../../../../compound/CErc20RewardsDelegate.sol";

contract DistributeRewards is VoterTest {
  address owner = 0x1155b614971f16758C92c4890eD338C9e3ede6b7;
  address ion = 0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5;
  address weth = 0x4200000000000000000000000000000000000006;
  address usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
  address ionWhale = 0x7862Ba142511eEf11a5a8b179DB4F53AC115AB59;
  address baseWETHWhale = 0x0250f06fc76297Fe28D0981F0566F1c0445B3cFE;
  address baseUSDCWhale = 0x0B0A5886664376F59C351ba3f598C8A8B4D0A6f3;
  address baseIonWethWhale = 0xf018B923bEbdef7a8124371B322D7E29a08c3198;
  address[] markets;
  address[] uniqMarkets;
  IVoter.MarketSide[] sides;
  IVoter.MarketSide[] borrowSides;
  IVoter.MarketSide[] supplySides;
  uint256[] weights;
  uint256 rewardAmount = 1_000_000 * 1e18;
  uint256 ONE = 1e18;
  address[] rewardAccumulators;
  address[] supplyRewardAccumulators;
  address[] borrowRewardAccumulators;

  CErc20RewardsDelegate ionUsdcMarket = CErc20RewardsDelegate(0xa900A17a49Bc4D442bA7F72c39FA2108865671f0);
  PoolDirectory poolDirectory = PoolDirectory(0xE1A3006be645a80F206311d9f18C866c204bA02f);
  IonicFlywheel flywheelSupply;
  IonicFlywheelBorrow flywheelBorrow;
  IonicFlywheelDynamicRewards flywheelRewardsBorrow;
  IonicFlywheelDynamicRewards flywheelRewardsSupply;
  EmissionsManager emissionsManager;
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
    emissionsManager = new EmissionsManager();
    emissionsManager.initialize(poolDirectory, protocalAddress, ERC20(ion), 2500, bytecode);
    emissionsManager.setVeIon(ve);

    // Deploy borrow flywheels
    flywheelBooster = new IonicFlywheelBorrowBooster();
    flywheelBorrow = new IonicFlywheelBorrow();
    flywheelBorrow.initialize(
      ERC20(ion),
      IFlywheelRewards(address(0)),
      IFlywheelBooster(address(flywheelBooster)),
      owner
    );

    // Deploy supply flywheels
    flywheelSupply = new IonicFlywheel();
    flywheelSupply.initialize(ERC20(ion), IFlywheelRewards(address(0)), IFlywheelBooster(address(0)), owner);

    flywheelRewardsBorrow = new IonicFlywheelDynamicRewards(IonicFlywheelCore(address(flywheelBorrow)), ONE_WEEK);
    flywheelBorrow.setFlywheelRewards(IFlywheelRewards(address(flywheelRewardsBorrow)));

    flywheelRewardsSupply = new IonicFlywheelDynamicRewards(IonicFlywheelCore(address(flywheelSupply)), ONE_WEEK);
    flywheelSupply.setFlywheelRewards(IFlywheelRewards(address(flywheelRewardsSupply)));

    flywheelSupply.setEmissionsManager(emissionsManager);
    flywheelBorrow.setEmissionsManager(emissionsManager);
    flywheelSupply.updateFeeSettings(0, protocalAddress);
    flywheelBorrow.updateFeeSettings(0, protocalAddress);

    uniqMarkets = new address[](2);
    uniqMarkets[0] = markets[0];
    uniqMarkets[1] = markets[2];

    supplyRewardAccumulators = new address[](2);
    borrowRewardAccumulators = new address[](2);

    for (uint256 i = 0; i < uniqMarkets.length; i++) {
      flywheelBorrow.addStrategyForRewards(ERC20(uniqMarkets[i]));
      flywheelSupply.addStrategyForRewards(ERC20(uniqMarkets[i]));
      supplyRewardAccumulators[i] = voter.marketToRewardAccumulators(uniqMarkets[i], IVoter.MarketSide.Supply);
      borrowRewardAccumulators[i] = voter.marketToRewardAccumulators(uniqMarkets[i], IVoter.MarketSide.Borrow);
    }

    flywheelRewardsBorrow.setRewardAccumulators(uniqMarkets, borrowRewardAccumulators);
    flywheelRewardsSupply.setRewardAccumulators(uniqMarkets, supplyRewardAccumulators);
    vm.stopPrank();

    vm.startPrank(address(0));
    for (uint256 i = 0; i < uniqMarkets.length; i++) {
      RewardAccumulator(supplyRewardAccumulators[i]).approve(ion, address(flywheelRewardsSupply));
      RewardAccumulator(borrowRewardAccumulators[i]).approve(ion, address(flywheelRewardsBorrow));
    }
    vm.stopPrank();

    vm.startPrank(comptroller.admin());
    comptroller._addRewardsDistributor(address(flywheelBorrow));
    comptroller._addRewardsDistributor(address(flywheelSupply));
    vm.stopPrank();
  }

  function test_distributeRewards_RewardsCanBeDistributed() public forkAtBlock(BASE_MAINNET, 23248915) {
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

  function test_distributeRewards_MultiLPAndVoters() public forkAtBlock(BASE_MAINNET, 23248915) {
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

      uint256 expectedBalance = (rewardAmount * weights[i]) / totalWeight;
      //assertEq(ionBalance, expectedBalance, "Each reward accumulator should have a quarter of the tokens");
    }

    // Log the price of ION-WETH LP using mpo.price
    uint256 ionWethPrice = mpo.price(address(ionWeth5050lPAero));
    console.log("Price of ION-WETH LP:", ionWethPrice);

    // Log the price of WETH-AERO LP using mpo.price
    uint256 wethAeroPrice = mpo.price(address(wethAero5050LPAero));
    console.log("Price of WETH-AERO LP:", wethAeroPrice);
  }

  function test_claimRewards_RewardsCanBeClaimed() public forkAtBlock(BASE_MAINNET, 21579411) {
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

    _lockSingleLPFork(baseUser, REAL_LP_LOCK_AMOUNT);

    vm.prank(baseWETHWhale);
    IERC20(weth).transfer(address(baseUser), ONE);

    uint256 ionBalanceBefore = IERC20(ion).balanceOf(address(baseUser));

    vm.startPrank(baseUser);
    IERC20(weth).approve(ethMarket, ONE);
    address[] memory marketToEnter;
    marketToEnter = new address[](2);
    marketToEnter[0] = ethMarket;
    marketToEnter[1] = btcMarket;

    comptroller.enterMarkets(marketToEnter);
    CErc20RewardsDelegate(ethMarket).mint(1e15);

    vm.stopPrank();
    vm.warp(voter.epochNext(block.timestamp));

    vm.startPrank(baseUser);
    flywheelSupply.accrue(ERC20(ethMarket), address(baseUser));

    flywheelSupply.claimRewards(address(baseUser));
    uint256 ionBalanceAfter = IERC20(ion).balanceOf(address(baseUser));
    uint256 rewardClaimed = ionBalanceAfter - ionBalanceBefore;
    uint256 ionwethBalanceAfter = IERC20(ethMarket).balanceOf(address(baseUser));
    uint256 ionwethTotalBalanceAfter = IERC20(ethMarket).totalSupply();
    assertEq(
      ionwethTotalBalanceAfter / ionwethBalanceAfter,
      rewardAmount / 4 / rewardClaimed,
      "User should get his fair share of rewards"
    );
    vm.stopPrank();
  }
}
