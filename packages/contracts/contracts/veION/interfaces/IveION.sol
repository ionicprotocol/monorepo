// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../stake/IStakeStrategy.sol";

/// @title IveION Interface
/// @notice Interface for veION contract
interface IveION {
  /**
   * @notice Structure representing a locked balance
   * @param tokenAddress Address of the token
   * @param amount Amount of tokens locked
   * @param delegateAmount Amount of tokens delegated
   * @param start Start time of the lock
   * @param end End time of the lock
   * @param isPermanent Indicates if the lock is permanent
   * @param boost Boost value for the lock
   */
  struct LockedBalance {
    address tokenAddress;
    uint256 amount;
    uint256 delegateAmount;
    uint256 start;
    uint256 end;
    bool isPermanent;
    uint256 boost;
  }

  /**
   * @notice Structure representing a delegation
   * @param amount Amount of tokens delegated
   * @param delegatee ID of the delegatee
   */
  struct Delegation {
    uint256 amount;
    uint256 delegatee;
  }

  /**
   * @notice Structure representing a user point
   * @param bias Bias value
   * @param slope Slope value, representing -dweight / dt
   * @param ts Timestamp of the point
   * @param blk Block number of the point
   * @param permanent Permanent value
   * @param permanentDelegate Permanent delegate value
   */
  struct UserPoint {
    uint256 bias;
    uint256 slope;
    uint256 ts;
    uint256 blk;
    uint256 permanent;
    uint256 permanentDelegate;
  }

  /**
   * @notice Structure representing a global point
   * @param bias Bias value
   * @param slope Slope value, representing -dweight / dt
   * @param ts Timestamp of the point
   * @param blk Block number of the point
   * @param permanentLockBalance Permanent lock balance
   */
  struct GlobalPoint {
    int128 bias;
    int128 slope;
    uint256 ts;
    uint256 blk;
    uint256 permanentLockBalance;
  }

  /**
   * @notice Structure representing a checkpoint
   * @param fromTimestamp Timestamp from which the checkpoint is valid
   * @param owner Address of the owner
   * @param delegatedBalance Balance that has been delegated
   * @param delegatee ID of the delegatee
   */
  struct Checkpoint {
    uint256 fromTimestamp;
    address owner;
    uint256 delegatedBalance;
    uint256 delegatee;
  }

  /**
   * @notice Enum representing deposit types
   */
  enum DepositType {
    DEPOSIT_FOR_TYPE,
    CREATE_LOCK_TYPE,
    INCREASE_LOCK_AMOUNT,
    INCREASE_UNLOCK_TIME,
    LOCK_ADDITIONAL
  }

  /**
   * @notice Enum representing LP token types
   */
  enum LpTokenType {
    Mode_Velodrome_5050_ION_MODE,
    Mode_Balancer_8020_ION_ETH,
    Base_Aerodrome_5050_ION_wstETH,
    Base_Balancer_8020_ION_ETH,
    Optimism_Velodrome_5050_ION_OP,
    Optimism_Balancer_8020_ION_ETH
  }

  error NotMinter();
  error LockDurationNotInFuture();
  error ZeroAmount();
  error LockDurationTooLong();
  error TokenNotWhitelisted();
  error NotApprovedOrOwner();
  error NotOwner();
  error AlreadyVoted();
  error NotNormalNFT();
  error PermanentLock();
  error LockNotExpired();
  error NoLockFound();
  error LockExpired();
  error SameNFT();
  error SplitNoOwner();
  error SplitNotAllowed();
  error AmountTooBig();
  error NotTeam();
  error NotPermanentLock();
  error ZeroAddress();
  error TokenHasDelegatees();
  error TokenHasDelegators();
  error NotVoter();
  error MinimumNotMet();
  error ArrayMismatch();
  error LockDurationTooShort();
  error DuplicateAsset();
  error SplitTooSmall();
  error NotEnoughRemainingAfterSplit();
  error NoDelegationBetweenTokens(uint256 _tokenId1, uint256 _tokenId2);
  error NoUnderlyingStake();
  error NotAcceptingDelegators();

  event Deposit(
    address indexed provider,
    uint256 indexed tokenId,
    DepositType indexed depositType,
    uint256 value,
    uint256 locktime,
    uint256 ts
  );
  event Withdraw(address indexed provider, uint256 indexed tokenId, uint256 value, uint256 ts);
  event Supply(uint256 prevSupply, uint256 supply);
  event Delegated(uint256 indexed fromTokenId, uint256 indexed toTokenId, address lpToken, uint256 amount);
  event DelegationRemoved(uint256 indexed fromTokenId, uint256 indexed toTokenId, address lpToken, uint256 amount);
  event ProtocolFeesWithdrawn(address indexed tokenAddress, address indexed recipient, uint256 amount);
  event DistributedFeesWithdrawn(address indexed tokenAddress, address indexed recipient, uint256 amount);
  event SplitToggle(address indexed account, bool isAllowed);
  event LimitedBoostToggled(bool isBoosted);
  event LimitedTimeBoostSet(uint256 boostAmount);
  event VoterSet(address indexed newVoter);
  event AeroVotingSet(address indexed newAeroVoting);
  event AeroVoterBoostSet(uint256 newAeroVoterBoost);
  event TokensWhitelisted(address[] token, bool[] isWhitelisted);
  event LpTokenTypeSet(address indexed token, LpTokenType lpTokenType);
  event VeAEROSet(address indexed veAERO);
  event StakeStrategySet(LpTokenType indexed lpTokenType, address indexed strategy);
  event MinimumLockAmountSet(address indexed tokenAddress, uint256 minimumAmount);
  event MinimumLockDurationSet(uint256 minimumDuration);
  event IonicPoolSet(address indexed newIonicPool);
  event SplitCompleted(
    uint256 indexed fromTokenId,
    uint256 indexed tokenId1,
    uint256 indexed tokenId2,
    uint256 splitAmount,
    address tokenAddress
  );
  event MergeCompleted(
    uint256 indexed fromTokenId,
    uint256 indexed toTokenId,
    address[] assetsLocked,
    uint256 lengthOfAssets
  );
  event EmissionsClaimed(address indexed claimant, address indexed tokenAddress);
  event MaxEarlyWithdrawFeeSet(uint256 maxEarlyWithdrawFee);
  event PermanentLockCreated(address indexed tokenAddress, uint256 indexed tokenId, uint256 amount);
  event PermanentLockRemoved(address indexed tokenAddress, uint256 indexed tokenId, uint256 amount);
  event Voted(uint256 _tokenId, bool _voting);
  event DelegatorsBlocked(uint256 indexed _tokenId, address indexed _lpToken, bool _blocked);

  /**
   * @notice Creates a new lock for multiple tokens and assigns it to a specified address
   * @param _lpTypes Array of lp types to lock
   * @param _tokenAmount Array of token amounts to lock
   * @param _duration Array of lock durations
   * @param _stakeUnderlying Array of booleans indicating whether to stake underlying tokens
   * @param _to Address to assign the lock to
   * @return The ID of the newly created veNFT
   */
  function createLockFor(
    LpTokenType[] memory _lpTypes,
    uint256[] memory _tokenAmount,
    uint256[] memory _duration,
    bool[] memory _stakeUnderlying,
    address _to
  ) external returns (uint256);

  /**
   * @notice Creates a new lock for multiple tokens
   * @param _lpTypes Array of lp types to lock
   * @param _tokenAmount Array of token amounts to lock
   * @param _duration Array of lock durations
   * @param _stakeUnderlying Array of booleans indicating whether to stake underlying tokens
   * @return The ID of the newly created veNFT
   */
  function createLock(
    LpTokenType[] memory _lpTypes,
    uint256[] calldata _tokenAmount,
    uint256[] calldata _duration,
    bool[] memory _stakeUnderlying
  ) external returns (uint256);

  /**
   * @notice Increases the amount of tokens locked for a specific veNFT
   * @param _lpType Type of lp token to increase lock amount for
   * @param _tokenId ID of the veNFT
   * @param _tokenAmount Amount of tokens to add to the lock
   * @param _stakeUnderlying Whether to stake the underlying tokens
   */
  function increaseAmount(LpTokenType _lpType, uint256 _tokenId, uint256 _tokenAmount, bool _stakeUnderlying) external;

  /**
   * @notice Locks additional asset type for an existing veNFT
   * @param _lpType Type of the new lp token to lock
   * @param _tokenAmount Amount of tokens to lock
   * @param _tokenId ID of the veNFT
   * @param _duration Duration of the lock
   * @param _stakeUnderlying Whether to stake the underlying tokens
   */
  function lockAdditionalAsset(
    LpTokenType _lpType,
    uint256 _tokenAmount,
    uint256 _tokenId,
    uint256 _duration,
    bool _stakeUnderlying
  ) external;

  /**
   * @notice Increases the lock duration for a specific token in a veNFT
   * @param _lpType Lp token to increase lock time for
   * @param _tokenId ID of the veNFT
   * @param _lockDuration New lock duration to extend to
   */
  function increaseUnlockTime(LpTokenType _lpType, uint256 _tokenId, uint256 _lockDuration) external;

  /**
   * @notice Withdraws underlying assets from the veNFT. If the unlock time has not passed, a penalty fee is applied.
   * @param _lpType Lp token type to withdraw
   * @param _tokenId Token ID of the veNFT to withdraw from
   */
  function withdraw(LpTokenType _lpType, uint256 _tokenId) external;

  /**
   * @notice Merges two veNFTs into one, combining their locked assets
   * @param _from ID of the source veNFT
   * @param _to ID of the destination veNFT
   */
  function merge(uint256 _from, uint256 _to) external;

  /**
   * @notice Splits a veNFT into two separate veNFTs
   * @param _lpType Lp token type to split
   * @param _from ID of the source veNFT
   * @param _splitAmount Amount of tokens to split into new veNFT
   * @return _tokenId1 ID of the original veNFT
   * @return _tokenId2 ID of the new veNFT created from the split
   */
  function split(
    LpTokenType _lpType,
    uint256 _from,
    uint256 _splitAmount
  ) external returns (uint256 _tokenId1, uint256 _tokenId2);

  /**
   * @notice Enables or disables splitting capability for a specific account
   * @param _account Address to toggle split permission for
   * @param _isAllowed Whether splitting should be allowed
   */
  function toggleSplit(address _account, bool _isAllowed) external;

  /**
   * @notice Converts a lock to a permanent lock that cannot be withdrawn
   * @param _lpType Lp token type to lock
   * @param _tokenId ID of the veNFT
   */
  function lockPermanent(LpTokenType _lpType, uint256 _tokenId) external;

  /**
   * @notice Removes permanent lock status from a veNFT
   * @param _lpType Lp token type to unlock
   * @param _tokenId ID of the veNFT
   */
  function unlockPermanent(LpTokenType _lpType, uint256 _tokenId) external;

  /**
   * @notice Delegates voting power from one veNFT to another
   * @param fromTokenId ID of the source veNFT
   * @param toTokenId ID of the destination veNFT
   * @param lpType Lp token type to delegate
   * @param amount Amount of voting power to delegate
   */
  function delegate(uint256 fromTokenId, uint256 toTokenId, LpTokenType lpType, uint256 amount) external;

  /**
   * @notice Removes delegatees from a specific veNFT
   * @param fromTokenId ID of the veNFT from which delegatees are removed
   * @param toTokenIds Array of veNFT IDs that are delegatees to be removed
   * @param lpType Lp token type to remove delegation
   * @param amounts Array of amounts of voting power to remove from each delegatee
   */
  function removeDelegatees(
    uint256 fromTokenId,
    uint256[] memory toTokenIds,
    LpTokenType lpType,
    uint256[] memory amounts
  ) external;

  /**
   * @notice Removes delegators from a specific veNFT
   * @param fromTokenIds Array of veNFT IDs that are delegators to be removed
   * @param toTokenId ID of the veNFT from which delegators are removed
   * @param lpType Lp token type to remove delegation
   * @param amounts Array of amounts of voting power to remove from each delegator
   */
  function removeDelegators(
    uint256[] memory fromTokenIds,
    uint256 toTokenId,
    LpTokenType lpType,
    uint256[] memory amounts
  ) external;

  /**
   * @notice Claims accumulated emissions rewards for staked tokens
   * @param lpType Type of lp token to claim emissions for
   */
  function claimEmissions(LpTokenType lpType) external;

  /**
   * @notice Updates voting status for a veNFT
   * @param _tokenId ID of the veNFT
   * @param _voting Voting status
   */
  function voting(uint256 _tokenId, bool _voting) external;

  /**
   * @notice Withdraws protocol fees collected
   * @param _tokenAddress Address of the token to withdraw fees for
   * @param _recipient Address to receive the fees
   */
  function withdrawProtocolFees(address _tokenAddress, address _recipient) external;

  /**
   * @notice Withdraws distributed fees collected
   * @param _tokenAddress Address of the token to withdraw fees for
   * @param _recipient Address to receive the fees
   */
  function withdrawDistributedFees(address _tokenAddress, address _recipient) external;

  /**
   * @notice Toggles the limited boost feature
   * @param _isBoosted Boolean indicating whether the boost is active
   */
  function toggleLimitedBoost(bool _isBoosted) external;

  /**
   * @notice Sets the limited time boost amount
   * @param _boostAmount The amount of boost to set
   */
  function setLimitedTimeBoost(uint256 _boostAmount) external;

  /**
   * @notice Sets the voter address
   * @param _voter Address of the voter
   */
  function setVoter(address _voter) external;

  /**
   * @notice Sets the minimum lock amount for a specific token
   * @param _tokenAddress Address of the token
   * @param _minimumAmount Minimum amount to lock
   */
  function setMinimumLockAmount(address _tokenAddress, uint256 _minimumAmount) external;

  /**
   * @notice Sets the minimum lock duration
   * @param _minimumLockDuration Minimum duration for locking
   */
  function setMinimumLockDuration(uint256 _minimumLockDuration) external;

  /**
   * @notice Sets the Ionic pool address
   * @param _ionicPool Address of the Ionic pool
   */
  function setIonicPool(address _ionicPool) external;

  /**
   * @notice Sets the Aero voting address
   * @param _aeroVoting Address of the Aero voting
   */
  function setAeroVoting(address _aeroVoting) external;

  /**
   * @notice Sets the Aero voter boost amount
   * @param _aeroVoterBoost Amount of Aero voter boost
   */
  function setAeroVoterBoost(uint256 _aeroVoterBoost) external;

  /**
   * @notice Sets the maximum early withdraw fee
   * @param _maxEarlyWithdrawFee Maximum fee for early withdrawal
   */
  function setMaxEarlyWithdrawFee(uint256 _maxEarlyWithdrawFee) external;

  /**
   * @notice Sets the LP token type
   * @param _token Address of the token
   * @param _type Type of the LP token
   */
  function setLpTokenType(address _token, LpTokenType _type) external;

  /**
   * @notice Sets the stake strategy for a specific LP token type
   * @param _lpType LP token type
   * @param _strategy Address of the stake strategy
   */
  function setStakeStrategy(LpTokenType _lpType, IStakeStrategy _strategy) external;

  /**
   * @notice Sets the veAERO address
   * @param _veAERO Address of the veAERO
   */
  function setVeAERO(address _veAERO) external;

  /**
   * @notice Retrieves the locked balance of a veNFT for a specific LP token type
   * @param _tokenId ID of the veNFT
   * @param _lpType LP token type
   * @return LockedBalance structure of the veNFT
   */
  function getUserLock(uint256 _tokenId, LpTokenType _lpType) external view returns (LockedBalance memory);

  /**
   * @notice Retrieves the list of owned token IDs for a given address
   * @param _owner Address of the token owner
   * @return Array of token IDs
   */
  function getOwnedTokenIds(address _owner) external view returns (uint256[] memory);

  /**
   * @notice Retrieves the total ETH value of locked tokens for a user
   * @param _owner Address of the user
   * @return Total ETH value of locked tokens
   */
  function getTotalEthValueOfTokens(address _owner) external view returns (uint256);

  /**
   * @notice Retrieves the list of assets locked in a veNFT
   * @param _tokenId ID of the veNFT
   * @return Array of asset addresses
   */
  function getAssetsLocked(uint256 _tokenId) external view returns (address[] memory);

  /**
   * @notice Retrieves the list of delegatees for a veNFT and LP token type
   * @param _tokenId ID of the veNFT
   * @param _lpType LP token type
   * @return Array of delegatee token IDs
   */
  function getDelegatees(uint256 _tokenId, LpTokenType _lpType) external view returns (uint256[] memory);

  /**
   * @notice Retrieves the list of delegators for a veNFT and LP token type
   * @param _tokenId ID of the veNFT
   * @param _lpType LP token type
   * @return Array of delegator token IDs
   */
  function getDelegators(uint256 _tokenId, LpTokenType _lpType) external view returns (uint256[] memory);

  /**
   * @notice Retrieves user point history for a veNFT and LP token type
   * @param _tokenId ID of the veNFT
   * @param _lpType LP token type
   * @param _epoch User point epoch
   * @return UserPoint structure
   */
  function getUserPoint(uint256 _tokenId, LpTokenType _lpType, uint256 _epoch) external view returns (UserPoint memory);

  /**
   * @notice Retrieves the balance of NFT assets for a given veNFT
   * @param _tokenId ID of the veNFT
   * @return _assets Array of asset addresses
   * @return _balances Array of corresponding balances for each asset
   * @return _boosts Array of corresponding boosts for each asset
   */
  function balanceOfNFT(
    uint256 _tokenId
  ) external view returns (address[] memory _assets, uint256[] memory _balances, uint256[] memory _boosts);

  struct WithdrawalFactors {
    uint256 daysLocked;
    uint256 daysLeft;
    uint256 timeFactor;
    uint256 veLPLocked;
    uint256 LPInCirculation;
    uint256 ratioFactor;
  }
}

/// @title IAeroVotingEscrow Interface
/// @notice Interface for Aero Voting Escrow contract
interface IAeroVotingEscrow {
  /**
   * @notice Returns the balance of the specified owner.
   * @param _owner The address of the owner.
   * @return The balance of the owner.
   */
  function balanceOf(address _owner) external view returns (uint256);

  /**
   * @notice Retrieves the token ID at a specific index for a given owner.
   * @param _owner The address of the owner.
   * @param _index The index of the token ID in the owner's list.
   * @return The token ID at the specified index.
   */
  function ownerToNFTokenIdList(address _owner, uint256 _index) external view returns (uint256);
}

/// @title IAeroVoter Interface
/// @notice Interface for Aero Voter contract
interface IAeroVoter {
  /**
   * @notice Returns the list of pools voted for by a specific token ID.
   * @param tokenId The ID of the token.
   * @return An array of addresses representing the pools voted for.
   */
  function poolVote(uint256 tokenId) external view returns (address[] memory);

  /**
   * @notice Retrieves the weight of a specific pool.
   * @param pool The address of the pool.
   * @return The weight of the pool.
   */
  function weights(address pool) external view returns (uint256);

  /**
   * @notice Returns the number of votes a specific token ID has for a given pool.
   * @param tokenId The ID of the token.
   * @param pool The address of the pool.
   * @return The number of votes for the pool.
   */
  function votes(uint256 tokenId, address pool) external view returns (uint256);
}
