// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IHypernativeOracle } from "../external/hypernative/interfaces/IHypernativeOracle.sol";

contract OracleRegistry {
  bytes32 private constant HYPERNATIVE_ORACLE_STORAGE_SLOT =
    bytes32(uint256(keccak256("eip1967.hypernative.oracle")) - 1);
  bytes32 private constant HYPERNATIVE_ADMIN_STORAGE_SLOT =
    bytes32(uint256(keccak256("eip1967.hypernative.admin")) - 1);
  bytes32 private constant HYPERNATIVE_MODE_STORAGE_SLOT =
    bytes32(uint256(keccak256("eip1967.hypernative.is_strict_mode")) - 1);

  event OracleAdminChanged(address indexed previousAdmin, address indexed newAdmin);
  event OracleAddressChanged(address indexed previousOracle, address indexed newOracle);

  function oracleRegister(address _account) public virtual {
    address oracleAddress = _getAddressBySlot(HYPERNATIVE_ORACLE_STORAGE_SLOT);
    IHypernativeOracle oracle = IHypernativeOracle(oracleAddress);
    if (_hypernativeOracleIsStrictMode()) {
      oracle.registerStrict(_account);
    } else {
      oracle.register(_account);
    }
  }

  /**
   * @dev Admin only function, sets new oracle admin. set to address(0) to revoke oracle
   */
  function _setOracle(address _oracle) internal {
    address oldOracle = _hypernativeOracle();
    _setAddressBySlot(HYPERNATIVE_ORACLE_STORAGE_SLOT, _oracle);
    emit OracleAddressChanged(oldOracle, _oracle);
  }

  function _setIsStrictMode(bool _mode) internal {
    _setValueBySlot(HYPERNATIVE_MODE_STORAGE_SLOT, _mode ? 1 : 0);
  }

  function _changeOracleAdmin(address _newAdmin) internal {
    address oldAdmin = _hypernativeOracleAdmin();
    _setAddressBySlot(HYPERNATIVE_ADMIN_STORAGE_SLOT, _newAdmin);
    emit OracleAdminChanged(oldAdmin, _newAdmin);
  }

  function _setAddressBySlot(bytes32 slot, address newAddress) internal {
    assembly {
      sstore(slot, newAddress)
    }
  }

  function _setValueBySlot(bytes32 _slot, uint256 _value) internal {
    assembly {
      sstore(_slot, _value)
    }
  }

  function _hypernativeOracleAdmin() internal view returns (address) {
    return _getAddressBySlot(HYPERNATIVE_ADMIN_STORAGE_SLOT);
  }

  function _hypernativeOracleIsStrictMode() internal view returns (bool) {
    return _getValueBySlot(HYPERNATIVE_MODE_STORAGE_SLOT) == 1;
  }

  function _getAddressBySlot(bytes32 slot) internal view returns (address addr) {
    assembly {
      addr := sload(slot)
    }
  }

  function _getValueBySlot(bytes32 _slot) internal view returns (uint256 _value) {
    assembly {
      _value := sload(_slot)
    }
  }

  function _hypernativeOracle() internal view returns (address) {
    return _getAddressBySlot(HYPERNATIVE_ORACLE_STORAGE_SLOT);
  }
}
