// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

/**
 * @title IStakeStrategy
 * @notice Interface for the VeloIonModeStakingModeReward contract.
 */
interface IStakeStrategy {
  /// @notice Emitted when the contract is initialized
  event Initialized(
    address indexed escrow,
    address indexed stakingToken,
    address indexed stakingContract,
    address stakingWalletImplementation
  );

  /// @notice Emitted when tokens are staked
  event Staked(address indexed from, uint256 amount, address indexed veloWallet);

  /// @notice Emitted when rewards are claimed
  event Claimed(address indexed from, address indexed veloWallet);

  /// @notice Emitted when tokens are withdrawn
  event Withdrawn(address indexed owner, address indexed withdrawTo, uint256 amount);

  /// @notice Emitted when staking wallet is transferred
  event StakingWalletTransferred(address indexed from, address indexed to, uint256 amount);

  /// @notice Emitted when escrow is set
  event EscrowSet(address indexed newEscrow);

  /// @notice Emitted when staking token is set
  event StakingTokenSet(address indexed newStakingToken);

  /// @notice Emitted when staking contract is set
  event StakingContractSet(address indexed newStakingContract);

  /// @notice Emitted when upgradeable beacon is set
  event UpgradeableBeaconSet(address indexed newBeacon);

  /**
   * @notice Stakes a specified amount of tokens from a given address.
   * @param _from The address from which tokens will be staked.
   * @param _amount The amount of tokens to stake.
   * @param _data Additional data that might be needed for staking.
   */
  function stake(address _from, uint256 _amount, bytes memory _data) external;

  /**
   * @notice Claims rewards for a given address.
   * @param _from The address for which to claim rewards.
   */
  function claim(address _from) external;

  /**
   * @notice Withdraws a specified amount of tokens for a given address.
   * @param _owner The address from which tokens will be withdrawn.
   * @param _amount The amount of tokens to withdraw.
   */
  function withdraw(address _owner, address _withdrawTo, uint256 _amount) external;

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

  /**
   * @notice Returns the address of the staking contract.
   * @return The address of the staking contract.
   */
  function stakingContract() external view returns (address);

  /**
   * @notice Returns the address of the staking token.
   * @return The address of the staking token.
   */
  function stakingToken() external view returns (address);

  /**
   * @notice Returns the staking wallet address for a specific user.
   * @param user The address of the user.
   * @return The address of the user's staking wallet.
   */
  function userStakingWallet(address user) external view returns (address);

  /**
   * @notice Transfers the staking wallet from one user to another.
   * @param from The current owner of the staking wallet.
   * @param to The new owner of the staking wallet.
   */
  function transferStakingWallet(address from, address to, uint256 _amount) external;

  /**
   * @notice Sets the escrow address.
   * @param _escrow The address of the new escrow.
   */
  function setEscrow(address _escrow) external;

  /**
   * @notice Sets the staking token address.
   * @param _stakingToken The address of the new staking token.
   */
  function setStakingToken(address _stakingToken) external;

  /**
   * @notice Sets the staking contract address.
   * @param _stakingContract The address of the new staking contract.
   */
  function setStakingContract(address _stakingContract) external;

  /**
   * @notice Sets the address of the  beacon.
   * @param _beacon The address of the new beacon contract.
   */
  function setUpgradeableBeacon(address _beacon) external;
}
