// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

interface IStakeWallet {
  /// @notice Emitted when tokens are staked
  event Staked(uint256 amount);

  /// @notice Emitted when rewards are claimed
  event Claimed(address indexed from, uint256 rewardAmount);

  /// @notice Emitted when tokens are withdrawn
  event Withdrawn(address indexed withdrawTo, uint256 amount);

  /**
   * @notice Stakes a specified amount of tokens according to the strategy.
   * @param amount The amount of tokens to stake.
   * @param data Additional data required for the staking strategy.
   */
  function stake(address from, uint256 amount, bytes memory data) external;

  /**
   * @notice Claims rewards for the caller.
   */
  function claim(address from) external;

  /**
   * @notice Withdraws a specified amount of staked tokens.
   * @param withdrawTo The address to withdraw tokens to.
   * @param amount The amount of tokens to withdraw.
   */
  function withdraw(address withdrawTo, uint256 amount) external;
}
