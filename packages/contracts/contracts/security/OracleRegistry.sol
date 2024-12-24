// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IHypernativeOracle } from "../external/hypernative/interfaces/IHypernativeOracle.sol";
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";

contract OracleRegistry is Ownable2Step {
  bytes32 private constant HYPERNATIVE_ORACLE_STORAGE_SLOT =
    bytes32(uint256(keccak256("eip1967.hypernative.oracle")) - 1);
  bytes32 private constant HYPERNATIVE_MODE_STORAGE_SLOT =
    bytes32(uint256(keccak256("eip1967.hypernative.is_strict_mode")) - 1);

  event OracleAdminChanged(address indexed previousAdmin, address indexed newAdmin);
  event OracleAddressChanged(address indexed previousOracle, address indexed newOracle);

  constructor() Ownable2Step() {}

  function oracleRegister(address _account) public {
    address oracleAddress = hypernativeOracle();
    bool isStrictMode = hypernativeOracleIsStrictMode();
    IHypernativeOracle oracle = IHypernativeOracle(oracleAddress);
    oracle.register(_account, isStrictMode);
  }

  function setOracle(address _oracle) public onlyOwner {
    _setOracle(_oracle);
  }

  function setIsStrictMode(bool _mode) public onlyOwner {
    _setIsStrictMode(_mode);
  }

  function hypernativeOracleIsStrictMode() public view returns (bool) {
    return _getValueBySlot(HYPERNATIVE_MODE_STORAGE_SLOT) == 1;
  }

  function hypernativeOracle() public view returns (address) {
    return _getAddressBySlot(HYPERNATIVE_ORACLE_STORAGE_SLOT);
  }

  /**
   * @dev Admin only function, sets new oracle admin. set to address(0) to revoke oracle
   */
  function _setOracle(address _oracle) internal {
    address oldOracle = hypernativeOracle();
    _setAddressBySlot(HYPERNATIVE_ORACLE_STORAGE_SLOT, _oracle);
    emit OracleAddressChanged(oldOracle, _oracle);
  }

  function _setIsStrictMode(bool _mode) internal {
    _setValueBySlot(HYPERNATIVE_MODE_STORAGE_SLOT, _mode ? 1 : 0);
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
}
