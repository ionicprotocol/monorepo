// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import "../stake/IStakeStrategy.sol";
import { IveIONStructsEnumsErrorsEvents } from "./IveIONStructsEnumsErrorsEvents.sol";

/// @title IveION Interface
/// @notice Interface for veION contract
interface IveIONFirstExtension is IveIONStructsEnumsErrorsEvents {
  /**
   * @notice Withdraws tokens associated with a specific token ID.
   * @param _tokenAddress The address of the token to withdraw.
   * @param _tokenId The ID of the token to withdraw.
   */
  function withdraw(address _tokenAddress, uint256 _tokenId) external;

  /**
   * @notice Merges two token IDs into one.
   * @param _from The ID of the token to merge from.
   * @param _to The ID of the token to merge into.
   */
  function merge(uint256 _from, uint256 _to) external;

  /**
   * @notice Splits a token into two separate tokens.
   * @param _tokenAddress The address of the token to split.
   * @param _from The ID of the token to split.
   * @param _splitAmount The amount to split from the original token.
   * @return _tokenId1 The ID of the first resulting token.
   * @return _tokenId2 The ID of the second resulting token.
   */
  function split(
    address _tokenAddress,
    uint256 _from,
    uint256 _splitAmount
  ) external returns (uint256 _tokenId1, uint256 _tokenId2);

  /**
   * @notice Toggles the ability to split tokens for a specific account.
   * @param _account The address of the account.
   * @param _isAllowed Boolean indicating if splitting is allowed.
   */
  function toggleSplit(address _account, bool _isAllowed) external;

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
   * @notice Claims emissions for a specific token.
   * @param _tokenAddress The address of the token for which to claim emissions.
   */
  function claimEmissions(address _tokenAddress) external;

  /**
   * @notice Allows or blocks delegators for a specific token ID.
   * @param _tokenId The ID of the token.
   * @param _tokenAddress The address of the token.
   * @param _blocked Boolean indicating if delegators are blocked.
   */
  function allowDelegators(uint256 _tokenId, address _tokenAddress, bool _blocked) external;

  /**
   * @notice Toggles the limited boost feature.
   * @param _isBoosted Boolean indicating if the boost is active.
   */
  function toggleLimitedBoost(bool _isBoosted) external;

  /**
   * @notice Sets the amount for a limited time boost.
   * @param _boostAmount The amount of the boost.
   */
  function setLimitedTimeBoost(uint256 _boostAmount) external;

  /**
   * @notice Sets the address of the voter.
   * @param _voter The address of the voter.
   */
  function setVoter(address _voter) external;

  /**
   * @notice Sets the minimum lock amount for a specific token.
   * @param _tokenAddress The address of the token.
   * @param _minimumAmount The minimum amount to lock.
   */
  function setMinimumLockAmount(address _tokenAddress, uint256 _minimumAmount) external;

  /**
   * @notice Sets the minimum lock duration.
   * @param _minimumLockDuration The minimum duration for locking.
   */
  function setMinimumLockDuration(uint256 _minimumLockDuration) external;

  /**
   * @notice Sets the address of the Ionic Pool.
   * @param _ionicPool The address of the Ionic Pool.
   */
  function setIonicPool(address _ionicPool) external;

  /**
   * @notice Sets the address of the Aero Voting contract.
   * @param _aeroVoting The address of the Aero Voting contract.
   */
  function setAeroVoting(address _aeroVoting) external;

  /**
   * @notice Sets the boost amount for Aero Voter.
   * @param _aeroVoterBoost The boost amount for Aero Voter.
   */
  function setAeroVoterBoost(uint256 _aeroVoterBoost) external;

  /**
   * @notice Sets the maximum early withdrawal fee.
   * @param _maxEarlyWithdrawFee The maximum fee for early withdrawal.
   */
  function setMaxEarlyWithdrawFee(uint256 _maxEarlyWithdrawFee) external;

  /**
   * @notice Sets the LP token type for a specific token.
   * @param _token The address of the token.
   * @param _type The LP token type.
   */
  function setLpTokenType(address _token, LpTokenType _type) external;

  /**
   * @notice Sets the stake strategy for a specific LP token type.
   * @param _lpType The LP token type.
   * @param _strategy The stake strategy.
   */
  function setStakeStrategy(LpTokenType _lpType, IStakeStrategy _strategy) external;

  /**
   * @notice Sets the address of the veAERO contract.
   * @param _veAERO The address of the veAERO contract.
   */
  function setVeAERO(address _veAERO) external;

  /**
   * @notice Retrieves the balance of a specific NFT.
   * @param _tokenId The ID of the NFT.
   * @return _assets An array of asset addresses.
   * @return _balances An array of balances for each asset.
   * @return _boosts An array of boost values for each asset.
   */
  function balanceOfNFT(
    uint256 _tokenId
  ) external view returns (address[] memory _assets, uint256[] memory _balances, uint256[] memory _boosts);

  /**
   * @notice Retrieves the lock information for a specific user.
   * @param _tokenId The ID of the token.
   * @param _lpType The LP token type.
   * @return A LockedBalance struct containing lock details.
   */
  function getUserLock(uint256 _tokenId, LpTokenType _lpType) external view returns (LockedBalance memory);

  /**
   * @notice Retrieves the token IDs owned by a specific address.
   * @param _owner The address of the owner.
   * @return An array of token IDs owned by the address.
   */
  function getOwnedTokenIds(address _owner) external view returns (uint256[] memory);

  /**
   * @notice Retrieves the total ETH value of tokens owned by a specific address.
   * @param _owner The address of the owner.
   * @return totalValue The total ETH value of the tokens.
   */
  function getTotalEthValueOfTokens(address _owner) external view returns (uint256 totalValue);

  /**
   * @notice Retrieves the assets locked for a specific token ID.
   * @param _tokenId The ID of the token.
   * @return An array of addresses representing the locked assets.
   */
  function getAssetsLocked(uint256 _tokenId) external view returns (address[] memory);

  /**
   * @notice Retrieves the delegatees for a specific token ID and LP token type.
   * @param _tokenId The ID of the token.
   * @param _lpType The LP token type.
   * @return An array of delegatee IDs.
   */
  function getDelegatees(uint256 _tokenId, LpTokenType _lpType) external view returns (uint256[] memory);

  /**
   * @notice Retrieves the delegators for a specific token ID and LP token type.
   * @param _tokenId The ID of the token.
   * @param _lpType The LP token type.
   * @return An array of delegator IDs.
   */
  function getDelegators(uint256 _tokenId, LpTokenType _lpType) external view returns (uint256[] memory);

  /**
   * @notice Retrieves the user point for a specific token ID, LP token type, and epoch.
   * @param _tokenId The ID of the token.
   * @param _lpType The LP token type.
   * @param _epoch The epoch number.
   * @return A UserPoint struct containing user point details.
   */
  function getUserPoint(uint256 _tokenId, LpTokenType _lpType, uint256 _epoch) external view returns (UserPoint memory);
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
