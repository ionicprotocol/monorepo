// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import { ERC20 } from "solmate/tokens/ERC20.sol";

import { IonicFlywheelCore } from "./IonicFlywheelCore.sol";
import { IonicComptroller } from "../../../compound/ComptrollerInterface.sol";
import { ICErc20 } from "../../../compound/CTokenInterfaces.sol";
import { BasePriceOracle } from "../../../oracles/BasePriceOracle.sol";
import { PoolDirectory } from "../../../PoolDirectory.sol";

interface IPriceOracle_IFLR {
  function getUnderlyingPrice(ERC20 cToken) external view returns (uint256);

  function price(address underlying) external view returns (uint256);
}

contract IonicFlywheelLensRouter {
  PoolDirectory public fpd;

  constructor(PoolDirectory _fpd) {
    fpd = _fpd;
  }

  struct MarketRewardsInfo {
    /// @dev comptroller oracle price of market underlying
    uint256 underlyingPrice;
    ICErc20 market;
    RewardsInfo[] rewardsInfo;
  }

  struct RewardsInfo {
    /// @dev rewards in `rewardToken` paid per underlying staked token in `market` per second
    uint256 rewardSpeedPerSecondPerToken;
    /// @dev comptroller oracle price of reward token
    uint256 rewardTokenPrice;
    /// @dev APR scaled by 1e18. Calculated as rewardSpeedPerSecondPerToken * rewardTokenPrice * 365.25 days / underlyingPrice * 1e18 / market.exchangeRate
    uint256 formattedAPR;
    address flywheel;
    address rewardToken;
  }

  function getPoolMarketRewardsInfo(IonicComptroller comptroller) external view returns (MarketRewardsInfo[] memory) {
    ICErc20[] memory markets = comptroller.getAllMarkets();
    return _getMarketRewardsInfo(markets, comptroller);
  }

  function getMarketRewardsInfo(ICErc20[] memory markets) external view returns (MarketRewardsInfo[] memory) {
    IonicComptroller pool;
    for (uint256 i = 0; i < markets.length; i++) {
      ICErc20 asMarket = ICErc20(address(markets[i]));
      if (address(pool) == address(0)) pool = asMarket.comptroller();
      else require(asMarket.comptroller() == pool);
    }
    return _getMarketRewardsInfo(markets, pool);
  }

  function _getMarketRewardsInfo(ICErc20[] memory markets, IonicComptroller comptroller)
    internal
    view
    returns (MarketRewardsInfo[] memory)
  {
    if (address(comptroller) == address(0) || markets.length == 0) return new MarketRewardsInfo[](0);

    address[] memory flywheels = comptroller.getAccruingFlywheels();
    address[] memory rewardTokens = new address[](flywheels.length);
    uint256[] memory rewardTokenPrices = new uint256[](flywheels.length);
    uint256[] memory rewardTokenDecimals = new uint256[](flywheels.length);
    BasePriceOracle oracle = comptroller.oracle();

    MarketRewardsInfo[] memory infoList = new MarketRewardsInfo[](markets.length);
    for (uint256 i = 0; i < markets.length; i++) {
      RewardsInfo[] memory rewardsInfo = new RewardsInfo[](flywheels.length);

      ICErc20 market = ICErc20(address(markets[i]));
      uint256 price = oracle.price(market.underlying()); // scaled to 1e18

      if (i == 0) {
        for (uint256 j = 0; j < flywheels.length; j++) {
          ERC20 rewardToken = IonicFlywheelCore(flywheels[j]).rewardToken();
          rewardTokens[j] = address(rewardToken);
          rewardTokenPrices[j] = oracle.price(address(rewardToken)); // scaled to 1e18
          rewardTokenDecimals[j] = uint256(rewardToken.decimals());
        }
      }

      for (uint256 j = 0; j < flywheels.length; j++) {
        IonicFlywheelCore flywheel = IonicFlywheelCore(flywheels[j]);

        uint256 rewardSpeedPerSecondPerToken = getRewardSpeedPerSecondPerToken(
          flywheel,
          market,
          rewardTokenDecimals[j]
        );
        uint256 apr = getApr(
          rewardSpeedPerSecondPerToken,
          rewardTokenPrices[j],
          price, 
          market.exchangeRateCurrent(),
          address(flywheel.flywheelBooster()) != address(0)
        );

        rewardsInfo[j] = RewardsInfo({
          rewardSpeedPerSecondPerToken: rewardSpeedPerSecondPerToken, // scaled in 1e18
          rewardTokenPrice: rewardTokenPrices[j],
          formattedAPR: apr, // scaled in 1e18
          flywheel: address(flywheel),
          rewardToken: rewardTokens[j]
        });
      }

      infoList[i] = MarketRewardsInfo({ market: market, rewardsInfo: rewardsInfo, underlyingPrice: price });
    }

    return infoList;
  }

  function scaleIndexDiff(uint256 indexDiff, uint256 decimals) internal pure returns (uint256) {
    return decimals <= 18 ? uint256(indexDiff) * (10**(18 - decimals)) : uint256(indexDiff) / (10**(decimals - 18));
  }

  function getRewardSpeedPerSecondPerToken(
    IonicFlywheelCore flywheel,
    ICErc20 market,
    uint256 decimals
  ) internal view returns (uint256) {
    ERC20 strategy = ERC20(address(market));
    return flywheel.getRewardsPerSecondPerToken(strategy);
  }

  function getApr(
    uint256 rewardSpeedPerSecondPerToken,
    uint256 rewardTokenPrice,
    uint256 underlyingPrice,
    uint256 exchangeRate,
    bool isBorrow
  ) internal pure returns (uint256) {
    if (rewardSpeedPerSecondPerToken == 0) return 0;
    uint256 nativeSpeedPerSecondPerCToken = rewardSpeedPerSecondPerToken * rewardTokenPrice; // scaled to 1e36
    uint256 nativeSpeedPerYearPerCToken = nativeSpeedPerSecondPerCToken * 365.25 days; // scaled to 1e36
    uint256 assetSpeedPerYearPerCToken = nativeSpeedPerYearPerCToken / underlyingPrice; // scaled to 1e18
    uint256 assetSpeedPerYearPerCTokenScaled = assetSpeedPerYearPerCToken * 1e18; // scaled to 1e36
    uint256 apr = assetSpeedPerYearPerCTokenScaled;
    if (!isBorrow) {
      // if not borrowing, use exchange rate to scale
      apr = assetSpeedPerYearPerCTokenScaled / exchangeRate; // scaled to 1e18
    } else {
      apr = assetSpeedPerYearPerCTokenScaled / 1e18; // scaled to 1e18
    }
    return apr;
  }

  function getRewardsAprForMarket(ICErc20 market) internal returns (int256 totalMarketRewardsApr) {
    IonicComptroller comptroller = market.comptroller();
    BasePriceOracle oracle = comptroller.oracle();
    uint256 underlyingPrice = oracle.getUnderlyingPrice(market);

    address[] memory flywheels = comptroller.getAccruingFlywheels();
    for (uint256 j = 0; j < flywheels.length; j++) {
      IonicFlywheelCore flywheel = IonicFlywheelCore(flywheels[j]);
      ERC20 rewardToken = flywheel.rewardToken();

      uint256 rewardSpeedPerSecondPerToken = getRewardSpeedPerSecondPerToken(
        flywheel,
        market,
        uint256(rewardToken.decimals())
      );

      uint256 marketApr = getApr(
        rewardSpeedPerSecondPerToken,
        oracle.price(address(rewardToken)),
        underlyingPrice,
        market.exchangeRateCurrent(),
        address(flywheel.flywheelBooster()) != address(0)
      );

      totalMarketRewardsApr += int256(marketApr);
    }
  }

  function getUserNetValueDeltaForMarket(
    address user,
    ICErc20 market,
    int256 offchainApr,
    int256 blocksPerYear
  ) internal returns (int256) {
    IonicComptroller comptroller = market.comptroller();
    BasePriceOracle oracle = comptroller.oracle();
    int256 netApr = getRewardsAprForMarket(market) +
      getUserInterestAprForMarket(user, market, blocksPerYear) +
      offchainApr;
    return (netApr * int256(market.balanceOfUnderlying(user)) * int256(oracle.getUnderlyingPrice(market))) / 1e36;
  }

  function getUserInterestAprForMarket(
    address user,
    ICErc20 market,
    int256 blocksPerYear
  ) internal returns (int256) {
    uint256 borrows = market.borrowBalanceCurrent(user);
    uint256 supplied = market.balanceOfUnderlying(user);
    uint256 supplyRatePerBlock = market.supplyRatePerBlock();
    uint256 borrowRatePerBlock = market.borrowRatePerBlock();

    IonicComptroller comptroller = market.comptroller();
    BasePriceOracle oracle = comptroller.oracle();
    uint256 assetPrice = oracle.getUnderlyingPrice(market);
    uint256 collateralValue = (supplied * assetPrice) / 1e18;
    uint256 borrowsValue = (borrows * assetPrice) / 1e18;

    uint256 yieldValuePerBlock = collateralValue * supplyRatePerBlock;
    uint256 interestOwedValuePerBlock = borrowsValue * borrowRatePerBlock;

    if (collateralValue == 0) return 0;
    return ((int256(yieldValuePerBlock) - int256(interestOwedValuePerBlock)) * blocksPerYear) / int256(collateralValue);
  }

  struct AdjustedUserNetAprVars {
    int256 userNetAssetsValue;
    int256 userNetValueDelta;
    BasePriceOracle oracle;
    ICErc20[] markets;
    IonicComptroller pool;
  }

  function getAdjustedUserNetApr(
    address user,
    int256 blocksPerYear,
    address[] memory offchainRewardsAprMarkets,
    int256[] memory offchainRewardsAprs
  ) public returns (int256) {
    AdjustedUserNetAprVars memory vars;

    (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();
    for (uint256 i = 0; i < pools.length; i++) {
      IonicComptroller pool = IonicComptroller(pools[i].comptroller);
      vars.oracle = pool.oracle();
      vars.markets = pool.getAllMarkets();
      for (uint256 j = 0; j < vars.markets.length; j++) {
        int256 offchainRewardsApr = 0;
        for (uint256 k = 0; k < offchainRewardsAprMarkets.length; k++) {
          if (offchainRewardsAprMarkets[k] == address(vars.markets[j])) offchainRewardsApr = offchainRewardsAprs[k];
        }
        vars.userNetAssetsValue +=
          int256(vars.markets[j].balanceOfUnderlying(user) * vars.oracle.getUnderlyingPrice(vars.markets[j])) /
          1e18;
        vars.userNetValueDelta += getUserNetValueDeltaForMarket(
          user,
          vars.markets[j],
          offchainRewardsApr,
          blocksPerYear
        );
      }
    }

    if (vars.userNetAssetsValue == 0) return 0;
    else return (vars.userNetValueDelta * 1e18) / vars.userNetAssetsValue;
  }

  function getUserNetApr(address user, int256 blocksPerYear) external returns (int256) {
    address[] memory emptyAddrArray = new address[](0);
    int256[] memory emptyIntArray = new int256[](0);
    return getAdjustedUserNetApr(user, blocksPerYear, emptyAddrArray, emptyIntArray);
  }

  function getAllRewardTokens() public view returns (address[] memory uniqueRewardTokens) {
    (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();

    uint256 rewardTokensCounter;
    for (uint256 i = 0; i < pools.length; i++) {
      IonicComptroller pool = IonicComptroller(pools[i].comptroller);
      address[] memory fws = pool.getRewardsDistributors();

      rewardTokensCounter += fws.length;
    }

    address[] memory rewardTokens = new address[](rewardTokensCounter);

    uint256 uniqueRewardTokensCounter = 0;
    for (uint256 i = 0; i < pools.length; i++) {
      IonicComptroller pool = IonicComptroller(pools[i].comptroller);
      address[] memory fws = pool.getRewardsDistributors();

      for (uint256 j = 0; j < fws.length; j++) {
        address rwToken = address(IonicFlywheelCore(fws[j]).rewardToken());
        if (rwToken == address(0)) break;

        bool added;
        for (uint256 k = 0; k < rewardTokens.length; k++) {
          if (rwToken == rewardTokens[k]) {
            added = true;
            break;
          }
        }
        if (!added) rewardTokens[uniqueRewardTokensCounter++] = rwToken;
      }
    }

    uniqueRewardTokens = new address[](uniqueRewardTokensCounter);
    for (uint256 i = 0; i < uniqueRewardTokensCounter; i++) {
      uniqueRewardTokens[i] = rewardTokens[i];
    }
  }

  function claimAllRewardTokens(address user) external returns (address[] memory, uint256[] memory) {
    address[] memory rewardTokens = getAllRewardTokens();
    uint256[] memory rewardsClaimedForToken = new uint256[](rewardTokens.length);

    for (uint256 i = 0; i < rewardTokens.length; i++) {
      rewardsClaimedForToken[i] = claimRewardsOfRewardToken(user, rewardTokens[i]);
    }

    return (rewardTokens, rewardsClaimedForToken);
  }

  function claimRewardsOfRewardToken(address user, address rewardToken) public returns (uint256 rewardsClaimed) {
    uint256 balanceBefore = ERC20(rewardToken).balanceOf(user);
    (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();
    for (uint256 i = 0; i < pools.length; i++) {
      IonicComptroller pool = IonicComptroller(pools[i].comptroller);
      ERC20[] memory markets;
      {
        ICErc20[] memory cerc20s = pool.getAllMarkets();
        markets = new ERC20[](cerc20s.length);
        for (uint256 j = 0; j < cerc20s.length; j++) {
          markets[j] = ERC20(address(cerc20s[j]));
        }
      }

      address[] memory flywheelAddresses = pool.getAccruingFlywheels();
      for (uint256 k = 0; k < flywheelAddresses.length; k++) {
        IonicFlywheelCore flywheel = IonicFlywheelCore(flywheelAddresses[k]);
        if (address(flywheel.rewardToken()) == rewardToken) {
          for (uint256 m = 0; m < markets.length; m++) {
            flywheel.accrue(markets[m], user);
          }
          flywheel.claimRewards(user);
        }
      }
    }

    uint256 balanceAfter = ERC20(rewardToken).balanceOf(user);
    return balanceAfter - balanceBefore;
  }

  function claimRewardsForMarket(
    address user,
    ERC20 market,
    IonicFlywheelCore[] calldata flywheels,
    bool[] calldata accrue
  )
    external
    returns (
      IonicFlywheelCore[] memory,
      address[] memory rewardTokens,
      uint256[] memory rewards
    )
  {
    uint256 size = flywheels.length;
    rewards = new uint256[](size);
    rewardTokens = new address[](size);

    for (uint256 i = 0; i < size; i++) {
      uint256 newRewards;
      if (accrue[i]) {
        newRewards = flywheels[i].accrue(market, user);
      } else {
        newRewards = flywheels[i].rewardsAccrued(user);
      }

      // Take the max, because rewards are cumulative.
      rewards[i] = rewards[i] >= newRewards ? rewards[i] : newRewards;

      flywheels[i].claimRewards(user);
      rewardTokens[i] = address(flywheels[i].rewardToken());
    }

    return (flywheels, rewardTokens, rewards);
  }

  function claimRewardsForPool(address user, IonicComptroller comptroller)
    public
    returns (
      IonicFlywheelCore[] memory,
      address[] memory,
      uint256[] memory
    )
  {
    ICErc20[] memory cerc20s = comptroller.getAllMarkets();
    ERC20[] memory markets = new ERC20[](cerc20s.length);
    address[] memory flywheelAddresses = comptroller.getAccruingFlywheels();
    IonicFlywheelCore[] memory flywheels = new IonicFlywheelCore[](flywheelAddresses.length);
    bool[] memory accrue = new bool[](flywheelAddresses.length);

    for (uint256 j = 0; j < flywheelAddresses.length; j++) {
      flywheels[j] = IonicFlywheelCore(flywheelAddresses[j]);
      accrue[j] = true;
    }

    for (uint256 j = 0; j < cerc20s.length; j++) {
      markets[j] = ERC20(address(cerc20s[j]));
    }

    return claimRewardsForMarkets(user, markets, flywheels, accrue);
  }

  function claimRewardsForMarkets(
    address user,
    ERC20[] memory markets,
    IonicFlywheelCore[] memory flywheels,
    bool[] memory accrue
  )
    public
    returns (
      IonicFlywheelCore[] memory,
      address[] memory rewardTokens,
      uint256[] memory rewards
    )
  {
    rewards = new uint256[](flywheels.length);
    rewardTokens = new address[](flywheels.length);

    for (uint256 i = 0; i < flywheels.length; i++) {
      for (uint256 j = 0; j < markets.length; j++) {
        ERC20 market = markets[j];

        uint256 newRewards;
        if (accrue[i]) {
          newRewards = flywheels[i].accrue(market, user);
        } else {
          newRewards = flywheels[i].rewardsAccrued(user);
        }

        // Take the max, because rewards are cumulative.
        rewards[i] = rewards[i] >= newRewards ? rewards[i] : newRewards;
      }

      flywheels[i].claimRewards(user);
      rewardTokens[i] = address(flywheels[i].rewardToken());
    }

    return (flywheels, rewardTokens, rewards);
  }
}
