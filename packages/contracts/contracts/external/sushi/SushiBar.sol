// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

abstract contract SushiBar is IERC20Upgradeable {
  IERC20Upgradeable public sushi;

  // Enter the bar. Pay some SUSHIs. Earn some shares.
  function enter(uint256 _amount) public virtual;

  // Leave the bar. Claim back your SUSHIs.
  function leave(uint256 _share) public virtual;
}
