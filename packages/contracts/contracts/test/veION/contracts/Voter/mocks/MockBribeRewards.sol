// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "../../../../../veION/interfaces/IBribeRewards.sol";

contract MockBribeRewards is IBribeRewards {
  function deposit(address lpToken, uint256 amount, uint256 tokenId) external override {
    emit Deposit(msg.sender, tokenId, amount);
  }

  function withdraw(address lpToken, uint256 amount, uint256 tokenId) external override {
    emit Withdraw(msg.sender, tokenId, amount);
  }

  function notifyRewardAmount(address token, uint256 amount) external override {
    emit RewardNotification(msg.sender, token, block.timestamp, amount);
  }

  function getReward(uint256 tokenId, address[] memory tokens) external override {
    for (uint256 i = 0; i < tokens.length; i++) {
      emit RewardsClaimed(msg.sender, tokens[i], 0); // Assuming 0 as a placeholder for reward amount
    }
  }

  function getPriorBalanceIndex(
    uint256 tokenId,
    address lpToken,
    uint256 timestamp
  ) external view override returns (uint256) {
    return 0; // Placeholder return value
  }

  function getPriorSupplyIndex(uint256 timestamp, address lpToken) external view override returns (uint256) {
    return 0; // Placeholder return value
  }

  function earned(address token, uint256 tokenId) external view override returns (uint256) {
    return 0; // Placeholder return value
  }
}
