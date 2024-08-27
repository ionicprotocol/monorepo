// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

abstract contract SafeOwnable is Ownable2Step {
  function renounceOwnership() public override onlyOwner {
    revert("renounce ownership not allowed");
  }
}
