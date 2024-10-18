// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IHypernativeOracle } from "../external/hypernative/interfaces/IHypernativeOracle.sol";

/**
 * @title OracleProtected
 * @author Ionic Protocol
 * @notice This contract provides modifiers to protect functions against malicious calls.
 * @dev The setOracle function is internal and must be called from a diamond proxy, after
 * this contract is inherited by an extension,which can then use the modifiers to protect 
 * its functions.
 */
abstract contract OracleProtected {
  bytes32 private constant HYPERNATIVE_ORACLE_STORAGE_SLOT =
    bytes32(uint256(keccak256("eip1967.hypernative.oracle")) - 1);
  bytes32 private constant HYPERNATIVE_ADMIN_STORAGE_SLOT =
    bytes32(uint256(keccak256("eip1967.hypernative.admin")) - 1);
  bytes32 private constant HYPERNATIVE_MODE_STORAGE_SLOT =
    bytes32(uint256(keccak256("eip1967.hypernative.is_strict_mode")) - 1);

  event OracleAdminChanged(address indexed previousAdmin, address indexed newAdmin);
  event OracleAddressChanged(address indexed previousOracle, address indexed newOracle);

  error InteractionNotAllowed();

  modifier onlyOracleApproved() {
    address oracleAddress = _getAddressBySlot(HYPERNATIVE_ORACLE_STORAGE_SLOT);
    if (oracleAddress == address(0)) {
      _;
      return;
    }
    IHypernativeOracle oracle = IHypernativeOracle(oracleAddress);
    if (oracle.isBlacklistedContext(msg.sender, tx.origin) || !oracle.isTimeExceeded(msg.sender)) {
      revert InteractionNotAllowed();
    }
    _;
  }

  modifier onlyOracleApprovedAllowEOA() {
    address oracleAddress = _getAddressBySlot(HYPERNATIVE_ORACLE_STORAGE_SLOT);
    if (oracleAddress == address(0)) {
      _;
      return;
    }

    IHypernativeOracle oracle = IHypernativeOracle(oracleAddress);
    if (oracle.isBlacklistedAccount(msg.sender) || msg.sender != tx.origin) {
      revert InteractionNotAllowed();
    }
    _;
  }

  /**
   * @dev Admin only function, sets new oracle admin. set to address(0) to revoke oracle
   * Needs to be called from a diamond proxy 
   */
  function _setOracle(address _oracle) internal {
    address oldOracle = _hypernativeOracle();
    _setAddressBySlot(HYPERNATIVE_ORACLE_STORAGE_SLOT, _oracle);
    emit OracleAddressChanged(oldOracle, _oracle);
  }

  function _setAddressBySlot(bytes32 slot, address newAddress) internal {
    assembly {
      sstore(slot, newAddress)
    }
  }

  function _getAddressBySlot(bytes32 slot) internal view returns (address addr) {
    assembly {
      addr := sload(slot)
    }
  }

  function _hypernativeOracle() internal view returns (address) {
    return _getAddressBySlot(HYPERNATIVE_ORACLE_STORAGE_SLOT);
  }
}
