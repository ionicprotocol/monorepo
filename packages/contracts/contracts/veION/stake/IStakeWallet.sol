// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

interface IStakeWallet {
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
}
