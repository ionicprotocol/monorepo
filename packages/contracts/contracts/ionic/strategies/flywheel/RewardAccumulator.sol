// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/access/OwnableUpgradeable.sol";
import "../../../compound/EIP20Interface.sol";

contract RewardAccumulator is OwnableUpgradeable {

  function initialize() external initializer {
    __Ownable_init();
  }

  function approve(address _token, address _spender) external onlyOwner {
    EIP20Interface(_token).approve(_spender, type(uint256).max);
  }
}
