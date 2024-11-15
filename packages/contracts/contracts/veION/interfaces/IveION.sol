// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../stake/IStakeStrategy.sol";

interface IveION {
  struct LockedBalance {
    address tokenAddress;
    uint256 amount;
    uint256 delegateAmount;
    uint256 start;
    uint256 end;
    bool isPermanent;
    uint256 boost;
  }

  struct Delegation {
    uint256 amount;
    uint256 delegatee;
  }

  struct UserPoint {
    uint256 bias;
    uint256 slope; // # -dweight / dt
    uint256 ts;
    uint256 blk; // block
    uint256 permanent;
    uint256 permanentDelegate;
  }

  struct GlobalPoint {
    int128 bias;
    int128 slope; // # -dweight / dt
    uint256 ts;
    uint256 blk; // block
    uint256 permanentLockBalance;
  }

  struct Checkpoint {
    uint256 fromTimestamp;
    address owner;
    uint256 delegatedBalance;
    uint256 delegatee;
  }

  enum DepositType {
    DEPOSIT_FOR_TYPE,
    CREATE_LOCK_TYPE,
    INCREASE_LOCK_AMOUNT,
    INCREASE_UNLOCK_TIME,
    LOCK_ADDITIONAL
  }

  enum LpTokenType {
    Mode_Velodrome_5050_ION_MODE, // 50/50 ION/MODE on Velodrome
    Mode_Balancer_8020_ION_ETH, // 80/20 ION/ETH on Balancer
    Base_Aerodrome_5050_ION_wstETH, // 50/50 ION/wstETH on Aerodrome
    Base_Balancer_8020_ION_ETH, // 80/20 ION/ETH on Balancer
    Optimism_Velodrome_5050_ION_OP, // 50/50 ION/OP on Velodrome
    Optimism_Balancer_8020_ION_ETH // 80/20 ION/ETH on Balancer
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

  /**
   * @notice Mints a veNFT in exchange for tokens provided.
   * @param _tokenAddress Address of the token to use for creating lock. Must be part of whitelisted tokens (i.e. ION/WETH on Velodrome, 80/20 ION/WETH on Balancer).
   * @param _tokenAmount Amount of tokens to lock (must be approved to contract).
   * @param _duration Duration to create lock for (6-24 months).
   * @param _to Optional address who owns the NFT.
   * @return _tokenId Token ID that was minted.
   */
  function createLockFor(
    address[] memory _tokenAddress,
    uint256[] memory _tokenAmount,
    uint256[] memory _duration,
    bool[] memory _stakeUnderlying,
    address _to
  ) external returns (uint256 _tokenId);

  /**
   * @notice Mints a veNFT in exchange for tokens provided.
   * @param _tokenAddress Address of the token to use for creating lock. Must be part of whitelisted tokens (i.e. ION/WETH on Velodrome, 80/20 ION/WETH on Balancer).
   * @param _tokenAmount Amount of tokens to lock (must be approved to contract).
   * @param _duration Duration to create lock for (6-24 months).
   * @return _tokenId Token ID that was minted.
   */
  function createLock(
    address[] memory _tokenAddress,
    uint256[] memory _tokenAmount,
    uint256[] memory _duration,
    bool[] memory _stakeUnderlying
  ) external returns (uint256 _tokenId);

  /**
   * @notice Withdraws underlying assets from the veNFT.
   * If unlock time has not passed, uses a formula to unlock early with penalty.
   * @param _tokenId Token ID.
   */
  function withdraw(address _tokenAddress, uint256 _tokenId) external;

  /**
   * @notice Updates the voting status of a token.
   * @param _tokenId Token ID to update.
   * @param _voting Boolean indicating if the token is voting or not.
   */
  function voting(uint256 _tokenId, bool _voting) external;

  /**
   * @notice Gets the balance of a specific NFT.
   * @param _tokenId Token ID to check.
   */
  function balanceOfNFT(
    uint256 _tokenId
  ) external view returns (address[] memory _assets, uint256[] memory _balances, uint256[] memory _boosts);

  /**
   * @notice Gets value of all lp tokens in ETH for a specific owner.
   * @param _owner Owner to check.
   */
  function getTotalEthValueOfTokens(address _owner) external view returns (uint256 totalValue);
}
