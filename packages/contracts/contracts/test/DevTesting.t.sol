// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import "./config/BaseTest.t.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { ComptrollerFirstExtension } from "../compound/ComptrollerFirstExtension.sol";
import { CErc20PluginRewardsDelegate } from "../compound/CErc20PluginRewardsDelegate.sol";
import { Unitroller } from "../compound/Unitroller.sol";
import { DiamondExtension, DiamondBase } from "../ionic/DiamondExtension.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { ISwapRouter } from "../external/uniswap/ISwapRouter.sol";
import { RedstoneAdapterPriceOracle } from "../oracles/default/RedstoneAdapterPriceOracle.sol";
import { RedstoneAdapterPriceOracleWrsETH } from "../oracles/default/RedstoneAdapterPriceOracleWrsETH.sol";
import { RedstoneAdapterPriceOracleWeETH } from "../oracles/default/RedstoneAdapterPriceOracleWeETH.sol";
import { MasterPriceOracle, BasePriceOracle } from "../oracles/MasterPriceOracle.sol";
import { PoolLens } from "../PoolLens.sol";
import { PoolLensSecondary } from "../PoolLensSecondary.sol";
import { JumpRateModel } from "../compound/JumpRateModel.sol";
import { LeveredPositionsLens } from "../ionic/levered/LeveredPositionsLens.sol";
import { ILiquidatorsRegistry } from "../liquidators/registry/ILiquidatorsRegistry.sol";
import { ILeveredPositionFactory } from "../ionic/levered/ILeveredPositionFactory.sol";
import { LeveredPositionFactoryFirstExtension } from "../ionic/levered/LeveredPositionFactoryFirstExtension.sol";
import { LeveredPositionFactorySecondExtension } from "../ionic/levered/LeveredPositionFactorySecondExtension.sol";
import { LeveredPositionFactory } from "../ionic/levered/LeveredPositionFactory.sol";
import { LeveredPositionStorage } from "../ionic/levered/LeveredPositionStorage.sol";
import { LeveredPosition } from "../ionic/levered/LeveredPosition.sol";
// import { IonicComptroller, ICErc20, ERC20, IPriceOracle_IFLR } from "../ionic/strategies/flywheel/IonicFlywheelLensRouter.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { AlgebraSwapLiquidator } from "../liquidators/AlgebraSwapLiquidator.sol";
import { AerodromeV2Liquidator } from "../liquidators/AerodromeV2Liquidator.sol";
import { AerodromeCLLiquidator } from "../liquidators/AerodromeCLLiquidator.sol";
import { CurveSwapLiquidator } from "../liquidators/CurveSwapLiquidator.sol";
import { CurveV2LpTokenPriceOracleNoRegistry } from "../oracles/default/CurveV2LpTokenPriceOracleNoRegistry.sol";
import { IRouter_Aerodrome } from "../external/aerodrome/IAerodromeRouter.sol";
import { VelodromeV2Liquidator } from "../liquidators/VelodromeV2Liquidator.sol";
import { IRouter_Velodrome } from "../external/velodrome/IVelodromeRouter.sol";
import { IonicUniV3Liquidator } from "../IonicUniV3Liquidator.sol";
import { VoterLens } from "../veION/VoterLens.sol";
import { IonicFlywheelDynamicRewards } from "../ionic/strategies/flywheel/rewards/IonicFlywheelDynamicRewards.sol";
import { IonicFlywheel } from "../ionic/strategies/flywheel/IonicFlywheel.sol";
import { FlywheelDynamicRewards } from "../ionic/strategies/flywheel/rewards/FlywheelDynamicRewards.sol";
import { Voter } from "../veION/Voter.sol";
import { veION } from "../veION/veION.sol";
import { veIONFirstExtension } from "../veION/veIONFirstExtension.sol";
import { veIONSecondExtension } from "../veION/veIONSecondExtension.sol";
import { BribeRewards } from "../veION/BribeRewards.sol";
import { IonicFlywheelLensRouter } from "../ionic/strategies/flywheel/IonicFlywheelLensRouter.sol";
import { IVoter } from "../veION/interfaces/IVoter.sol";

import "forge-std/console.sol";

struct HealthFactorVars {
  uint256 usdcSupplied;
  uint256 wethSupplied;
  uint256 ezEthSuppled;
  uint256 stoneSupplied;
  uint256 wbtcSupplied;
  uint256 weEthSupplied;
  uint256 merlinBTCSupplied;
  uint256 usdcBorrowed;
  uint256 wethBorrowed;
  uint256 ezEthBorrowed;
  uint256 stoneBorrowed;
  uint256 wbtcBorrowed;
  uint256 weEthBorrowed;
  uint256 merlinBTCBorrowed;
  ICErc20 testCToken;
  address testUnderlying;
  uint256 amountBorrow;
}

interface IClaimRewards {
  function claimRewardsForPool(address user, address pool) external;
}

contract DevTesting is BaseTest {
  IonicComptroller pool = IonicComptroller(0xFB3323E24743Caf4ADD0fDCCFB268565c0685556);
  PoolLensSecondary lens2 = PoolLensSecondary(0x7Ea7BB80F3bBEE9b52e6Ed3775bA06C9C80D4154);
  PoolLens lens = PoolLens(0x70BB19a56BfAEc65aE861E6275A90163AbDF36a6);
  LeveredPositionsLens levPosLens;

  address deployer = 0x1155b614971f16758C92c4890eD338C9e3ede6b7;
  address multisig = 0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2;

  ICErc20 wethMarket;
  ICErc20 usdcMarket;
  ICErc20 usdtMarket;
  ICErc20 wbtcMarket;
  ICErc20 ezEthMarket;
  ICErc20 stoneMarket;
  ICErc20 weEthMarket;
  ICErc20 merlinBTCMarket;

  // mode mainnet assets
  address WETH = 0x4200000000000000000000000000000000000006;
  address USDC = 0xd988097fb8612cc24eeC14542bC03424c656005f;
  address USDT = 0xf0F161fDA2712DB8b566946122a5af183995e2eD;
  address WBTC = 0xcDd475325D6F564d27247D1DddBb0DAc6fA0a5CF;
  address UNI = 0x3e7eF8f50246f725885102E8238CBba33F276747;
  address SNX = 0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3;
  address LINK = 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb;
  address DAI = 0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea;
  address BAL = 0xD08a2917653d4E460893203471f0000826fb4034;
  address AAVE = 0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2;
  address weETH = 0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A;
  address merlinBTC = 0x59889b7021243dB5B1e065385F918316cD90D46c;
  IERC20Upgradeable wsuperOETH = IERC20Upgradeable(0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6);
  IERC20Upgradeable superOETH = IERC20Upgradeable(0xDBFeFD2e8460a6Ee4955A68582F85708BAEA60A3);

  function afterForkSetUp() internal override {
    super.afterForkSetUp();

    if (block.chainid == MODE_MAINNET) {
      wethMarket = ICErc20(0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2);
      usdcMarket = ICErc20(0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038);
      usdtMarket = ICErc20(0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3);
      wbtcMarket = ICErc20(0xd70254C3baD29504789714A7c69d60Ec1127375C);
      ezEthMarket = ICErc20(0x59e710215d45F584f44c0FEe83DA6d43D762D857);
      stoneMarket = ICErc20(0x959FA710CCBb22c7Ce1e59Da82A247e686629310);
      weEthMarket = ICErc20(0xA0D844742B4abbbc43d8931a6Edb00C56325aA18);
      merlinBTCMarket = ICErc20(0x19F245782b1258cf3e11Eda25784A378cC18c108);
      ICErc20[] memory markets = pool.getAllMarkets();
      wethMarket = markets[0];
      usdcMarket = markets[1];
    } else {}
    levPosLens = LeveredPositionsLens(ap.getAddress("LeveredPositionsLens"));
  }

  function testModePoolBorrowers() public debuggingOnly fork(MODE_MAINNET) {
    emit log_named_array("borrowers", pool.getAllBorrowers());
  }

  function testGetTotalMarketVotes() public debuggingOnly fork(MODE_MAINNET) {
    // Deploy a new instance of VoterLens
    VoterLens lens = new VoterLens();

    lens.initialize(
      0x141F7f2aa313Ff4C60Dd58fDe493aA2048170429,
      PoolDirectory(0x39C353Cf9041CcF467A04d0e78B63d961E81458a)
    );

    lens.setMasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    lens.setVeIONAddress(0x2Abd9eB57Fb7727138f4181B68DA0426B7fd47e8);

    uint256 totalMarketVotes = lens.getTotalMarketVotes();
    emit log_named_uint("Total Market Votes Value in ETH", totalMarketVotes);
  }

  function testGetAllMarketVotes() public debuggingOnly fork(MODE_MAINNET) {
    VoterLens lens = VoterLens(0x0286bf00b6f6Cc45D2bd7e8C2e728B1DF2854c7D);
    address lpAsset = 0x690A74d2eC0175a69C0962B309E03021C0b5002E;

    VoterLens.MarketVoteInfo[] memory marketVotes = lens.getAllMarketVotes(lpAsset);
    emit log_named_uint("MarketVoteInfo array length", marketVotes.length);

    for (uint256 i = 0; i < marketVotes.length; i++) {
      emit log_named_address("Market", marketVotes[i].market);
      emit log_named_uint("Votes", marketVotes[i].votes);
      emit log_named_uint("Votes Value in ETH", marketVotes[i].votesValueInEth);
    }
  }

  function testBorrowFunctionality() public debuggingOnly fork(BASE_MAINNET) {
    address borrower = 0x1155b614971f16758C92c4890eD338C9e3ede6b7;
    address marketAddress = 0x40c7aafb43B67FDCA3EBd15d917b9E4755F81547;
    uint256 borrowAmount = 1219261;

    // Set the context to the borrower address
    vm.prank(borrower);

    // Call the borrow function on the specified market
    ICErc20(marketAddress).borrow(borrowAmount);

    // Emit a log to confirm the borrow action
    emit log_named_uint("Borrowed Amount", borrowAmount);
  }

  function testLockOnLisk() public debuggingOnly forkAtBlock(LISK_MAINNET, 15392770) {
    address veIONAddress = 0x6136BeC00Ba7C6d44BB10ee8683C792a0F8cDd6a;

    address[] memory tokenAddress = new address[](1);
    tokenAddress[0] = 0x076d0CD6228B042aA28E1E6A0894Cf6C97abc23b;

    uint256[] memory tokenAmount = new uint256[](1);
    tokenAmount[0] = 3024400000000000000;

    uint256[] memory duration = new uint256[](1);
    duration[0] = 15552000;

    bool[] memory stakeUnderlying = new bool[](1);
    stakeUnderlying[0] = true;

    veION veionContract = veION(veIONAddress);
    vm.prank(0x89bf9BAaeE2d451477CF850fE4c0d89bb796B1aD);
    uint256 tokenId = veionContract.createLock(tokenAddress, tokenAmount, duration, stakeUnderlying);

    emit log_named_uint("Created veION lock with tokenId", tokenId);
  }

  function testModeLiquidationShortfall() public debuggingOnly fork(MODE_MAINNET) {
    (uint256 err, uint256 collateralValue, uint256 liquidity, uint256 shortfall) = pool.getAccountLiquidity(
      0xa75F9C8246f7269279bE4c969e7Bc6Eb619cC204
    );

    emit log_named_uint("err", err);
    emit log_named_uint("collateralValue", collateralValue);
    emit log_named_uint("liquidity", liquidity);
    emit log_named_uint("shortfall", shortfall);
  }

  function testModeHealthFactor() public debuggingOnly fork(MODE_MAINNET) {
    address rahul = 0x5A9e792143bf2708b4765C144451dCa54f559a19;

    uint256 wethSupplied = wethMarket.balanceOfUnderlying(rahul);
    uint256 usdcSupplied = usdcMarket.balanceOfUnderlying(rahul);
    uint256 usdtSupplied = usdtMarket.balanceOfUnderlying(rahul);
    uint256 wbtcSupplied = wbtcMarket.balanceOfUnderlying(rahul);
    // emit log_named_uint("wethSupplied", wethSupplied);
    emit log_named_uint("usdcSupplied", usdcSupplied);
    emit log_named_uint("usdtSupplied", usdtSupplied);
    emit log_named_uint("wbtcSupplied", wbtcSupplied);
    emit log_named_uint("value of wethSupplied", wethSupplied * pool.oracle().getUnderlyingPrice(wethMarket));
    emit log_named_uint("value of usdcSupplied", usdcSupplied * pool.oracle().getUnderlyingPrice(usdcMarket));
    emit log_named_uint("value of usdtSupplied", usdtSupplied * pool.oracle().getUnderlyingPrice(usdtMarket));
    emit log_named_uint("value of wbtcSupplied", wbtcSupplied * pool.oracle().getUnderlyingPrice(wbtcMarket));

    PoolLens newImpl = new PoolLens();
    //    TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(address(lens)));
    //    vm.prank(dpa.owner());
    //    proxy.upgradeTo(address(newImpl));

    uint256 hf = newImpl.getHealthFactor(rahul, pool);

    emit log_named_uint("hf", hf);
  }

  function testVoterLens() public debuggingOnly fork(BASE_MAINNET) {
    // VoterLens lens = new VoterLens();
    // lens.initialize(
    //   0x141F7f2aa313Ff4C60Dd58fDe493aA2048170429,
    //   PoolDirectory(0x39C353Cf9041CcF467A04d0e78B63d961E81458a)
    // );

    // lens.setMasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    VoterLens lens = VoterLens(0xFEF51b9B5a1050B2bBE52A39cC356dfCEE79D87B);

    VoterLens.IncentiveInfo[] memory info = lens.getAllIncentivesForBribes();
    emit log_named_uint("IncentiveInfo array length", info.length);
    for (uint256 i = 0; i < info.length; i++) {
      emit log_named_address("Market", info[i].market);
      emit log_named_address("Bribe Supply", info[i].bribeSupply);
      emit log_named_address("Bribe Borrow", info[i].bribeBorrow);

      for (uint256 j = 0; j < info[i].rewardsSupply.length; j++) {
        emit log_named_address("Reward Supply", info[i].rewardsSupply[j]);
        emit log_named_uint("Reward Supply Amount", info[i].rewardsSupplyAmounts[j]);
        emit log_named_uint("Reward Supply Amount Value", info[i].rewardsSupplyETHValues[j]);
      }

      for (uint256 j = 0; j < info[i].rewardsBorrow.length; j++) {
        emit log_named_address("Reward Borrow", info[i].rewardsBorrow[j]);
        emit log_named_uint("Reward Borrow Amount", info[i].rewardsBorrowAmounts[j]);
        emit log_named_uint("Reward Borrow Amount Value", info[i].rewardsBorrowETHValues[j]);
      }
      emit log("-----------------------------------------------------------");
    }
  }

  function testNewVoterLens() public debuggingOnly fork(BASE_MAINNET) {
    VoterLens lens = new VoterLens();
    lens.initialize(
      0x669A6F5421dA53696fa06f1043CF127d380f6EB9,
      PoolDirectory(0xE1A3006be645a80F206311d9f18C866c204bA02f)
    );

    lens.setMasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    lens.setVeIONAddress(0x8865E0678E3b1BD0F5302e4C178a4B576F6aAA27);

    VoterLens.UserBribes[] memory userBribes = lens.getUserBribeRewards(0x2273B2Fb1664f100C07CDAa25Afd1CD0DA3C7437);
    emit log_named_uint("UserBribes array length", userBribes.length);
    for (uint256 i = 0; i < userBribes.length; i++) {
      emit log_named_uint("TokenId", userBribes[i].tokenId);
      emit log_named_address("Market", userBribes[i].market);
      emit log_named_address("Bribe", userBribes[i].bribe);
      emit log_named_address("Reward", userBribes[i].reward);
      emit log_named_uint("Earned", userBribes[i].earned);
    }
  }

  function testUserFlywheelRewards1() public debuggingOnly forkAtBlock(BASE_MAINNET, 26840321) {
    executeFlywheelRewardsTest();
  }

  function testUserFlywheelRewards2() public debuggingOnly forkAtBlock(BASE_MAINNET, 26904044) {
    emit log("Distribution into reward accumulator");
    executeFlywheelRewardsTest();
  }

  function testUserFlywheelRewards3() public debuggingOnly forkAtBlock(BASE_MAINNET, 26920527) {
    emit log("Right before rewards pulled into flywheel rewards");
    executeFlywheelRewardsTest();
  }

  function testUserFlywheelRewards4() public debuggingOnly forkAtBlock(BASE_MAINNET, 26920528) {
    emit log("Rewards pulled into flywheel rewards");
    executeFlywheelRewardsTest();
  }

  function testUserFlywheelRewards5() public debuggingOnly forkAtBlock(BASE_MAINNET, 26931538) {
    emit log("First deposit after rewards pulled into flywheel rewards");
    executeFlywheelRewardsTest();
  }

  function testUserFlywheelRewards6() public debuggingOnly forkAtBlock(BASE_MAINNET, 27123016) {
    executeFlywheelRewardsTest();
  }

  function testUserFlywheelRewards7() public debuggingOnly forkAtBlock(BASE_MAINNET, 27208871) {
    emit log("Another Distribution");
    executeFlywheelRewardsTest();
  }

  function testUserFlywheelRewards8() public debuggingOnly forkAtBlock(BASE_MAINNET, 27703171) {
    emit log("Right before user whitelists himself");
    executeFlywheelRewardsTest();
  }

  function testUserFlywheelRewards9() public debuggingOnly forkAtBlock(BASE_MAINNET, 27703172) {
    emit log("User whitelists himself");
    executeFlywheelRewardsTest();
  }

  function testUserBribeClaims() public debuggingOnly fork(BASE_MAINNET) {
    address user = 0x2273B2Fb1664f100C07CDAa25Afd1CD0DA3C7437;
    Voter voter = Voter(0x669A6F5421dA53696fa06f1043CF127d380f6EB9);

    address[] memory _bribes = new address[](1);
    _bribes[0] = 0x4c63d1bcC6c67b9DE3DBf96f8e18eD9440400e6a;

    address[][] memory _tokens = new address[][](1);
    _tokens[0] = new address[](1);

    _tokens[0][0] = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    vm.prank(user);
    voter.claimBribes(_bribes, _tokens, 38);
  }

  function testUserBribeRewards() public debuggingOnly fork(BASE_MAINNET) {
    address user = 0x249025bD74e42fAecb5f7c63B889f511581a8546;
    VoterLens voterLens = VoterLens(0xFEF51b9B5a1050B2bBE52A39cC356dfCEE79D87B); // Replace with actual VoterLens contract address
    Voter voter = Voter(0x669A6F5421dA53696fa06f1043CF127d380f6EB9);
    veION ve = veION(0x8865E0678E3b1BD0F5302e4C178a4B576F6aAA27);
    address lpAsset = 0x0FAc819628a7F612AbAc1CaD939768058cc0170c;

    VoterLens.UserBribes[] memory userBribes = voterLens.getUserBribeRewards(user);

    emit log("User Bribe Rewards:");
    for (uint256 i = 0; i < userBribes.length; i++) {
      emit log_named_uint("Token ID", userBribes[i].tokenId);
      emit log_named_address("Market", userBribes[i].market);
      emit log_named_address("Bribe", userBribes[i].bribe);
      emit log_named_address("Reward", userBribes[i].reward);
      emit log_named_uint("Earned", userBribes[i].earned);
      emit log("-----------------------------------------------------------");
    }
  }

  function testUserEmissions() public debuggingOnly fork(BASE_MAINNET) {
    address user = 0x5321d7296fe0e7Cae533a090DcDA6E00F0499df0;
    IClaimRewards lens = IClaimRewards(0xB1402333b12fc066C3D7F55d37944D5e281a3e8B);

    lens.claimRewardsForPool(user, 0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13);
  }

  struct BribeRewardVars {
    address user;
    Voter voter;
    veION ve;
    address lpAsset;
    uint256[] ownedTokenIds;
    uint256 currentTimestamp;
  }

  function testSingleBribeReward() public debuggingOnly fork(BASE_MAINNET) {
    BribeRewardVars memory vars;
    vars.user = 0x249025bD74e42fAecb5f7c63B889f511581a8546;
    vars.voter = Voter(0x669A6F5421dA53696fa06f1043CF127d380f6EB9);
    vars.ve = veION(0x8865E0678E3b1BD0F5302e4C178a4B576F6aAA27);
    vars.lpAsset = 0x0FAc819628a7F612AbAc1CaD939768058cc0170c;

    vars.ownedTokenIds = veIONSecondExtension(address(vars.ve)).getOwnedTokenIds(vars.user);
    vars.currentTimestamp = vars.voter.epochStart(block.timestamp);
    emit log_named_uint("Current Timestamp", vars.currentTimestamp);

    emit log("Vote Details for User:");
    for (uint256 j = 0; j < vars.ownedTokenIds.length; j++) {
      Voter.VoteDetails memory voteDetails = vars.voter.getVoteDetails(vars.ownedTokenIds[j], vars.lpAsset);
      emit log_named_uint("Token ID", vars.ownedTokenIds[j]);
      for (uint256 i = 0; i < voteDetails.marketVotes.length; i++) {
        emit log_named_address("Market Voted", voteDetails.marketVotes[i]);
        emit log_named_uint("Market Side", uint256(voteDetails.marketVoteSides[i]));
        emit log_named_uint("Votes", voteDetails.votes[i]);
        emit log_named_uint("Used Weight", voteDetails.usedWeight);
        address rewardAccumulator = vars.voter.marketToRewardAccumulators(
          voteDetails.marketVotes[i],
          voteDetails.marketVoteSides[i]
        );
        address bribeRewards = vars.voter.rewardAccumulatorToBribe(rewardAccumulator);
        BribeRewards bribe = BribeRewards(bribeRewards);

        emit log_named_address("Bribe", address(bribe));
        BribeRewards.Checkpoint memory cp = bribe.getCheckpoint(vars.ownedTokenIds[j], vars.lpAsset, 0);
        emit log_named_uint("Checkpoint Timestamp", cp.timestamp);
        emit log_named_uint("Checkpoint Balance Of", cp.balanceOf);

        uint256 voteTimestamp = vars.voter.epochStart(cp.timestamp);
        emit log_named_uint("Vote Timestamp", voteTimestamp);
        emit log_named_uint("Difference between timestamps", vars.currentTimestamp - voteTimestamp);
        uint256 rewardsLength = bribe.rewardsListLength();
        for (uint256 k = 0; k < rewardsLength; k++) {
          address rewardToken = bribe.rewards(k);
          uint256 earnedAmount = bribe.earned(rewardToken, vars.ownedTokenIds[j]);
          emit log_named_address("Reward Token", rewardToken);
          emit log_named_uint("Earned Amount", earnedAmount);
        }
      }
      emit log("-----------------------------------------------------------");
    }
  }

  function testUserBribes() public debuggingOnly fork(BASE_MAINNET) {
    address user = 0xec7e64b33EE52Bed121a551901Bd124986BC3b58;
    VoterLens voterLens = VoterLens(0xFEF51b9B5a1050B2bBE52A39cC356dfCEE79D87B); // Replace with actual VoterLens contract address
    Voter voter = Voter(0x669A6F5421dA53696fa06f1043CF127d380f6EB9);
    veION ve = veION(0x8865E0678E3b1BD0F5302e4C178a4B576F6aAA27);
    address lpAsset = 0x0FAc819628a7F612AbAc1CaD939768058cc0170c;

    VoterLens.IncentiveInfo[] memory incentives = voterLens.getAllIncentivesForBribes();

    emit log("Incentive Information:");
    for (uint256 i = 0; i < incentives.length; i++) {
      if (
        (incentives[i].bribeSupply != address(0) && incentives[i].rewardsSupply.length > 0) ||
        (incentives[i].bribeBorrow != address(0) && incentives[i].rewardsBorrow.length > 0)
      ) {
        emit log_named_address("Market", incentives[i].market);
        if (incentives[i].bribeSupply != address(0)) {
          emit log_named_address("Bribe Supply", incentives[i].bribeSupply);
          for (uint256 j = 0; j < incentives[i].rewardsSupply.length; j++) {
            emit log_named_address("Reward Supply", incentives[i].rewardsSupply[j]);
            emit log_named_uint("Reward Supply Amount", incentives[i].rewardsSupplyAmounts[j]);
            emit log_named_uint("Reward Supply ETH Value", incentives[i].rewardsSupplyETHValues[j]);
          }
        }
        if (incentives[i].bribeBorrow != address(0)) {
          emit log_named_address("Bribe Borrow", incentives[i].bribeBorrow);
          for (uint256 j = 0; j < incentives[i].rewardsBorrow.length; j++) {
            emit log_named_address("Reward Borrow", incentives[i].rewardsBorrow[j]);
            emit log_named_uint("Reward Borrow Amount", incentives[i].rewardsBorrowAmounts[j]);
            emit log_named_uint("Reward Borrow ETH Value", incentives[i].rewardsBorrowETHValues[j]);
          }
        }
        emit log("-----------------------------------------------------------");
      }
    }

    uint256[] memory ownedTokenIds = veIONSecondExtension(address(ve)).getOwnedTokenIds(user);

    emit log("Owned Token IDs for User:");
    for (uint256 i = 0; i < ownedTokenIds.length; i++) {
      emit log_named_uint("Token ID", ownedTokenIds[i]);
    }
    emit log("-----------------------------------------------------------");

    // Fetch the vote details for each token ID owned by the user
    emit log("Vote Details for User:");
    for (uint256 j = 0; j < ownedTokenIds.length; j++) {
      Voter.VoteDetails memory voteDetails = voter.getVoteDetails(ownedTokenIds[j], lpAsset);
      emit log_named_uint("Token ID", ownedTokenIds[j]);
      for (uint256 i = 0; i < voteDetails.marketVotes.length; i++) {
        emit log_named_address("Market Voted", voteDetails.marketVotes[i]);
        emit log_named_uint("Market Side", uint256(voteDetails.marketVoteSides[i]));
        emit log_named_uint("Votes", voteDetails.votes[i]);
        emit log_named_uint("Used Weight", voteDetails.usedWeight);
      }
      emit log("-----------------------------------------------------------");
    }

    BribeRewards bribe = BribeRewards(0xe9b889c8c7A5Bbe63e5E2eEafb212cdcF1A60B9f);
    uint256[] memory votingTokens = new uint256[](1);
    votingTokens[0] = 20;

    for (uint256 i = 0; i < votingTokens.length; i++) {
      uint256 earnedAmount = bribe.earned(0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4, votingTokens[i]);
      emit log_named_uint("Earned Amount for Token ID", votingTokens[i]);
      emit log_named_uint("Earned Amount", earnedAmount);
    }
  }

  function testVoteUser() public debuggingOnly fork(BASE_MAINNET) {
    address[] memory markets = new address[](1);
    IVoter.MarketSide[] memory marketSides = new IVoter.MarketSide[](1);
    uint256[] memory weights = new uint256[](1);

    address user = 0x249025bD74e42fAecb5f7c63B889f511581a8546;
    veION ve = veION(0x8865E0678E3b1BD0F5302e4C178a4B576F6aAA27);

    uint256[] memory ownedTokenIds = veIONSecondExtension(address(ve)).getOwnedTokenIds(user);

    emit log("Owned Token IDs for User:");
    for (uint256 i = 0; i < ownedTokenIds.length; i++) {
      emit log_named_uint("Token ID", ownedTokenIds[i]);
    }
    emit log("-----------------------------------------------------------");

    Voter voter = Voter(0x669A6F5421dA53696fa06f1043CF127d380f6EB9);

    markets[0] = 0x9c2A4f9c5471fd36bE3BBd8437A33935107215A1;
    marketSides[0] = IVoter.MarketSide(0);
    weights[0] = 100;

    for (uint256 i = 0; i < ownedTokenIds.length; i++) {
      vm.startPrank(user);
      voter.reset(ownedTokenIds[i]);
      voter.vote(ownedTokenIds[i], markets, marketSides, weights);
      vm.stopPrank();
    }
  }

  function testBribeIncentives() public debuggingOnly fork(BASE_MAINNET) {
    VoterLens voterLens = VoterLens(0xFEF51b9B5a1050B2bBE52A39cC356dfCEE79D87B);
    VoterLens.IncentiveInfo[] memory incentives = voterLens.getAllIncentivesForBribes();

    emit log("Incentive Information:");
    for (uint256 i = 0; i < incentives.length; i++) {
      if (
        (incentives[i].bribeSupply != address(0) && incentives[i].rewardsSupply.length > 0) ||
        (incentives[i].bribeBorrow != address(0) && incentives[i].rewardsBorrow.length > 0)
      ) {
        emit log_named_address("Market", incentives[i].market);
        if (incentives[i].bribeSupply != address(0)) {
          emit log_named_address("Bribe Supply", incentives[i].bribeSupply);
          for (uint256 j = 0; j < incentives[i].rewardsSupply.length; j++) {
            emit log_named_address("Reward Supply", incentives[i].rewardsSupply[j]);
            emit log_named_uint("Reward Supply Amount", incentives[i].rewardsSupplyAmounts[j]);
            emit log_named_uint("Reward Supply ETH Value", incentives[i].rewardsSupplyETHValues[j]);
          }
        }
        if (incentives[i].bribeBorrow != address(0)) {
          emit log_named_address("Bribe Borrow", incentives[i].bribeBorrow);
          for (uint256 j = 0; j < incentives[i].rewardsBorrow.length; j++) {
            emit log_named_address("Reward Borrow", incentives[i].rewardsBorrow[j]);
            emit log_named_uint("Reward Borrow Amount", incentives[i].rewardsBorrowAmounts[j]);
            emit log_named_uint("Reward Borrow ETH Value", incentives[i].rewardsBorrowETHValues[j]);
          }
        }
        emit log("-----------------------------------------------------------");
      }
    }
  }

  struct FlywheelTestVars {
    address ion;
    address solMarket;
    address user;
    IonicFlywheel ionFlywheel;
    IonicFlywheelDynamicRewards ionFlywheelRewards;
    address rewardAccumulator;
    uint256 ionBalance;
    uint256 ionFlywheelRewardsBalance;
    uint256 userBlacklistedSupply;
    uint256 totalBlacklistedSupply;
    uint256 compAccrued;
    uint224 userIndex;
    uint224 marketStateIndex;
    uint32 marketStateLastUpdatedTimestamp;
    uint256 totalSupply;
    uint256 solMarketBalance;
    uint32 rewardsCycleStart;
    uint32 rewardsCycleEnd;
    uint192 rewardsCycleReward;
  }

  function executeFlywheelRewardsTest() internal {
    FlywheelTestVars memory vars;

    vars.ion = 0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5;
    vars.solMarket = 0xbd06905590b6E1b6Ac979Fc477A0AebB58d52371;
    vars.user = 0x54494827316C7C6627908A9261AB13Ac0A5222E3;
    vars.ionFlywheel = IonicFlywheel(0x1f7DF29E614105e5869b4f03Ecc034a087C2Ab5f);
    vars.ionFlywheelRewards = IonicFlywheelDynamicRewards(0x7Faf51cfF9ed26AD5BD071685F684B0D1338d163);

    emit log("-----------------------------------------------------------");
    vars.rewardAccumulator = vars.ionFlywheelRewards.rewardAccumulators(vars.solMarket);
    emit log_named_address("Reward Accumulator for solMarket", vars.rewardAccumulator);

    vars.ionBalance = ERC20(vars.ion).balanceOf(vars.rewardAccumulator);
    emit log_named_uint("ION Balance of Reward Accumulator", vars.ionBalance);

    vars.totalBlacklistedSupply = vars.ionFlywheel.blacklistedSupply(ERC20(vars.solMarket));
    emit log_named_uint("Total Blacklisted Supply of solMarket", vars.totalBlacklistedSupply);

    vars.ionFlywheelRewardsBalance = ERC20(vars.ion).balanceOf(address(vars.ionFlywheelRewards));
    emit log_named_uint("ION Balance of Flywheel Rewards", vars.ionFlywheelRewardsBalance);

    vars.userBlacklistedSupply = vars.ionFlywheel.userBlacklistedSupply(ERC20(vars.solMarket), vars.user);
    emit log_named_uint("User Blacklisted Supply", vars.userBlacklistedSupply);

    vars.compAccrued = vars.ionFlywheel.compAccrued(vars.user);
    emit log_named_uint("Comp Accrued", vars.compAccrued);

    vars.userIndex = vars.ionFlywheel.userIndex(ERC20(vars.solMarket), vars.user);
    emit log_named_uint("User Index", vars.userIndex);

    (vars.marketStateIndex, vars.marketStateLastUpdatedTimestamp) = vars.ionFlywheel.marketState(ERC20(vars.solMarket));
    emit log_named_uint("Market State Index", vars.marketStateIndex);
    emit log_named_uint("Market State Last Updated Timestamp", vars.marketStateLastUpdatedTimestamp);

    vars.totalSupply = ERC20(vars.solMarket).totalSupply();
    emit log_named_uint("Total Supply of solMarket", vars.totalSupply);

    vars.solMarketBalance = ERC20(vars.solMarket).balanceOf(vars.user);
    emit log_named_uint("solMarket Balance of User", vars.solMarketBalance);

    // Retrieve the rewards cycle for the solMarket strategy
    (vars.rewardsCycleStart, vars.rewardsCycleEnd, vars.rewardsCycleReward) = vars.ionFlywheelRewards.rewardsCycle(
      ERC20(vars.solMarket)
    );

    // Log the rewards cycle details
    emit log_named_uint("Rewards Cycle Start", vars.rewardsCycleStart);
    emit log_named_uint("Rewards Cycle End", vars.rewardsCycleEnd);
    emit log_named_uint("Rewards Cycle Reward", vars.rewardsCycleReward);

    uint32 rewardsCycleLength = vars.ionFlywheelRewards.rewardsCycleLength();
    emit log_named_uint("Rewards Cycle Length", rewardsCycleLength);
  }

  function testQuickHF() public debuggingOnly forkAtBlock(MODE_MAINNET, 11831371) {
    address rahul = 0xf1bAeb439b8eF5043E069af0C8C8145963ebc3f8;

    uint256 hf = lens.getHealthFactor(rahul, pool);
    uint256 hf2 = lens.getHealthFactor(rahul, IonicComptroller(0x8Fb3D4a94D0aA5D6EDaAC3Ed82B59a27f56d923a));

    emit log_named_uint("hf", hf);
    emit log_named_uint("hf2", hf2);
  }

  function testQuickLiquidation() public debuggingOnly forkAtBlock(MODE_MAINNET, 12018198) {
    address user = 0xf1bAeb439b8eF5043E069af0C8C8145963ebc3f8;
    address whale = 0xaaEd68a3875F6BDbD44f70418dd16082870De8A0;
    address borrowedAsset = 0x80137510979822322193FC997d400D5A6C747bf7;
    uint256 repayAmount = 1968810267461862;
    address collateralToSeizeCToken = 0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2;
    address borrowedAssetCToken = 0x959FA710CCBb22c7Ce1e59Da82A247e686629310;

    IonicUniV3Liquidator uniV3liquidator = IonicUniV3Liquidator(payable(0xa12c1E460c06B1745EFcbfC9A1f666a8749B0e3A));

    emit log_named_address("univ3liq", address(uniV3liquidator));
    emit log_named_address("express relay", address(uniV3liquidator.expressRelay()));

    vm.mockCall(
      address(uniV3liquidator.expressRelay()),
      abi.encodeWithSelector(
        bytes4(keccak256("isPermissioned(address,bytes)")),
        address(uniV3liquidator),
        abi.encode(user)
      ),
      abi.encode(true)
    );

    vm.startPrank(whale);
    ERC20(borrowedAsset).approve(address(uniV3liquidator), type(uint256).max);
    uniV3liquidator.safeLiquidate(user, repayAmount, ICErc20(borrowedAssetCToken), ICErc20(collateralToSeizeCToken), 0);
    vm.stopPrank();
  }

  function testQuickAssets() public debuggingOnly forkAtBlock(MODE_MAINNET, 12314870) {
    address user = 0x5BDB1Fb5d0F841f4eb88D537bED0DD674fA88D7c;
    IonicComptroller comptroller = IonicComptroller(0xFB3323E24743Caf4ADD0fDCCFB268565c0685556);
    IonicComptroller comptroller2 = IonicComptroller(0x8Fb3D4a94D0aA5D6EDaAC3Ed82B59a27f56d923a);

    uint256 hf = lens.getHealthFactor(user, comptroller);
    uint256 hf2 = lens.getHealthFactor(user, comptroller2);

    PoolLens.PoolAsset[] memory assets = lens.getPoolAssetsByUser(comptroller, user);
    PoolLens.PoolAsset[] memory assets2 = lens.getPoolAssetsByUser(comptroller2, user);

    emit log("<---------------------------------MAIN MARKETS--------------------------------->");
    emit log_named_uint("hf", hf);
    for (uint i; i < assets.length; i++) {
      emit log("====================================================");
      emit log_named_string("name", assets[i].underlyingName);
      emit log_named_address("ctoken", assets[i].cToken);
      emit log_named_address("underlying", assets[i].underlyingToken);
      emit log_named_uint("supplyBalance", assets[i].supplyBalance);
      emit log_named_uint("borrowBalance", assets[i].borrowBalance);
      emit log_named_uint("underlyingPrice", assets[i].underlyingPrice);
      emit log_named_uint("exchange rate", assets[i].exchangeRate);
    }

    emit log("<---------------------------------NATIVE MARKETS--------------------------------->");
    emit log_named_uint("hf", hf2);
    for (uint i; i < assets2.length; i++) {
      emit log("====================================================");
      emit log_named_string("name", assets2[i].underlyingName);
      emit log_named_address("ctoken", assets2[i].cToken);
      emit log_named_address("underlying", assets2[i].underlyingToken);
      emit log_named_uint("supplyBalance", assets2[i].supplyBalance);
      emit log_named_uint("borrowBalance", assets2[i].borrowBalance);
      emit log_named_uint("underlyingPrice", assets2[i].underlyingPrice);
    }
  }

  function testNetAprMode() public debuggingOnly forkAtBlock(MODE_MAINNET, 8479829) {
    address user = 0x30D5047e839f079bDE1Ab16b34668f57391DacB3;
    int256 blocks = 30 * 24 * 365 * 60;
    IonicFlywheelLensRouter lensRouter = new IonicFlywheelLensRouter(
      PoolDirectory(0x39C353Cf9041CcF467A04d0e78B63d961E81458a)
    );
    int256 apr = lensRouter.getUserNetApr(user, blocks);

    emit log_named_int("apr", apr);
  }

  function testModeUsdcBorrowCaps() public debuggingOnly fork(MODE_MAINNET) {
    _testModeBorrowCaps(usdcMarket);
  }

  function testHypotheticalPosition() public debuggingOnly forkAtBlock(MODE_MAINNET, 8028296) {
    HealthFactorVars memory vars;

    address wolfy = 0x7d922bf0975424b3371074f54cC784AF738Dac0D;
    address usdcWhale = 0x70FF197c32E922700d3ff2483D250c645979855d;
    address wbtcWhale = 0xBD8CCf3ebE4CC2D57962cdC2756B143ce0135a6B;
    address wethWhale = 0xD746A2a6048C5D3AFF5766a8c4A0C8cFD2311745;

    address whale = wbtcWhale;
    vars.testCToken = wethMarket;
    vars.testUnderlying = WETH;
    vars.amountBorrow = 1e18 / 2;

    address[] memory cTokens = new address[](1);

    vm.startPrank(usdcWhale);
    ERC20(USDC).transfer(wolfy, ERC20(USDC).balanceOf(usdcWhale));
    vm.stopPrank();

    vm.startPrank(wbtcWhale);
    ERC20(WBTC).transfer(wolfy, ERC20(WBTC).balanceOf(wbtcWhale));
    vm.stopPrank();

    vm.startPrank(wethWhale);
    ERC20(WETH).transfer(wolfy, ERC20(WETH).balanceOf(wethWhale));
    vm.stopPrank();

    // emit log_named_uint("USDC balance", ERC20(USDC).balanceOf(wolfy));
    // emit log_named_uint("WBTC balance", ERC20(WBTC).balanceOf(wolfy));
    // emit log_named_uint("WETH balance", ERC20(WETH).balanceOf(wolfy));

    vm.startPrank(wolfy);

    ERC20(USDC).approve(address(usdcMarket), ERC20(USDC).balanceOf(wolfy));
    usdcMarket.mint(ERC20(USDC).balanceOf(wolfy));
    cTokens[0] = address(usdcMarket);
    pool.enterMarkets(cTokens);

    ERC20(WBTC).approve(address(wbtcMarket), ERC20(WBTC).balanceOf(wolfy));
    wbtcMarket.mint(ERC20(WBTC).balanceOf(wolfy));
    cTokens[0] = address(wbtcMarket);
    pool.enterMarkets(cTokens);

    ERC20(WETH).approve(address(wethMarket), ERC20(WETH).balanceOf(wolfy));
    wethMarket.mint(ERC20(WETH).balanceOf(wolfy));
    cTokens[0] = address(wethMarket);
    pool.enterMarkets(cTokens);

    wethMarket.borrow(1e18);

    vm.stopPrank();

    vars.usdcSupplied = usdcMarket.balanceOfUnderlying(wolfy);
    vars.wethSupplied = wethMarket.balanceOfUnderlying(wolfy);
    vars.ezEthSuppled = ezEthMarket.balanceOfUnderlying(wolfy);
    vars.stoneSupplied = stoneMarket.balanceOfUnderlying(wolfy);
    vars.wbtcSupplied = wbtcMarket.balanceOfUnderlying(wolfy);
    vars.weEthSupplied = weEthMarket.balanceOfUnderlying(wolfy);
    vars.merlinBTCSupplied = merlinBTCMarket.balanceOfUnderlying(wolfy);

    vars.usdcBorrowed = usdcMarket.borrowBalanceCurrent(wolfy);
    vars.wethBorrowed = wethMarket.borrowBalanceCurrent(wolfy);
    vars.ezEthBorrowed = ezEthMarket.borrowBalanceCurrent(wolfy);
    vars.stoneBorrowed = stoneMarket.borrowBalanceCurrent(wolfy);
    vars.wbtcBorrowed = wbtcMarket.borrowBalanceCurrent(wolfy);
    vars.weEthBorrowed = weEthMarket.borrowBalanceCurrent(wolfy);
    vars.merlinBTCBorrowed = merlinBTCMarket.borrowBalanceCurrent(wolfy);

    emit log_named_uint("usdcSupplied", vars.usdcSupplied);
    emit log_named_uint("wethSupplied", vars.wethSupplied);
    emit log_named_uint("ezEthSupplied", vars.ezEthSuppled);
    emit log_named_uint("stoneSupplied", vars.stoneSupplied);
    emit log_named_uint("wbtcSupplied", vars.wbtcSupplied);
    emit log_named_uint("weEthSupplied", vars.weEthSupplied);
    emit log_named_uint("merlinBTCSupplied", vars.merlinBTCSupplied);

    emit log_named_uint("-------------------------------------------------", 0);
    emit log_named_uint("usdcBorrowed", vars.usdcBorrowed);
    emit log_named_uint("wethBorrowed", vars.wethBorrowed);
    emit log_named_uint("ezEthBorrowed", vars.ezEthBorrowed);
    emit log_named_uint("stoneBorrowed", vars.stoneBorrowed);
    emit log_named_uint("wbtcBorrowed", vars.wbtcBorrowed);
    emit log_named_uint("weEthBorrowed", vars.weEthBorrowed);
    emit log_named_uint("merlinBTCBorrowed", vars.merlinBTCBorrowed);

    // emit log_named_uint("value of usdcSupplied", vars.usdcSupplied * pool.oracle().getUnderlyingPrice(usdcMarket));
    // emit log_named_uint("value of wethSupplied", vars.wethSupplied * pool.oracle().getUnderlyingPrice(wethMarket));
    // emit log_named_uint("value of ezEthSupplied", vars.ezEthSuppled * pool.oracle().getUnderlyingPrice(ezEthMarket));
    // emit log_named_uint("value of stoneSupplied", vars.stoneSupplied * pool.oracle().getUnderlyingPrice(stoneMarket));
    // emit log_named_uint("value of wbtcSupplied", vars.wbtcSupplied * pool.oracle().getUnderlyingPrice(wbtcMarket));

    // emit log_named_uint("value of usdcBorrowed", vars.usdcBorrowed * pool.oracle().getUnderlyingPrice(usdcMarket));
    // emit log_named_uint("value of wethBorrowed", vars.wethBorrowed * pool.oracle().getUnderlyingPrice(wethMarket));
    // emit log_named_uint("value of ezEthBorrowed", vars.ezEthBorrowed * pool.oracle().getUnderlyingPrice(ezEthMarket));
    // emit log_named_uint("value of stoneBorrowed", vars.stoneBorrowed * pool.oracle().getUnderlyingPrice(stoneMarket));
    // emit log_named_uint("value of wbtcBorrowed", vars.wbtcBorrowed * pool.oracle().getUnderlyingPrice(wbtcMarket));

    vm.startPrank(whale);
    ERC20(vars.testUnderlying).transfer(wolfy, ERC20(vars.testUnderlying).balanceOf(whale));
    vm.stopPrank();

    uint256 hf = lens.getHealthFactor(wolfy, pool);
    uint256 hypothetical = lens.getHealthFactorHypothetical(
      pool,
      wolfy,
      address(vars.testCToken),
      0,
      0,
      vars.amountBorrow
    );

    (uint256 err, uint256 collateralValue, uint256 liquidity, uint256 shortfall) = pool.getAccountLiquidity(wolfy);

    emit log_named_uint("-------------------------------------------------", 0);
    emit log_named_uint("Collateral Value Before", collateralValue);
    emit log_named_uint("Liquidity Before", liquidity);
    emit log_named_uint("hf before", hf);
    emit log_named_uint("hypothetical hf", hypothetical);

    vm.startPrank(wolfy);
    ERC20(vars.testUnderlying).approve(address(vars.testCToken), vars.amountBorrow);
    vars.testCToken.repayBorrow(vars.amountBorrow);
    vm.stopPrank();

    uint256 hfAfter = lens.getHealthFactor(wolfy, pool);
    (err, collateralValue, liquidity, shortfall) = pool.getAccountLiquidity(wolfy);

    emit log_named_uint("-------------------------------------------------", 0);
    emit log_named_uint("Collateral Value After", collateralValue);
    emit log_named_uint("Liquidity After", liquidity);
    emit log_named_uint("hf after", hfAfter);
    emit log_named_uint("user balance after", ERC20(vars.testUnderlying).balanceOf(wolfy));
    emit log_named_uint("new borrow balance after repay", vars.testCToken.borrowBalanceCurrent(wolfy));
  }

  function testModeUsdtBorrowCaps() public debuggingOnly fork(MODE_MAINNET) {
    _testModeBorrowCaps(usdtMarket);
  }

  function testModeWethBorrowCaps() public debuggingOnly fork(MODE_MAINNET) {
    _testModeBorrowCaps(wethMarket);
    wethMarket.accrueInterest();
    _testModeBorrowCaps(wethMarket);
  }

  function _testModeBorrowCaps(ICErc20 market) internal {
    uint256 borrowCapUsdc = pool.borrowCaps(address(market));
    uint256 totalBorrowsCurrent = market.totalBorrowsCurrent();

    uint256 wethBorrowAmount = 154753148031252;
    console.log("borrowCapUsdc %e", borrowCapUsdc);
    console.log("totalBorrowsCurrent %e", totalBorrowsCurrent);
    console.log("new totalBorrowsCurrent %e", totalBorrowsCurrent + wethBorrowAmount);
  }

  function testMarketMember() public debuggingOnly fork(MODE_MAINNET) {
    address rahul = 0x5A9e792143bf2708b4765C144451dCa54f559a19;
    ICErc20[] memory markets = pool.getAllMarkets();

    for (uint256 i = 0; i < markets.length; i++) {
      if (pool.checkMembership(rahul, markets[i])) {
        emit log("is a member");
      } else {
        emit log("NOT a member");
      }
    }
  }

  function testGetCashError() public debuggingOnly fork(MODE_MAINNET) {
    ICErc20 market = ICErc20(0x49950319aBE7CE5c3A6C90698381b45989C99b46);
    market.getCash();
  }

  function testWrsEthBalanceOfError() public debuggingOnly fork(MODE_MAINNET) {
    address wrsEthMarketAddress = 0x49950319aBE7CE5c3A6C90698381b45989C99b46;
    ERC20 wrsEth = ERC20(0xe7903B1F75C534Dd8159b313d92cDCfbC62cB3Cd);
    wrsEth.balanceOf(0x1155b614971f16758C92c4890eD338C9e3ede6b7);
  }

  function testModeRepay() public debuggingOnly fork(MODE_MAINNET) {
    address user = 0x1A3C4E9B49e4fc595fB7e5f723159bA73a9426e7;
    ICErc20 market = usdcMarket;
    ERC20 asset = ERC20(market.underlying());

    uint256 borrowBalance = market.borrowBalanceCurrent(user);
    emit log_named_uint("borrowBalance", borrowBalance);

    vm.startPrank(user);
    asset.approve(address(market), borrowBalance);
    uint256 err = market.repayBorrow(borrowBalance / 2);

    emit log_named_uint("error", err);
  }

  function testAssetsPrices() public debuggingOnly fork(MODE_MAINNET) {
    MasterPriceOracle mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));

    emit log_named_uint("WETH price", mpo.price(WETH));
    emit log_named_uint("USDC price", mpo.price(USDC));
    emit log_named_uint("USDT price", mpo.price(USDT));
    emit log_named_uint("UNI price", mpo.price(UNI));
    emit log_named_uint("SNX price", mpo.price(SNX));
    emit log_named_uint("LINK price", mpo.price(LINK));
    emit log_named_uint("DAI price", mpo.price(DAI));
    emit log_named_uint("BAL price", mpo.price(BAL));
    emit log_named_uint("AAVE price", mpo.price(AAVE));
    emit log_named_uint("WBTC price", mpo.price(WBTC));
  }

  function testDeployedMarkets() public debuggingOnly fork(MODE_MAINNET) {
    ICErc20[] memory markets = pool.getAllMarkets();

    for (uint8 i = 0; i < markets.length; i++) {
      emit log_named_address("market", address(markets[i]));
      emit log(markets[i].symbol());
      emit log(markets[i].name());
    }
  }

  function testDisableCollateralUsdc() public debuggingOnly fork(MODE_MAINNET) {
    address user = 0xF70CBE91fB1b1AfdeB3C45Fb8CDD2E1249b5b75E;
    address usdcMarketAddr = 0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038;

    vm.startPrank(user);

    uint256 borrowed = ICErc20(usdcMarketAddr).borrowBalanceCurrent(user);

    emit log_named_uint("borrowed", borrowed);

    pool.exitMarket(usdcMarketAddr);
  }

  function testBorrowRateAtRatio() public debuggingOnly fork(MODE_MAINNET) {
    uint256 rate = levPosLens.getBorrowRateAtRatio(wethMarket, ezEthMarket, 9988992945501686, 2e18);
    emit log_named_uint("borrow rate at ratio", rate);
  }

  function testAssetAsCollateralCap() public debuggingOnly fork(MODE_MAINNET) {
    address MODE_EZETH = 0x2416092f143378750bb29b79eD961ab195CcEea5;
    address ezEthWhale = 0x2344F131B07E6AFd943b0901C55898573F0d1561;

    vm.startPrank(multisig);
    uint256 errCode = pool._deployMarket(
      1, //delegateType
      abi.encode(
        MODE_EZETH,
        address(pool),
        ap.getAddress("FeeDistributor"),
        0x21a455cEd9C79BC523D4E340c2B97521F4217817, // irm - jump rate model on mode
        "Ionic Renzo Restaked ETH",
        "ionezETH",
        0.10e18,
        0.10e18
      ),
      "",
      0.70e18
    );
    vm.stopPrank();
    require(errCode == 0, "error deploying market");

    ICErc20[] memory markets = pool.getAllMarkets();
    ICErc20 ezEthMarket = markets[markets.length - 1];

    //    uint256 cap = pool.getAssetAsCollateralValueCap(ezEthMarket, usdcMarket, false, deployer);
    uint256 cap = pool.supplyCaps(address(ezEthMarket));
    require(cap == 0, "non-zero cap");

    vm.startPrank(ezEthWhale);
    ERC20(MODE_EZETH).approve(address(ezEthMarket), 1e36);
    errCode = ezEthMarket.mint(1e18);
    require(errCode == 0, "should be unable to supply");
  }

  function testNewStoneMarketCapped() public debuggingOnly fork(MODE_MAINNET) {
    address MODE_STONE = 0x80137510979822322193FC997d400D5A6C747bf7;
    address stoneWhale = 0x76486cbED5216C82d26Ee60113E48E06C189541A;

    address redstoneOracleAddress = 0x63A1531a06F0Ac597a0DfA5A516a37073c3E1e0a;
    RedstoneAdapterPriceOracle oracle = RedstoneAdapterPriceOracle(redstoneOracleAddress);
    MasterPriceOracle mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));

    BasePriceOracle[] memory oracles = new BasePriceOracle[](1);
    oracles[0] = oracle;
    vm.prank(mpo.admin());
    mpo.add(asArray(MODE_STONE), oracles);

    vm.startPrank(multisig);
    uint256 errCode = pool._deployMarket(
      1, //delegateType
      abi.encode(
        MODE_STONE,
        address(pool),
        ap.getAddress("FeeDistributor"),
        0x21a455cEd9C79BC523D4E340c2B97521F4217817, // irm - jump rate model on mode
        "Ionic StakeStone Ether",
        "ionSTONE",
        0.10e18,
        0.10e18
      ),
      "",
      0.70e18
    );
    vm.stopPrank();
    require(errCode == 0, "error deploying market");

    ICErc20[] memory markets = pool.getAllMarkets();
    ICErc20 stoneMarket = markets[markets.length - 1];

    //    uint256 cap = pool.getAssetAsCollateralValueCap(stoneMarket, usdcMarket, false, deployer);
    uint256 cap = pool.supplyCaps(address(stoneMarket));
    require(cap == 0, "non-zero cap");

    vm.startPrank(stoneWhale);
    ERC20(MODE_STONE).approve(address(stoneMarket), 1e36);
    vm.expectRevert("not authorized");
    errCode = stoneMarket.mint(1e18);
    //require(errCode != 0, "should be unable to supply");
  }

  function testRegisterSFS() public debuggingOnly fork(MODE_MAINNET) {
    emit log_named_address("pool admin", pool.admin());

    vm.startPrank(multisig);
    pool.registerInSFS();

    ICErc20[] memory markets = pool.getAllMarkets();

    for (uint8 i = 0; i < markets.length; i++) {
      markets[i].registerInSFS();
    }
  }

  function upgradePool() internal {
    ComptrollerFirstExtension newComptrollerExtension = new ComptrollerFirstExtension();

    Unitroller asUnitroller = Unitroller(payable(address(pool)));

    // upgrade to the new comptroller extension
    vm.startPrank(asUnitroller.admin());
    asUnitroller._registerExtension(newComptrollerExtension, DiamondExtension(asUnitroller._listExtensions()[1]));

    //asUnitroller._upgrade();
    vm.stopPrank();
  }

  function testModeBorrowRate() public fork(MODE_MAINNET) {
    //ICErc20[] memory markets = pool.getAllMarkets();

    IonicComptroller pool = ezEthMarket.comptroller();
    vm.prank(pool.admin());
    ezEthMarket._setInterestRateModel(JumpRateModel(0x413aD59b80b1632988d478115a466bdF9B26743a));

    JumpRateModel discRateModel = JumpRateModel(ezEthMarket.interestRateModel());

    uint256 borrows = 200e18;
    uint256 cash = 5000e18 - borrows;
    uint256 reserves = 1e18;
    uint256 rate = discRateModel.getBorrowRate(cash, borrows, reserves);

    emit log_named_uint("rate per year %e", rate * discRateModel.blocksPerYear());
  }

  function testModeFetchBorrowers() public fork(MODE_MAINNET) {
    //    address[] memory borrowers = pool.getAllBorrowers();
    //    emit log_named_uint("borrowers.len", borrowers.length);

    //upgradePool();

    (uint256 totalPages, address[] memory borrowersPage) = pool.getPaginatedBorrowers(1, 0);

    emit log_named_uint("total pages with 300 size (default)", totalPages);

    (totalPages, borrowersPage) = pool.getPaginatedBorrowers(totalPages - 1, 50);
    emit log_named_array("last page of 300 borrowers", borrowersPage);

    (totalPages, borrowersPage) = pool.getPaginatedBorrowers(1, 50);
    emit log_named_uint("total pages with 50 size", totalPages);
    emit log_named_array("page of 50 borrowers", borrowersPage);

    //    for (uint256 i = 0; i < borrowers.length; i++) {
    //      (
    //        uint256 error,
    //        uint256 collateralValue,
    //        uint256 liquidity,
    //        uint256 shortfall
    //      ) = pool.getAccountLiquidity(borrowers[i]);
    //
    //      emit log("");
    //      emit log_named_address("user", borrowers[i]);
    //      emit log_named_uint("collateralValue", collateralValue);
    //      if (liquidity > 0) emit log_named_uint("liquidity", liquidity);
    //      if (shortfall > 0) emit log_named_uint("SHORTFALL", shortfall);
    //    }
  }

  function testModeAccountLiquidity() public debuggingOnly fork(MODE_MAINNET) {
    _testAccountLiquidity(0x0C387030a5D3AcDcde1A8DDaF26df31BbC1CE763);
  }

  function _testAccountLiquidity(address borrower) internal {
    (uint256 error, uint256 collateralValue, uint256 liquidity, uint256 shortfall) = pool.getAccountLiquidity(borrower);

    emit log("");
    emit log_named_address("user", borrower);
    emit log_named_uint("collateralValue", collateralValue);
    if (liquidity > 0) emit log_named_uint("liquidity", liquidity);
    if (shortfall > 0) emit log_named_uint("SHORTFALL", shortfall);
  }

  function testModeDeployMarket() public debuggingOnly fork(MODE_MAINNET) {
    address MODE_WEETH = 0x028227c4dd1e5419d11Bb6fa6e661920c519D4F5;
    address weEthWhale = 0x6e55a90772B92f17f87Be04F9562f3faafd0cc38;

    vm.startPrank(pool.admin());
    uint256 errCode = pool._deployMarket(
      1, //delegateType
      abi.encode(
        MODE_WEETH,
        address(pool),
        ap.getAddress("FeeDistributor"),
        0x21a455cEd9C79BC523D4E340c2B97521F4217817, // irm - jump rate model on mode
        "Ionic Wrapped eETH",
        "ionweETH",
        0.10e18,
        0.10e18
      ),
      "",
      0.70e18
    );
    vm.stopPrank();
    require(errCode == 0, "error deploying market");

    ICErc20[] memory markets = pool.getAllMarkets();
    ICErc20 weEthMarket = markets[markets.length - 1];

    //    uint256 cap = pool.getAssetAsCollateralValueCap(weEthMarket, usdcMarket, false, deployer);
    uint256 cap = pool.supplyCaps(address(weEthMarket));
    require(cap == 0, "non-zero cap");

    vm.startPrank(weEthWhale);
    ERC20(MODE_WEETH).approve(address(weEthMarket), 1e36);
    errCode = weEthMarket.mint(0.01e18);
    require(errCode == 0, "should be unable to supply");
  }

  function testModeWrsETH() public debuggingOnly forkAtBlock(MODE_MAINNET, 6635923) {
    address wrsEth = 0x4186BFC76E2E237523CBC30FD220FE055156b41F;
    RedstoneAdapterPriceOracleWrsETH oracle = new RedstoneAdapterPriceOracleWrsETH(
      0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256
    );
    MasterPriceOracle mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));

    BasePriceOracle[] memory oracles = new BasePriceOracle[](1);
    oracles[0] = oracle;
    vm.prank(multisig);
    mpo.add(asArray(wrsEth), oracles);

    uint256 price = mpo.price(wrsEth);
    emit log_named_uint("price of wrsEth", price);
  }

  function testModeWeETH() public debuggingOnly forkAtBlock(MODE_MAINNET, 6861468) {
    address weEth = 0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A;
    RedstoneAdapterPriceOracleWeETH oracle = new RedstoneAdapterPriceOracleWeETH(
      0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256
    );
    MasterPriceOracle mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));

    BasePriceOracle[] memory oracles = new BasePriceOracle[](1);
    oracles[0] = oracle;
    vm.prank(multisig);
    mpo.add(asArray(weEth), oracles);

    uint256 price = mpo.price(weEth);
    emit log_named_uint("price of weEth", price);
    assertEq(price, 1036212437077011599);
  }

  function testPERLiquidation() public debuggingOnly forkAtBlock(MODE_MAINNET, 10255413) {
    vm.prank(0x5Cc070844E98F4ceC5f2fBE1592fB1ed73aB7b48);
    _functionCall(
      0xa12c1E460c06B1745EFcbfC9A1f666a8749B0e3A,
      hex"20b72325000000000000000000000000f28570694a6c9cd0494955966ae75af61abf5a0700000000000000000000000000000000000000000000000001bc1214ed792fbb0000000000000000000000004341620757bee7eb4553912fafc963e59c949147000000000000000000000000c53edeafb6d502daec5a7015d67936cea0cd0f520000000000000000000000000000000000000000000000000000000000000000",
      "error in call"
    );
  }

  function testCtokenUpgrade() public debuggingOnly forkAtBlock(MODE_MAINNET, 10255413) {
    CErc20PluginRewardsDelegate newImpl = new CErc20PluginRewardsDelegate();
    TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(address(wethMarket)));

    (uint256[] memory poolIds, PoolDirectory.Pool[] memory pools) = PoolDirectory(
      0x39C353Cf9041CcF467A04d0e78B63d961E81458a
    ).getActivePools();

    emit log_named_uint("First Pool ID", poolIds[0]);
    emit log_named_uint("First Pool ID", poolIds[1]);
    emit log_named_string("First Pool Address", pools[0].name);
    emit log_named_string("First Pool Address", pools[0].name);
    emit log_named_address("First Pool Address", pools[0].creator);
    emit log_named_address("First Pool Address", pools[1].creator);
    emit log_named_address("First Pool Address", pools[0].comptroller);
    emit log_named_address("First Pool Address", pools[1].comptroller);
    //bytes32 bytesAtSlot = vm.load(address(proxy), 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103);
    //address admin = address(uint160(uint256(bytesAtSlot)));
    //vm.prank(admin);
    //proxy.upgradeTo(address(newImpl));

    //vm.prank(dpa.owner());
    //proxy.upgradeTo(address(newImpl));
  }

  function testAerodromeV2Liquidator() public debuggingOnly forkAtBlock(BASE_MAINNET, 19968360) {
    AerodromeV2Liquidator liquidator = new AerodromeV2Liquidator();
    IERC20Upgradeable hyUSD = IERC20Upgradeable(0xCc7FF230365bD730eE4B352cC2492CEdAC49383e);
    IERC20Upgradeable eUSD = IERC20Upgradeable(0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4);
    IERC20Upgradeable usdc = IERC20Upgradeable(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913);
    address hyusdWhale = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;
    address usdcWhale = 0xaac391f166f33CdaEfaa4AfA6616A3BEA66B694d;
    address eusdWhale = 0xEE8Bd6594E046d72D592ac0e278E3CA179b8f189;
    address aerodromeV2Router = 0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43;

    vm.startPrank(eusdWhale);
    eUSD.transfer(address(liquidator), 1000 ether);
    IRouter_Aerodrome.Route[] memory path = new IRouter_Aerodrome.Route[](1);
    path[0] = IRouter_Aerodrome.Route({
      from: address(eUSD),
      to: address(usdc),
      stable: true,
      factory: 0x420DD381b31aEf6683db6B902084cB0FFECe40Da
    });
    liquidator.redeem(eUSD, 1000 ether, abi.encode(aerodromeV2Router, path));
    emit log_named_uint("usdc received", usdc.balanceOf(address(liquidator)));
    vm.stopPrank();
  }

  function testAerodromeCLLiquidator() public debuggingOnly forkAtBlock(BASE_MAINNET, 19968360) {
    AerodromeCLLiquidator liquidator = new AerodromeCLLiquidator();
    IERC20Upgradeable weth = IERC20Upgradeable(0x4200000000000000000000000000000000000006);
    address superOETHWhale = 0xF1010eE787Ee588766b441d7cC397b40DdFB17a3;
    address aerodromeCLRouter = 0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5;

    vm.startPrank(superOETHWhale);
    superOETH.transfer(address(liquidator), 1 ether);
    liquidator.redeem(superOETH, 1 ether, abi.encode(address(superOETH), address(weth), int24(1), aerodromeCLRouter));
    emit log_named_uint("weth received", weth.balanceOf(address(liquidator)));
    vm.stopPrank();
  }

  function testAerodromeCLLiquidatorWrap() public debuggingOnly forkAtBlock(BASE_MAINNET, 20203998) {
    IERC20Upgradeable weth = IERC20Upgradeable(0x4200000000000000000000000000000000000006);
    address wethWhale = 0x751b77C43643a63362Ab024d466fcC1d75354295;
    address aerodromeCLRouter = 0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5;

    AerodromeCLLiquidator liquidator = AerodromeCLLiquidator(0xb50De36105F6053006306553AB54e77224818B9B);

    vm.startPrank(wethWhale);
    weth.transfer(address(liquidator), 1 ether);
    liquidator.redeem(
      weth,
      1 ether,
      abi.encode(address(weth), address(wsuperOETH), aerodromeCLRouter, address(0), address(superOETH), 1)
    );
    emit log_named_uint("wsuperOETH received", wsuperOETH.balanceOf(address(liquidator)));
    vm.stopPrank();
  }

  function testAerodromeCLLiquidatorUnwrap() public debuggingOnly forkAtBlock(BASE_MAINNET, 19968360) {
    IERC20Upgradeable weth = IERC20Upgradeable(0x4200000000000000000000000000000000000006);
    address wsuperOethWhale = 0x0EEaCD4c475040463389d15EAd034d1291b008b1;
    address aerodromeCLRouter = 0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5;

    AerodromeCLLiquidator liquidator = new AerodromeCLLiquidator();

    vm.startPrank(wsuperOethWhale);
    wsuperOETH.transfer(address(liquidator), 1 ether);
    liquidator.redeem(
      wsuperOETH,
      1 ether,
      abi.encode(address(wsuperOETH), address(weth), aerodromeCLRouter, address(superOETH), address(0), 1)
    );
    emit log_named_uint("weth received", weth.balanceOf(address(liquidator)));
    vm.stopPrank();
  }

  function testCurveSwapLiquidatorUSDCtowUSDM() public debuggingOnly forkAtBlock(BASE_MAINNET, 20237792) {
    address _pool = 0x63Eb7846642630456707C3efBb50A03c79B89D81;
    address usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address usdm = 0x59D9356E565Ab3A36dD77763Fc0d87fEaf85508C;
    address wUSDM = 0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812;
    address usdcWhale = 0x134575ff75F9882ca905EE1D78C9340C091d6056;
    CurveV2LpTokenPriceOracleNoRegistry oracle = new CurveV2LpTokenPriceOracleNoRegistry();
    CurveSwapLiquidator liquidator = new CurveSwapLiquidator();
    vm.prank(oracle.owner());
    oracle.registerPool(_pool, _pool);
    vm.prank(usdcWhale);
    IERC20Upgradeable(usdc).transfer(address(liquidator), 100e6);
    liquidator.redeem(IERC20Upgradeable(usdc), 100e6, abi.encode(oracle, wUSDM, address(0), usdm));
    emit log_named_uint("wUSDM received", IERC20Upgradeable(wUSDM).balanceOf(address(liquidator)));
  }

  function testCurveSwapLiquidatorwUSDMtoUSDC() public debuggingOnly forkAtBlock(BASE_MAINNET, 20237792) {
    address _pool = 0x63Eb7846642630456707C3efBb50A03c79B89D81;
    address usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address usdm = 0x59D9356E565Ab3A36dD77763Fc0d87fEaf85508C;
    address wUSDM = 0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812;
    address wusdmWhale = 0x9b8b04B6f82cD5e1dae58cA3614d445F93DeFc5c;
    CurveV2LpTokenPriceOracleNoRegistry oracle = new CurveV2LpTokenPriceOracleNoRegistry();
    CurveSwapLiquidator liquidator = new CurveSwapLiquidator();
    vm.prank(oracle.owner());
    oracle.registerPool(_pool, _pool);

    vm.startPrank(wusdmWhale);
    IERC20Upgradeable(wUSDM).transfer(address(liquidator), 30 ether);
    liquidator.redeem(IERC20Upgradeable(wUSDM), 30 ether, abi.encode(oracle, usdc, usdm, address(0)));
    emit log_named_uint("usdc received", IERC20Upgradeable(usdc).balanceOf(address(liquidator)));
  }

  function testKimLiquidator() public debuggingOnly forkAtBlock(MODE_MAINNET, 13579406) {
    address weth = 0x4200000000000000000000000000000000000006;
    address usdc = 0xd988097fb8612cc24eeC14542bC03424c656005f;
    address kimRouter = 0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8;
    address wethWhale = 0xe9b14a1Be94E70900EDdF1E22A4cB8c56aC9e10a;
    AlgebraSwapLiquidator liquidator = AlgebraSwapLiquidator(0x5cA3fd2c285C4138185Ef1BdA7573D415020F3C8);
    vm.startPrank(wethWhale);
    IERC20Upgradeable(weth).transfer(address(liquidator), 2018770577362160);
    liquidator.redeem(IERC20Upgradeable(weth), 2018770577362160, abi.encode(usdc, kimRouter));
    emit log_named_uint("usdc received", IERC20Upgradeable(usdc).balanceOf(address(liquidator)));
  }

  function testVelodromeV2Liquidator_mode_usdcToWeth() public debuggingOnly forkAtBlock(MODE_MAINNET, 13881743) {
    VelodromeV2Liquidator liquidator = new VelodromeV2Liquidator();
    IERC20Upgradeable usdc = IERC20Upgradeable(0xd988097fb8612cc24eeC14542bC03424c656005f);
    IERC20Upgradeable weth = IERC20Upgradeable(0x4200000000000000000000000000000000000006);
    address usdcWhale = 0xFd1D36995d76c0F75bbe4637C84C06E4A68bBB3a;

    address veloRouter = 0x3a63171DD9BebF4D07BC782FECC7eb0b890C2A45;

    vm.startPrank(usdcWhale);
    usdc.transfer(address(liquidator), 1000 * 10e6);
    IRouter_Velodrome.Route[] memory path = new IRouter_Velodrome.Route[](1);
    path[0] = IRouter_Velodrome.Route({ from: address(usdc), to: address(weth), stable: false });
    liquidator.redeem(usdc, 1000 * 10e6, abi.encode(veloRouter, path));
    emit log_named_uint("weth received", weth.balanceOf(address(liquidator)));
    vm.stopPrank();
  }

  function testVelodromeV2Liquidator_mode_wethToUSDC() public debuggingOnly forkAtBlock(MODE_MAINNET, 13881743) {
    VelodromeV2Liquidator liquidator = new VelodromeV2Liquidator();
    IERC20Upgradeable weth = IERC20Upgradeable(0x4200000000000000000000000000000000000006);
    IERC20Upgradeable usdc = IERC20Upgradeable(0xd988097fb8612cc24eeC14542bC03424c656005f);
    address wethWhale = 0xe9b14a1Be94E70900EDdF1E22A4cB8c56aC9e10a;

    address veloRouter = 0x3a63171DD9BebF4D07BC782FECC7eb0b890C2A45;

    vm.startPrank(wethWhale);
    weth.transfer(address(liquidator), 1 ether);
    IRouter_Velodrome.Route[] memory path = new IRouter_Velodrome.Route[](1);
    path[0] = IRouter_Velodrome.Route({ from: address(weth), to: address(usdc), stable: false });

    liquidator.redeem(weth, 1 ether, abi.encode(veloRouter, path));
    emit log_named_uint("usdc received", usdc.balanceOf(address(liquidator)));
    vm.stopPrank();
  }

  function test_claimRewardFromLeveredPosition() public debuggingOnly fork(BASE_MAINNET) {
    LeveredPosition position = LeveredPosition(
      0x3a0eA2C577b0e0f2CAaEcC2b8fF8fF1850267ba2 // 20 days old
    );
    ILeveredPositionFactory factory = position.factory();

    vm.prank(address(factory));
    LeveredPosition dummy = new LeveredPosition(
      msg.sender,
      ICErc20(0x49420311B518f3d0c94e897592014de53831cfA3),
      ICErc20(0xa900A17a49Bc4D442bA7F72c39FA2108865671f0)
    );
    emit log_named_address("dummy", address(dummy));

    vm.startPrank(factory.owner());
    DiamondBase(address(factory))._registerExtension(
      new LeveredPositionFactoryFirstExtension(),
      DiamondExtension(0x115455f15ef67e298F012F225B606D3c4Daa1d60)
    );
    factory._setPositionsExtension(LeveredPosition.claimRewardsFromRouter.selector, address(dummy));
    vm.stopPrank();

    {
      // mock the usdz call
      vm.mockCall(
        0x04D5ddf5f3a8939889F11E97f8c4BB48317F1938,
        abi.encodeWithSelector(IERC20Upgradeable.balanceOf.selector),
        abi.encode(53307671999615298341926)
      );
    }

    vm.startPrank(0xC13110d04f22ed464Cb72A620fF8163585358Ff9);
    (address[] memory rewardTokens, uint256[] memory rewards) = position.claimRewardsFromRouter(
      0xB1402333b12fc066C3D7F55d37944D5e281a3e8B
    );
    emit log_named_uint("reward tokens", rewardTokens.length);
    emit log_named_uint("rewards", rewards.length);
    vm.stopPrank();
  }

  function test_liquidateWithAggregator() public debuggingOnly forkAtBlock(MODE_MAINNET, 15435970) {
    IonicUniV3Liquidator liquidator = IonicUniV3Liquidator(payable(0x50F13EC4B68c9522260d3ccd4F19826679B3Ce5C));
    emit log_named_address("liquidator", address(liquidator));
    address cErc20 = 0xA0D844742B4abbbc43d8931a6Edb00C56325aA18; // weEth
    address cTokenCollateral = 0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038; // usdc
    uint256 repayAmount = 843900759317990;
    address borrower = 0x1Bec4f239F1Ec11FD8DC7B31A8fea7A5bA5a9Aa4;
    address aggregatorTarget = 0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE; // lifi
    // 0xd988097fb8612cc24eeC14542bC03424c656005f usdc
    // 0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A weeth
    bytes memory aggregatorData = vm.parseBytes(
      "0x4666fc800d27477c9a16fe2929353656c1222839791dbe26e815e7533f731ea9a6b919bb00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000050f13ec4b68c9522260d3ccd4f19826679b3ce5c0000000000000000000000000000000000000000000000000002ff85fb26dbe8000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000086c6966692d617069000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307830303030303030303030303030303030303030303030303030303030303030303030303030303030000000000000000000000000000000000000000000000000000000000000000000007e15eb462cdc67cf92af1f7102465a8f8c7848740000000000000000000000007e15eb462cdc67cf92af1f7102465a8f8c784874000000000000000000000000d988097fb8612cc24eec14542bc03424c656005f00000000000000000000000004c0599ae5a44757c0af6f9ec3b93da8976c150a000000000000000000000000000000000000000000000000000000000027891800000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000f283bd37f90001d988097fb8612cc24eec14542bc03424c656005f000104c0599ae5a44757c0af6f9ec3b93da8976c150a0327891807030361590977620147ae00019b57dca972db5d8866c630554acdbdfe58b2659c000000011231deb6f5749ef6ce6943a275a1d3e7486f4eae59725ade04010205000601020203000205000100010400ff0000000000000000000000000053e85d00f2c6578a1205b842255ab9df9d05374425ba258e510faca5ab7ff941a1584bdd2174c94dd988097fb8612cc24eec14542bc03424c656005f4200000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000"
    );

    emit log_named_uint(
      "before collateral",
      IERC20Upgradeable(ICErc20(cTokenCollateral).underlying()).balanceOf(address(this))
    );
    emit log_named_uint("before borrow", IERC20Upgradeable(ICErc20(cErc20).underlying()).balanceOf(address(this)));

    vm.startPrank(0x1155b614971f16758C92c4890eD338C9e3ede6b7);
    liquidator.safeLiquidateWithAggregator(
      borrower,
      repayAmount,
      ICErc20(cErc20),
      ICErc20(cTokenCollateral),
      aggregatorTarget,
      aggregatorData
    );
    vm.stopPrank();

    emit log_named_uint(
      "profit collateral",
      IERC20Upgradeable(ICErc20(cTokenCollateral).underlying()).balanceOf(address(this))
    );
    emit log_named_uint("profit borrow", IERC20Upgradeable(ICErc20(cErc20).underlying()).balanceOf(address(this)));
  }

  function _functionCall(
    address target,
    bytes memory data,
    string memory errorMessage
  ) internal returns (bytes memory) {
    (bool success, bytes memory returndata) = target.call(data);

    if (!success) {
      // Look for revert reason and bubble it up if present
      if (returndata.length > 0) {
        // The easiest way to bubble the revert reason is using memory via assembly

        // solhint-disable-next-line no-inline-assembly
        assembly {
          let returndata_size := mload(returndata)
          revert(add(32, returndata), returndata_size)
        }
      } else {
        revert(errorMessage);
      }
    }

    return returndata;
  }

  function testRawCall() public debuggingOnly forkAtBlock(BASE_MAINNET, 20569373) {
    address caller = 0xC13110d04f22ed464Cb72A620fF8163585358Ff9;
    address target = 0x180272dDf5767C771b3a8d37A2DC6cA507aaa1d9;

    ILeveredPositionFactory factory = ILeveredPositionFactory(ap.getAddress("LeveredPositionFactory"));
    ILiquidatorsRegistry registry = factory.liquidatorsRegistry();

    AerodromeCLLiquidator aerodomeClLiquidator = new AerodromeCLLiquidator();

    IERC20Upgradeable inputToken = IERC20Upgradeable(WETH);
    IERC20Upgradeable outputToken = wsuperOETH;
    vm.startPrank(registry.owner());
    registry._setRedemptionStrategy(aerodomeClLiquidator, inputToken, outputToken);
    registry._setRedemptionStrategy(aerodomeClLiquidator, outputToken, inputToken);
    vm.stopPrank();

    bytes memory data = hex"c393d0e3";
    vm.prank(caller);
    _functionCall(target, data, "raw call failed");

    uint256 superOETHBalance = superOETH.balanceOf(target);
    emit log_named_uint("balance of levered position", superOETHBalance);
  }
}
