// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

interface IveIONStructsEnumsErrorsEvents {
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

  error LockDurationNotInFuture();
  error ZeroAmount();
  error LockDurationTooLong();
  error TokenNotWhitelisted();
  error NotOwner();
  error AlreadyVoted();
  error PermanentLock();
  error NoLockFound();
  error LockExpired();
  error SameNFT();
  error SplitNotAllowed();
  error AmountTooBig();
  error NotPermanentLock();
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
  error BoostAmountMustBeGreaterThanZero();
  error InvalidAddress();
  error MinimumAmountMustBeGreaterThanZero();
  error MinimumLockDurationMustBeGreaterThanZero();
  error AeroBoostAmountMustBeGreaterThanZero();
  error MaxEarlyWithdrawFeeMustBeGreaterThanZero();
  error InvalidTokenAddress();
  error InvalidStrategyAddress();
  error InvalidVeAEROAddress();

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
  event Initialized(address indexed addressesProvider);
  event ExtensionsSet(address indexed _firstExtension, address indexed _secondExtension);
}
