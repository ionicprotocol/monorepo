// SPDX-License-Identifier: BSD-3-Clause
pragma solidity >=0.8.0;

/**
 * @title ComptrollerCore
 * @dev Storage for the comptroller is at this address, while execution is delegated to the `comptrollerImplementation`.
 * CTokens should reference this contract as their comptroller.
 */
interface IUnitroller {
  function _setPendingImplementation(address newPendingImplementation) external returns (uint256);

  function _setPendingAdmin(address newPendingAdmin) external returns (uint256);
}
