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
   * @notice Claims emissions for a specific token.
   * @param _tokenAddress The address of the token for which to claim emissions.
   */
  function claimEmissions(address _tokenAddress) external;
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
   * @notice Allows or blocks delegators for a specific token ID.
   * @param _tokenId The ID of the token.
   * @param _tokenAddress The address of the token.
   * @param _blocked Boolean indicating if delegators are blocked.
   */
  function allowDelegators(uint256 _tokenId, address _tokenAddress, bool _blocked) external;
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
   * @notice Retrieves the total ETH value of tokens owned by a specific address.
   * @param _owner The address of the owner.
   * @return totalValue The total ETH value of the tokens.
   */
  function getTotalEthValueOfTokens(address _owner) external view returns (uint256 totalValue);
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
