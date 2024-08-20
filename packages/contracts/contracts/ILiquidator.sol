// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ICErc20 } from "./compound/CTokenInterfaces.sol";
import "./liquidators/IRedemptionStrategy.sol";
import "./liquidators/IFundsConversionStrategy.sol";

interface ILiquidator {
  /**
   * borrower The borrower's Ethereum address.
   * repayAmount The amount to repay to liquidate the unhealthy loan.
   * cErc20 The borrowed CErc20 contract to repay.
   * cTokenCollateral The cToken collateral contract to be liquidated.
   * minProfitAmount The minimum amount of profit required for execution (in terms of `exchangeProfitTo`). Reverts if this condition is not met.
   * redemptionStrategies The IRedemptionStrategy contracts to use, if any, to redeem "special" collateral tokens (before swapping the output for borrowed tokens to be repaid via Uniswap).
   * strategyData The data for the chosen IRedemptionStrategy contracts, if any.
   */
  struct LiquidateToTokensWithFlashSwapVars {
    address borrower;
    uint256 repayAmount;
    ICErc20 cErc20;
    ICErc20 cTokenCollateral;
    address flashSwapContract;
    uint256 minProfitAmount;
    IRedemptionStrategy[] redemptionStrategies;
    bytes[] strategyData;
    IFundsConversionStrategy[] debtFundingStrategies;
    bytes[] debtFundingStrategiesData;
  }

  function redemptionStrategiesWhitelist(address strategy) external view returns (bool);

  function safeLiquidate(
    address borrower,
    uint256 repayAmount,
    ICErc20 cErc20,
    ICErc20 cTokenCollateral,
    uint256 minOutputAmount
  ) external returns (uint256);

  function safeLiquidateToTokensWithFlashLoan(LiquidateToTokensWithFlashSwapVars calldata vars)
    external
    returns (uint256);

  function _whitelistRedemptionStrategy(IRedemptionStrategy strategy, bool whitelisted) external;

  function _whitelistRedemptionStrategies(IRedemptionStrategy[] calldata strategies, bool[] calldata whitelisted)
    external;

  function setExpressRelay(address _expressRelay) external;

  function setPoolLens(address _poolLens) external;

  function setHealthFactorThreshold(uint256 _healthFactorThreshold) external;
}
