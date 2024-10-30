// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

interface IBribeRewards {
  error InvalidReward();
  error Unauthorized();
  error InvalidGauge();
  error InvalidEscrowToken();
  error SingleTokenExpected();
  error InvalidVotingEscrow();
  error TokenNotWhitelisted();
  error AmountCannotBeZero();

  event Deposit(address indexed user, uint256 indexed tokenId, uint256 amount);
  event Withdraw(address indexed user, uint256 indexed tokenId, uint256 amount);
  event RewardNotification(address indexed user, address indexed rewardToken, uint256 indexed epoch, uint256 amount);
  event RewardsClaimed(address indexed user, address indexed rewardToken, uint256 amount);

  /// @notice Deposit an amount into the bribe rewards contract for a specific veNFT
  /// @dev Can only be called internally by authorized entities.
  /// @param lpToken  Address of the liquidity pool token
  /// @param amount   Amount to be deposited for the veNFT
  /// @param tokenId  Unique identifier of the veNFT
  function deposit(address lpToken, uint256 amount, uint256 tokenId) external;

  /// @notice Withdraw an amount from the bribe rewards contract for a specific veNFT
  /// @dev Can only be called internally by authorized entities.
  /// @param lpToken  Address of the liquidity pool token
  /// @param amount   Amount to be withdrawn for the veNFT
  /// @param tokenId  Unique identifier of the veNFT
  function withdraw(address lpToken, uint256 amount, uint256 tokenId) external;

  /// @notice Claim the rewards earned by a veNFT holder
  /// @param tokenId  Unique identifier of the veNFT
  /// @param tokens   Array of tokens to claim rewards for
  function getReward(uint256 tokenId, address[] memory tokens) external;

  /// @notice Notify the contract about new rewards for stakers
  /// @param token    Address of the reward token
  /// @param amount   Amount of the reward token to be added
  function notifyRewardAmount(address token, uint256 amount) external;

  /// @notice Get the prior balance index for a veNFT at a specific timestamp
  /// @dev Timestamp must be in the past or present.
  /// @param tokenId      The veNFT token ID to check
  /// @param lpToken      Address of the liquidity pool token
  /// @param timestamp    The timestamp to get the balance at
  /// @return The balance index at the given timestamp
  function getPriorBalanceIndex(uint256 tokenId, address lpToken, uint256 timestamp) external view returns (uint256);

  /// @notice Get the prior supply index at a specific timestamp
  /// @dev Timestamp must be in the past or present.
  /// @param timestamp The timestamp to get the supply index at
  /// @return The supply index at the given timestamp
  function getPriorSupplyIndex(uint256 timestamp, address lpToken) external view returns (uint256);

  /// @notice Calculate the rewards earned for a specific token and veNFT
  /// @param token Address of the reward token
  /// @param tokenId Unique identifier of the veNFT
  /// @return Amount of the reward token earned
  function earned(address token, uint256 tokenId) external view returns (uint256);
}
