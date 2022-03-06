// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

/// @title Controlled ERC20 Token
/// @notice ERC20 Tokens with a controller for minting & burning
interface ControlledTokenInterface {
  /// @notice Interface to the contract responsible for controlling mint/burn
  function controller() external view returns (address);
}
