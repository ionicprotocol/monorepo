// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import "../stake/IStakeStrategy.sol";
import { IveIONStructsEnumsErrorsEvents } from "./IveIONStructsEnumsErrorsEvents.sol";

/// @title IveION Interface
/// @notice Interface for veION contract
interface IveIONSecondExtension is IveIONStructsEnumsErrorsEvents {
  /**
   * @notice Whitelists or removes tokens from the whitelist.
   * @param _tokens An array of token addresses to be whitelisted or removed.
   * @param _isWhitelisted An array of booleans indicating the whitelist status for each token.
   */
  function whitelistTokens(address[] memory _tokens, bool[] memory _isWhitelisted) external;
  /**
   * @notice Withdraws protocol fees for a specific token to a recipient address.
   * @param _tokenAddress The address of the token for which protocol fees are to be withdrawn.
   * @param _recipient The address to which the protocol fees will be sent.
   */
  function withdrawProtocolFees(address _tokenAddress, address _recipient) external;
  /**
   * @notice Withdraws distributed fees for a specific token to a recipient address.
   * @param _tokenAddress The address of the token for which distributed fees are to be withdrawn.
   * @param _recipient The address to which the distributed fees will be sent.
   */
  function withdrawDistributedFees(address _tokenAddress, address _recipient) external;
  /**
   * @notice Toggles the ability to split tokens for a specific account.
   * @param _account The address of the account.
   * @param _isAllowed Boolean indicating if splitting is allowed.
   */
  function toggleSplit(address _account, bool _isAllowed) external;
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
