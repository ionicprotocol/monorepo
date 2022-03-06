// SPDX-License-Identifier: BSD-3-Clause
pragma solidity >=0.8.0;

import "./ICToken.sol";

/**
 * @title RewardsDistributor
 * @author Compound
 */
interface IRewardsDistributor {
  /// @dev The token to reward (i.e., COMP)
  function rewardToken() external view returns (address);

  /// @notice The portion of compRate that each market currently receives
  function compSupplySpeeds(address) external view returns (uint256);

  /// @notice The portion of compRate that each market currently receives
  function compBorrowSpeeds(address) external view returns (uint256);

  /// @notice The COMP accrued but not yet transferred to each user
  function compAccrued(address) external view returns (uint256);

  /**
   * @notice Keeps the flywheel moving pre-mint and pre-redeem
   * @dev Called by the Comptroller
   * @param cToken The relevant market
   * @param supplier The minter/redeemer
   */
  function flywheelPreSupplierAction(address cToken, address supplier) external;

  /**
   * @notice Keeps the flywheel moving pre-borrow and pre-repay
   * @dev Called by the Comptroller
   * @param cToken The relevant market
   * @param borrower The borrower
   */
  function flywheelPreBorrowerAction(address cToken, address borrower) external;

  /**
   * @notice Returns an array of all markets.
   */
  function getAllMarkets() external view returns (ICToken[] memory);
}
