// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import "../stake/IStakeStrategy.sol";

/// @title IveION Interface
/// @notice Interface for veION contract
interface IveIONCore {
  /**
   * @notice Creates a new lock for multiple tokens and assigns it to a specified address
   * @param _tokenAddress Array of token addresses to lock
   * @param _tokenAmount Array of token amounts to lock
   * @param _duration Array of lock durations
   * @param _stakeUnderlying Array of booleans indicating whether to stake underlying tokens
   * @param _to Address to assign the lock to
   * @return The ID of the newly created veNFT
   */
  function createLockFor(
    address[] memory _tokenAddress,
    uint256[] memory _tokenAmount,
    uint256[] memory _duration,
    bool[] memory _stakeUnderlying,
    address _to
  ) external returns (uint256);

  /**
   * @notice Creates a new lock for multiple tokens
   * @param _tokenAddress Array of token addresses to lock
   * @param _tokenAmount Array of token amounts to lock
   * @param _duration Array of lock durations
   * @param _stakeUnderlying Array of booleans indicating whether to stake underlying tokens
   * @return The ID of the newly created veNFT
   */
  function createLock(
    address[] calldata _tokenAddress,
    uint256[] calldata _tokenAmount,
    uint256[] calldata _duration,
    bool[] memory _stakeUnderlying
  ) external returns (uint256);

  /**
   * @notice Increases the amount of tokens locked for a specific veNFT
   * @param _tokenAddress Address of the token to increase lock amount for
   * @param _tokenId ID of the veNFT
   * @param _tokenAmount Amount of tokens to add to the lock
   * @param _stakeUnderlying Whether to stake the underlying tokens
   */
  function increaseAmount(
    address _tokenAddress,
    uint256 _tokenId,
    uint256 _tokenAmount,
    bool _stakeUnderlying
  ) external;

  /**
   * @notice Locks additional asset type for an existing veNFT
   * @param _tokenAddress Address of the new token to lock
   * @param _tokenAmount Amount of tokens to lock
   * @param _tokenId ID of the veNFT
   * @param _duration Duration of the lock
   * @param _stakeUnderlying Whether to stake the underlying tokens
   */
  function lockAdditionalAsset(
    address _tokenAddress,
    uint256 _tokenAmount,
    uint256 _tokenId,
    uint256 _duration,
    bool _stakeUnderlying
  ) external;

  /**
   * @notice Increases the lock duration for a specific token in a veNFT
   * @param _tokenAddress Address of the token
   * @param _tokenId ID of the veNFT
   * @param _lockDuration New lock duration to extend to
   */
  function increaseUnlockTime(address _tokenAddress, uint256 _tokenId, uint256 _lockDuration) external;

  /**
   * @notice Delegates voting power from one veNFT to another.
   * @param fromTokenId The ID of the veNFT from which voting power is delegated.
   * @param toTokenId The ID of the veNFT to which voting power is delegated.
   * @param lpToken The address of the LP token associated with the delegation.
   * @param amount The amount of voting power to delegate.
   */
  function delegate(uint256 fromTokenId, uint256 toTokenId, address lpToken, uint256 amount) external;

  /**
   * @notice Removes delegatees from a specific veNFT
   * @param fromTokenId ID of the veNFT from which delegatees are removed
   * @param toTokenIds Array of veNFT IDs that are delegatees to be removed
   * @param lpToken Address of the LP token associated with the delegation
   * @param amounts Array of amounts of voting power to remove from each delegatee
   */
  function removeDelegatees(
    uint256 fromTokenId,
    uint256[] memory toTokenIds,
    address lpToken,
    uint256[] memory amounts
  ) external;

  /**
   * @notice Removes delegators from a specific veNFT
   * @param fromTokenIds Array of veNFT IDs that are delegators to be removed
   * @param toTokenId ID of the veNFT from which delegators are removed
   * @param lpToken Address of the LP token associated with the delegation
   * @param amounts Array of amounts of voting power to remove from each delegator
   */
  function removeDelegators(
    uint256[] memory fromTokenIds,
    uint256 toTokenId,
    address lpToken,
    uint256[] memory amounts
  ) external;

  /**
   * @notice Locks a token permanently.
   * @param _tokenAddress The address of the token to lock.
   * @param _tokenId The ID of the token to lock.
   */
  function lockPermanent(address _tokenAddress, uint256 _tokenId) external;

  /**
   * @notice Unlocks a permanently locked token.
   * @param _tokenAddress The address of the token to unlock.
   * @param _tokenId The ID of the token to unlock.
   */
  function unlockPermanent(address _tokenAddress, uint256 _tokenId) external;

  /**
   * @notice Updates voting status for a veNFT
   * @param _tokenId ID of the veNFT
   * @param _voting Voting status
   */
  function voting(uint256 _tokenId, bool _voting) external;

  /**
   * @notice Sets the implementation addresses for the veION contract extensions.
   * @dev This function can only be called by authorized entities.
   * @param _veIONFirstExtension The address of the first extension contract.
   * @param _veIONSecondExtension The address of the second extension contract.
   */
  function setExtensions(address _veIONFirstExtension, address _veIONSecondExtension) external;
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

interface IAddressesProvider {
  function getAddress(string calldata id) external view returns (address);
}

interface IMasterPriceOracle {
  function price(address underlying) external view returns (uint256);
}
