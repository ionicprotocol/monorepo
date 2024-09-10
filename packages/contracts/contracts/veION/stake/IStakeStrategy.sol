// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

interface IStakeStrategy {
  /**
   * @notice Stakes a specified amount of tokens according to the strategy.
   * @param amount The amount of tokens to stake.
   * @param data Additional data required for the staking strategy.
   */
  function stake(address from, uint256 amount, bytes memory data) external;

  /**
   * @notice Claims rewards for the caller.
   */
  function claim() external;

  /**
   * @notice Returns the current reward rate for the staking strategy.
   * @return The reward rate as a uint256.
   */
  function rewardRate() external view returns (uint256);

  /**
   * @notice Returns the period finish time for the staking strategy.
   * @return The period finish time as a uint256.
   */
  function periodFinish() external view returns (uint256);

  /**
   * @notice Returns the balance of a specific address.
   * @param account The address to query the balance of.
   * @return The balance as a uint256.
   */
  function balanceOf(address account) external view returns (uint256);

  /**
   * @notice Returns the total supply of staked tokens.
   * @return The total supply as a uint256.
   */
  function totalSupply() external view returns (uint256);

  /**
   * @notice Returns the address of the reward token for the staking strategy.
   * @return The address of the reward token.
   */
  function rewardToken() external view returns (address);
}
