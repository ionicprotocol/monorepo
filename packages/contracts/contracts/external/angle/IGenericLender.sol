// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

/// @title IGenericLender
/// @author Yearn with slight modifications from Angle Core Team
/// @dev Interface for the `GenericLender` contract, the base interface for contracts interacting
/// with lending and yield farming platforms
interface IGenericLender {
  /// @notice Name of the lender on which funds are invested
  function lenderName() external view returns (string memory);

  /// @notice Returns an estimation of the current Annual Percentage Rate on the lender
  function apr() external view returns (uint256);

  /// @notice Returns an estimation of the current Annual Percentage Rate weighted by the assets under
  /// management of the lender
  function weightedApr() external view returns (uint256);

  /// @notice Withdraws a given amount from lender
  /// @param amount The amount the caller wants to withdraw
  /// @return Amount actually withdrawn
  function withdraw(uint256 amount) external returns (uint256);

  /// @notice Withdraws as much as possible from the lending platform
  /// @return Whether everything was withdrawn or not
  function withdrawAll() external returns (bool);

  /// @notice Returns an estimation of the current Annual Percentage Rate after a new deposit
  /// of `amount`
  /// @param amount Amount to add to the lending platform, and that we want to take into account
  /// in the apr computation
  function aprAfterDeposit(uint256 amount) external view returns (uint256);

  function aprAfterWithdraw(uint256 amount) external view returns (uint256);

  /// @notice Removes tokens from this Strategy that are not the type of tokens
  /// managed by this Strategy. This may be used in case of accidentally
  /// sending the wrong kind of token to this Strategy.
  ///
  /// @param _token The token to transfer out of this poolManager.
  /// @param to Address to send the tokens to.
  function sweep(address _token, address to) external;
}
