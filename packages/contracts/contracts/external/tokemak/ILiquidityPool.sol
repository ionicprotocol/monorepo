// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

/// @title Interface for Pool
/// @notice Allows users to deposit ERC-20 tokens to be deployed to market makers.
/// @notice Mints 1:1 fToken on deposit, represeting an IOU for the undelrying token that is freely transferable.
/// @notice Holders of fTokens earn rewards based on duration their tokens were deployed and the demand for that asset.
/// @notice Holders of fTokens can redeem for underlying asset after issuing requestWithdrawal and waiting for the next cycle.
interface ILiquidityPool {
  /// @return Reference to the underlying ERC-20 contract
  function underlyer() external view returns (ERC20Upgradeable);
}
