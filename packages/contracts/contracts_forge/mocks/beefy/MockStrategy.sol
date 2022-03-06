// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import { ERC20 } from "@rari-capital/solmate/src/tokens/ERC20.sol";

contract MockStrategy {
  address public want;

  constructor(address _want) {
    want = _want;
  }

  function balanceOf() public view returns (uint256) {
    return balanceOfWant();
  }

  function balanceOfWant() public view returns (uint256) {
    return ERC20(want).balanceOf(address(this));
  }

  function withdraw(uint256 _amount) public {
    ERC20(want).transfer(msg.sender, _amount);
  }
}
