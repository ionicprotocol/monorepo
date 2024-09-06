// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IveION {
  struct LockedBalance {
    address tokenAddress;
    int128 amount;
    uint256 start;
    uint256 end;
    bool isPermanent;
    uint256 boost;
  }

  struct UserPoint {
    int128 bias;
    int128 slope; // # -dweight / dt
    uint256 ts;
    uint256 blk; // block
    uint256 permanent;
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
    INCREASE_UNLOCK_TIME
  }

  enum LpTokenType {
    Mode_Velodrome_5050_ION_MODE, // 50/50 ION/MODE on Velodrome
    Mode_Balancer_8020_ION_ETH, // 80/20 ION/ETH on Balancer
    Base_Aerodrome_5050_ION_wstETH, // 50/50 ION/wstETH on Aerodrome
    Base_Balancer_8020_ION_ETH, // 80/20 ION/ETH on Balancer
    Optimism_Velodrome_5050_ION_OP, // 50/50 ION/OP on Velodrome
    Optimism_Balancer_8020_ION_ETH // 80/20 ION/ETH on Balancer
  }

  enum EscrowType {
    NORMAL,
    LOCKED,
    MANAGED
  }

  error NotMinter();
  error LockDurationNotInFuture();
  error ZeroAmount();
  error LockDurationTooLong();
  error TokenNotWhitelisted();
  error NotApprovedOrOwner();
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
    uint256[] memory _duration
  ) external returns (uint256 _tokenId);

  /**
   * @notice Withdraws underlying assets from the veNFT.
   * If unlock time has not passed, uses a formula to unlock early with penalty.
   * @param _tokenId Token ID.
   */
  function withdraw(address _tokenAddress, uint256 _tokenId) external;

  /**
   * @notice Part of xERC20 standard. Intended to be called by a bridge adapter contract.
   * Mints a token cross-chain, initializing it with a set of params that are preserved cross-chain.
   * @param _tokenId Token ID to mint.
   * @param _to Address to mint to.
   * @param _unlockTime Timestamp of unlock (needs to be preserved across chains).
   */
  function mint(uint256 _tokenId, address _to, uint256 _unlockTime) external;

  /**
   * @notice Part of xERC20 standard. Intended to be called by a bridge adapter contract.
   * Burns a token and returns relevant metadata.
   * @param _tokenId Token ID to burn.
   * @return _to Address which owned the token.
   * @return _unlockTime Timestamp of unlock (needs to be preserved across chains).
   */
  function burn(uint256 _tokenId) external returns (address _to, uint256 _unlockTime);

  // TODO: Implement functions for the following operations
  // function addToLock() external;
  // function merge() external;
  // function split() external;
  // function stake() external;
}
