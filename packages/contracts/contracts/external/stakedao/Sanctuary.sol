// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

abstract contract Sanctuary is IERC20Upgradeable {
  IERC20Upgradeable public sdt;

  // Enter the Sanctuary. Pay some SDTs. Earn some shares.
  function enter(uint256 _amount) public virtual;

  // Leave the Sanctuary. Claim back your SDTs.
  function leave(uint256 _share) public virtual;
}
