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